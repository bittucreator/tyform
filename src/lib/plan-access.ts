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
  
  // Team members - for now just return 1 (no workspace_members table yet)
  const teamMemberCount = 1
  
  // TODO: Calculate storage from file uploads
  const storageUsedMB = 0
  
  return {
    formCount: formCount || 0,
    responseCount,
    storageUsedMB,
    teamMemberCount: teamMemberCount || 0,
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
