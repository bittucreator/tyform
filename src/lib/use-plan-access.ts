'use client'

import { useState, useEffect, useCallback } from 'react'
import { getPlanLimits, hasFeature, getRequiredPlan, FEATURE_UPGRADE_MESSAGES, type PlanType, type PlanLimits } from './plans'

interface PlanAccessState {
  plan: PlanType
  limits: PlanLimits
  isSubscribed: boolean
  isLoading: boolean
  canUse: (feature: keyof PlanLimits) => boolean
  requiredPlan: (feature: keyof PlanLimits) => PlanType
  getUpgradeMessage: (feature: keyof PlanLimits) => { title: string; description: string } | undefined
}

/**
 * Client-side hook to get current plan access
 * Fetches subscription status from API
 */
export function usePlanAccess(): PlanAccessState {
  const [plan, setPlan] = useState<PlanType>('free')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadPlan() {
      try {
        // Get workspace
        const wsRes = await fetch('/api/workspaces')
        if (!wsRes.ok) {
          setIsLoading(false)
          return
        }
        
        const wsData = await wsRes.json()
        if (!wsData.workspaces?.length) {
          setIsLoading(false)
          return
        }
        
        const workspaceId = wsData.workspaces[0].id
        
        // Get subscription
        const subRes = await fetch(`/api/billing/subscription?workspaceId=${workspaceId}`)
        if (subRes.ok) {
          const subData = await subRes.json()
          const subscription = subData.subscription
          
          if (subscription) {
            const isActive = subscription.status === 'active' || subscription.status === 'trialing'
            setPlan(isActive ? (subscription.plan as PlanType) : 'free')
            setIsSubscribed(isActive)
          }
        }
      } catch (error) {
        console.error('Failed to load plan:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadPlan()
  }, [])

  const canUse = useCallback((feature: keyof PlanLimits) => {
    return hasFeature(plan, feature)
  }, [plan])

  const requiredPlanFn = useCallback((feature: keyof PlanLimits) => {
    return getRequiredPlan(feature)
  }, [])

  const getUpgradeMessage = useCallback((feature: keyof PlanLimits) => {
    return FEATURE_UPGRADE_MESSAGES[feature]
  }, [])

  return {
    plan,
    limits: getPlanLimits(plan),
    isSubscribed,
    isLoading,
    canUse,
    requiredPlan: requiredPlanFn,
    getUpgradeMessage,
  }
}

/**
 * Hook to check a specific feature and show upgrade prompt if needed
 */
export function useFeatureGate(feature: keyof PlanLimits): {
  hasAccess: boolean
  isLoading: boolean
  requiredPlan: PlanType
  upgradeMessage: { title: string; description: string } | undefined
} {
  const { canUse, requiredPlan, getUpgradeMessage, isLoading } = usePlanAccess()
  
  return {
    hasAccess: canUse(feature),
    isLoading,
    requiredPlan: requiredPlan(feature),
    upgradeMessage: getUpgradeMessage(feature),
  }
}

// Re-export for convenience
export { FEATURE_GROUPS } from './plans'
export type { PlanType, PlanLimits } from './plans'
