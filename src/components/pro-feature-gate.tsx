'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Crown } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { usePlanAccess } from '@/lib/use-plan-access'
import type { PlanLimits } from '@/lib/plans'

interface ProFeatureGateProps {
  /** The feature to check access for */
  feature: keyof PlanLimits
  /** Children to render when user has access */
  children: ReactNode
  /** Optional fallback when user doesn't have access (default: upgrade prompt) */
  fallback?: ReactNode
  /** Show as overlay instead of replacing content */
  overlay?: boolean
  /** Custom class name */
  className?: string
  /** Just disable without showing upgrade prompt */
  disableOnly?: boolean
}

/**
 * Gate component that checks if user has access to a Pro feature.
 * Shows an upgrade prompt if they don't have access.
 */
export function ProFeatureGate({
  feature,
  children,
  fallback,
  overlay = false,
  className,
  disableOnly = false,
}: ProFeatureGateProps) {
  const router = useRouter()
  const { canUse, isLoading, getUpgradeMessage, plan } = usePlanAccess()

  // While loading, show children but disabled if it's a form control
  if (isLoading) {
    return <div className={cn("opacity-50 pointer-events-none", className)}>{children}</div>
  }

  const hasAccess = canUse(feature)

  if (hasAccess) {
    return <>{children}</>
  }

  // Custom fallback provided
  if (fallback) {
    return <>{fallback}</>
  }

  // Just disable without upgrade UI
  if (disableOnly) {
    return <div className={cn("opacity-50 pointer-events-none", className)}>{children}</div>
  }

  const upgradeMessage = getUpgradeMessage(feature)

  // Overlay mode - show content with locked overlay
  if (overlay) {
    return (
      <div className={cn("relative", className)}>
        <div className="opacity-40 pointer-events-none blur-[1px]">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
          <div className="text-center p-6 max-w-sm">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-primary" weight="fill" />
            </div>
            <h3 className="font-semibold mb-1">{upgradeMessage?.title || 'Pro Feature'}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {upgradeMessage?.description || 'Upgrade to Pro to unlock this feature.'}
            </p>
            <Button onClick={() => router.push('/billing')} size="sm">
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Default: inline upgrade prompt
  return (
    <div className={cn("flex items-center gap-3 p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5", className)}>
      <Lock className="w-5 h-5 text-primary shrink-0" weight="bold" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{upgradeMessage?.title || 'Pro Feature'}</p>
        <p className="text-xs text-muted-foreground truncate">
          {upgradeMessage?.description || 'Upgrade to unlock'}
        </p>
      </div>
      <Button onClick={() => router.push('/billing')} size="sm" variant="default">
        Upgrade
      </Button>
    </div>
  )
}

/**
 * Badge component that shows "Pro" with lock if user doesn't have access
 */
export function ProBadge({ 
  feature, 
  showLock = true,
  className 
}: { 
  feature: keyof PlanLimits
  showLock?: boolean
  className?: string 
}) {
  const { canUse, isLoading } = usePlanAccess()
  
  if (isLoading) return null
  
  const hasAccess = canUse(feature)
  
  return (
    <Badge 
      className={cn(
        "text-xs px-1.5 py-0.5 font-medium",
        hasAccess 
          ? "bg-green-100 text-green-600" 
          : "bg-pink-100 text-pink-600",
        className
      )}
    >
      {!hasAccess && showLock && <Lock className="w-3 h-3 mr-1" weight="bold" />}
      Pro
    </Badge>
  )
}

/**
 * Hook to check if a pro feature should be disabled
 */
export function useProFeature(feature: keyof PlanLimits) {
  const { canUse, isLoading, plan } = usePlanAccess()
  
  return {
    hasAccess: !isLoading && canUse(feature),
    isLoading,
    isPro: plan === 'pro',
    // Disable during loading to prevent race condition exploits
    shouldDisable: isLoading || !canUse(feature),
  }
}
