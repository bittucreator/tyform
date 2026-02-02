import { createClient } from '@/lib/supabase/server'
import { getWorkspaceSubscription } from '@/lib/billing'
import { PLANS, getPlanLimits, hasFeature, getRequiredPlan, type PlanType, type PlanLimits } from './plans'

export interface PlanAccess {
  plan: PlanType
  limits: PlanLimits
  isSubscribed: boolean
  status: 'free' | 'active' | 'trialing' | 'past_due' | 'canceled'
  canUse: (feature: keyof PlanLimits) => boolean
  requiredPlan: (feature: keyof PlanLimits) => PlanType
}

/**
 * Get the current plan access for a workspace
 * Use this in server components and API routes
 */
export async function getWorkspacePlanAccess(workspaceId: string): Promise<PlanAccess> {
  const subscription = await getWorkspaceSubscription(workspaceId)
  
  const plan: PlanType = (subscription?.plan as PlanType) || 'free'
  const status = subscription?.status || 'free'
  const isSubscribed = status === 'active' || status === 'trialing'
  
  // If subscription is not active, fall back to free plan
  const effectivePlan: PlanType = isSubscribed ? plan : 'free'
  const limits = getPlanLimits(effectivePlan)
  
  return {
    plan: effectivePlan,
    limits,
    isSubscribed,
    status: status as PlanAccess['status'],
    canUse: (feature: keyof PlanLimits) => hasFeature(effectivePlan, feature),
    requiredPlan: (feature: keyof PlanLimits) => getRequiredPlan(feature),
  }
}

/**
 * Get plan access for the current user's default workspace
 */
export async function getCurrentPlanAccess(): Promise<PlanAccess | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  // Get user's first form to find workspace
  const { data: form } = await supabase
    .from('forms')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()
  
  if (!form?.workspace_id) {
    // No workspace, return free plan
    return {
      plan: 'free',
      limits: getPlanLimits('free'),
      isSubscribed: false,
      status: 'free',
      canUse: (feature: keyof PlanLimits) => hasFeature('free', feature),
      requiredPlan: (feature: keyof PlanLimits) => getRequiredPlan(feature),
    }
  }
  
  return getWorkspacePlanAccess(form.workspace_id)
}

/**
 * Check if a specific feature is available for a workspace
 */
export async function canUseFeature(workspaceId: string, feature: keyof PlanLimits): Promise<boolean> {
  const access = await getWorkspacePlanAccess(workspaceId)
  return access.canUse(feature)
}

/**
 * Get usage stats for a workspace
 */
export async function getWorkspaceUsage(workspaceId: string): Promise<{
  formCount: number
  responseCount: number
  storageUsedMB: number
  teamMemberCount: number
}> {
  const supabase = await createClient()
  
  // Count forms
  const { count: formCount } = await supabase
    .from('forms')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
  
  // Count responses this month - simplified query
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  // Get form IDs first, then count responses
  const { data: formIds } = await supabase
    .from('forms')
    .select('id')
    .eq('workspace_id', workspaceId)
  
  let responseCount = 0
  if (formIds && formIds.length > 0) {
    const ids = formIds.map(f => f.id)
    const { count } = await supabase
      .from('responses')
      .select('id', { count: 'exact', head: true })
      .in('form_id', ids)
      .gte('created_at', startOfMonth.toISOString())
    responseCount = count || 0
  }
  
  // Team members - count workspace members
  let teamMemberCount = 1
  const { count: memberCount } = await supabase
    .from('workspace_members')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
  if (memberCount) {
    teamMemberCount = memberCount
  }
  
  // Calculate storage from file uploads in Supabase Storage
  // Files are stored in form-uploads bucket with path: formId/questionId/filename
  let storageUsedMB = 0
  if (formIds && formIds.length > 0) {
    try {
      // List files for each form in the workspace
      for (const form of formIds) {
        const { data: files } = await supabase.storage
          .from('form-uploads')
          .list(form.id, { limit: 1000 })
        
        if (files) {
          // For each form folder, we need to list subfolders (questionIds)
          for (const item of files) {
            if (item.id === null) {
              // It's a folder (questionId), list files inside
              const { data: questionFiles } = await supabase.storage
                .from('form-uploads')
                .list(`${form.id}/${item.name}`, { limit: 1000 })
              
              if (questionFiles) {
                for (const file of questionFiles) {
                  if (file.metadata?.size) {
                    storageUsedMB += file.metadata.size / (1024 * 1024)
                  }
                }
              }
            } else if (item.metadata?.size) {
              // It's a file directly under formId
              storageUsedMB += item.metadata.size / (1024 * 1024)
            }
          }
        }
      }
    } catch (error) {
      // Storage calculation failed, return 0 (non-critical)
      console.error('Error calculating storage:', error)
      storageUsedMB = 0
    }
  }
  
  return {
    formCount: formCount || 0,
    responseCount,
    storageUsedMB: Math.round(storageUsedMB * 100) / 100, // Round to 2 decimal places
    teamMemberCount,
  }
}

/**
 * Check if workspace is within plan limits
 */
export async function checkPlanLimits(workspaceId: string): Promise<{
  withinLimits: boolean
  exceededLimits: string[]
}> {
  const access = await getWorkspacePlanAccess(workspaceId)
  const usage = await getWorkspaceUsage(workspaceId)
  const exceededLimits: string[] = []
  
  // Check form limit
  if (access.limits.maxForms !== 'unlimited' && usage.formCount >= access.limits.maxForms) {
    exceededLimits.push('maxForms')
  }
  
  // Check response limit
  if (access.limits.maxResponsesPerMonth !== 'unlimited' && usage.responseCount >= access.limits.maxResponsesPerMonth) {
    exceededLimits.push('maxResponsesPerMonth')
  }
  
  // Check team member limit
  if (access.limits.maxTeamMembers !== 'unlimited' && usage.teamMemberCount >= access.limits.maxTeamMembers) {
    exceededLimits.push('maxTeamMembers')
  }
  
  // Check storage limit
  if (usage.storageUsedMB >= access.limits.maxTotalStorage * 1024) {
    exceededLimits.push('maxTotalStorage')
  }
  
  return {
    withinLimits: exceededLimits.length === 0,
    exceededLimits,
  }
}

// Re-export plan types and helpers
export { PLANS, getPlanLimits, hasFeature, getRequiredPlan, type PlanType, type PlanLimits }
