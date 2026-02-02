'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Lock, Sparkle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { PLANS, type PlanType, type PlanLimits } from '@/lib/plans'

interface UpgradePromptProps {
  feature: keyof PlanLimits
  requiredPlan: PlanType
  title?: string
  description?: string
  className?: string
  variant?: 'inline' | 'card' | 'banner' | 'tooltip'
}

export function UpgradePrompt({
  feature,
  requiredPlan,
  title,
  description,
  className,
  variant = 'card',
}: UpgradePromptProps) {
  const router = useRouter()
  const plan = PLANS[requiredPlan]
  
  const defaultTitles: Partial<Record<keyof PlanLimits, string>> = {
    removeBranding: 'Remove Tyform branding',
    customDomains: 'Custom domains',
    customCSS: 'Custom CSS',
    partialSubmissions: 'Partial submissions',
    advancedAnalytics: 'Advanced analytics',
    dropOffAnalytics: 'Drop-off analytics',
    responderEmailNotifications: 'Respondent notifications',
    customEmailDomain: 'Custom email domain',
    apiAccess: 'API access',
    premiumIntegrations: 'Premium integrations',
    dataRetentionControl: 'Data retention control',
    emailVerification: 'Email verification',
    ssoSaml: 'SSO / SAML',
    auditLogs: 'Audit logs',
  }

  const displayTitle = title || defaultTitles[feature] || 'Upgrade required'
  
  if (variant === 'inline') {
    return (
      <span className={cn("inline-flex items-center gap-1.5", className)}>
        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
        <Badge 
          className="cursor-pointer bg-primary/10 text-primary hover:bg-primary/20"
          onClick={() => router.push('/billing')}
        >
          {plan.name}
        </Badge>
      </span>
    )
  }

  if (variant === 'tooltip') {
    return (
      <div className={cn("p-3 text-sm", className)}>
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4" />
          <span className="font-medium">{displayTitle}</span>
        </div>
        {description && (
          <p className="text-muted-foreground text-xs mb-2">{description}</p>
        )}
        <Button 
          size="sm" 
          className="w-full h-7 text-xs"
          onClick={() => router.push('/billing')}
        >
          Upgrade to {plan.name}
        </Button>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        "flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Crown className="w-4 h-4 text-primary" weight="fill" />
          </div>
          <div>
            <p className="text-sm font-medium">{displayTitle}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <Button size="sm" onClick={() => router.push('/billing')}>
          Upgrade
        </Button>
      </div>
    )
  }

  // Default: card variant
  return (
    <div className={cn(
      "border rounded-xl p-6 text-center bg-muted/30",
      className
    )}>
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-semibold mb-2">{displayTitle}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Badge className="bg-primary/10 text-primary">
          <Sparkle className="w-3 h-3 mr-1" weight="fill" />
          {plan.name} feature
        </Badge>
      </div>
      <Button onClick={() => router.push('/billing')}>
        <Crown className="w-4 h-4 mr-1.5" weight="fill" />
        Upgrade to {plan.name}
      </Button>
    </div>
  )
}

interface FeatureGateProps {
  feature: keyof PlanLimits
  children: React.ReactNode
  fallback?: React.ReactNode
  hasAccess: boolean
  requiredPlan: PlanType
  upgradeTitle?: string
  upgradeDescription?: string
}

/**
 * Conditionally render children based on plan access
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  hasAccess,
  requiredPlan,
  upgradeTitle,
  upgradeDescription,
}: FeatureGateProps) {
  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <UpgradePrompt
      feature={feature}
      requiredPlan={requiredPlan}
      title={upgradeTitle}
      description={upgradeDescription}
    />
  )
}

interface ProBadgeProps {
  plan?: PlanType
  className?: string
}

/**
 * Small badge to indicate a feature requires a paid plan
 */
export function ProBadge({ plan = 'pro', className }: ProBadgeProps) {
  const router = useRouter()
  
  return (
    <Badge 
      className={cn(
        "cursor-pointer text-xs",
        plan === 'pro' && "bg-pink-100 text-pink-600 hover:bg-pink-200",
        plan === 'business' && "bg-blue-100 text-blue-600 hover:bg-blue-200",
        className
      )}
      onClick={() => router.push('/billing')}
    >
      {plan === 'pro' ? 'Pro' : 'Business'}
    </Badge>
  )
}
