// Plan configuration - similar to Tally's pricing structure

export type PlanType = 'free' | 'pro'

export interface PlanLimits {
  // Form limits
  maxForms: number | 'unlimited'
  maxResponsesPerMonth: number | 'unlimited'
  maxFileUploadSize: number // in MB
  maxTotalStorage: number // in GB
  
  // Features
  removeBranding: boolean
  customDomains: boolean
  customCSS: boolean
  partialSubmissions: boolean
  workspaces: boolean
  collaboration: boolean
  maxTeamMembers: number | 'unlimited'
  
  // Analytics
  basicAnalytics: boolean
  advancedAnalytics: boolean
  dropOffAnalytics: boolean
  
  // Integrations
  webhooks: boolean
  apiAccess: boolean
  googleSheets: boolean
  notion: boolean
  slack: boolean
  discord: boolean
  premiumIntegrations: boolean // Google Analytics, Meta Pixel
  
  // Email
  selfEmailNotifications: boolean
  responderEmailNotifications: boolean
  customEmailDomain: boolean
  
  // Customization
  customThankYouPage: boolean
  customOgImage: boolean
  customFavicon: boolean
  
  // Access control
  passwordProtection: boolean
  closeForms: boolean
  preventDuplicates: boolean
  
  // Business features
  dataRetentionControl: boolean
  emailVerification: boolean
  versionHistoryDays: number
  ssoSaml: boolean
  auditLogs: boolean
  prioritySupport: boolean
  dedicatedManager: boolean
  
  // AI Features
  aiFeatures: boolean
}

export interface PlanInfo {
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  limits: PlanLimits
  popular?: boolean
}

export const PLANS: Record<PlanType, PlanInfo> = {
  free: {
    name: 'Free',
    description: 'Unlimited forms for individuals',
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: {
      // Form limits - generous like Tally
      maxForms: 'unlimited',
      maxResponsesPerMonth: 'unlimited',
      maxFileUploadSize: 10, // 10 MB per file
      maxTotalStorage: 1, // 1 GB total
      
      // Features
      removeBranding: false,
      customDomains: false,
      customCSS: false,
      partialSubmissions: false,
      workspaces: false,
      collaboration: false,
      maxTeamMembers: 1,
      
      // Analytics
      basicAnalytics: true,
      advancedAnalytics: false,
      dropOffAnalytics: false,
      
      // Integrations - free like Tally
      webhooks: true,
      apiAccess: false,
      googleSheets: true,
      notion: true,
      slack: true,
      discord: true,
      premiumIntegrations: false,
      
      // Email
      selfEmailNotifications: true,
      responderEmailNotifications: false,
      customEmailDomain: false,
      
      // Customization
      customThankYouPage: true,
      customOgImage: false,
      customFavicon: false,
      
      // Access control - all free like Tally
      passwordProtection: true,
      closeForms: true,
      preventDuplicates: true,
      
      // Business features
      dataRetentionControl: false,
      emailVerification: false,
      versionHistoryDays: 0,
      ssoSaml: false,
      auditLogs: false,
      prioritySupport: false,
      dedicatedManager: false,
      
      // AI Features
      aiFeatures: false,
    },
  },
  pro: {
    name: 'Pro',
    description: 'For professionals and growing teams',
    monthlyPrice: 20,
    yearlyPrice: 200, // 2 months free
    popular: true,
    limits: {
      // Form limits
      maxForms: 'unlimited',
      maxResponsesPerMonth: 'unlimited',
      maxFileUploadSize: 100, // 100 MB per file (unlimited)
      maxTotalStorage: 10, // 10 GB total
      
      // Features
      removeBranding: true,
      customDomains: true,
      customCSS: true,
      partialSubmissions: true,
      workspaces: true,
      collaboration: true,
      maxTeamMembers: 'unlimited',
      
      // Analytics
      basicAnalytics: true,
      advancedAnalytics: true,
      dropOffAnalytics: true,
      
      // Integrations
      webhooks: true,
      apiAccess: true,
      googleSheets: true,
      notion: true,
      slack: true,
      discord: true,
      premiumIntegrations: true,
      
      // Email
      selfEmailNotifications: true,
      responderEmailNotifications: true,
      customEmailDomain: true,
      
      // Customization
      customThankYouPage: true,
      customOgImage: true,
      customFavicon: true,
      
      // Access control
      passwordProtection: true,
      closeForms: true,
      preventDuplicates: true,
      
      // Business features
      dataRetentionControl: false,
      emailVerification: false,
      versionHistoryDays: 30,
      ssoSaml: false,
      auditLogs: false,
      prioritySupport: true,
      dedicatedManager: false,
      
      // AI Features
      aiFeatures: true,
    },
  },
}

// Feature display groups for billing page
export const FEATURE_GROUPS = {
  free: {
    title: 'Free forever',
    features: [
      'Unlimited forms',
      'Unlimited submissions',
      'Collect payments',
      'Collect signatures',
      'File uploads (10MB/file)',
      'Custom Thank You page',
      'Self email notifications',
      'Redirect on completion',
      'Conditional logic & calculations',
      'Prevent duplicate submissions',
      'Password protect forms',
      'Close forms on limit or date',
      'Answer piping',
      '45+ languages & RTL support',
      'Google Sheets integration',
      'Notion integration',
      'Slack & Discord integration',
      'Webhooks',
    ],
  },
  pro: {
    title: 'Everything in Free, plus:',
    features: [
      'Remove Tyform branding',
      'Custom domains',
      'Unlimited team members',
      'Partial submissions',
      'Advanced customization',
      'Custom CSS',
      'Respondent email notifications',
      'Custom email domains',
      'Customize link preview (OG image)',
      'Workspaces',
      'Unlimited file upload size',
      'Advanced analytics',
      'Drop-off analytics',
      'Version history (30 days)',
      'Google Analytics & Meta Pixel',
      'API access',
      'Priority support',
    ],
  },
}

// Helper to get plan limits
export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLANS[plan].limits
}

// Helper to check if a feature is available for a plan
export function hasFeature(plan: PlanType, feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits(plan)
  const value = limits[feature]
  
  if (typeof value === 'boolean') {
    return value
  }
  if (value === 'unlimited') {
    return true
  }
  if (typeof value === 'number') {
    return value > 0
  }
  return false
}

// Helper to get the minimum required plan for a feature
export function getRequiredPlan(feature: keyof PlanLimits): PlanType {
  if (hasFeature('free', feature)) return 'free'
  return 'pro'
}

// Feature descriptions for upgrade prompts
export const FEATURE_UPGRADE_MESSAGES: Partial<Record<keyof PlanLimits, { title: string; description: string }>> = {
  removeBranding: {
    title: 'Remove Tyform branding',
    description: 'Make your forms truly your own by removing the "Made with Tyform" badge.',
  },
  customDomains: {
    title: 'Custom domains',
    description: 'Host forms on your custom domain for branded, professional links.',
  },
  customCSS: {
    title: 'Custom CSS',
    description: 'Inject custom CSS to fully control your form design.',
  },
  partialSubmissions: {
    title: 'Partial submissions',
    description: 'Capture responses from people who started but didn\'t finish your form.',
  },
  advancedAnalytics: {
    title: 'Advanced analytics',
    description: 'Get extended historical data for visits, duration, and traffic sources.',
  },
  dropOffAnalytics: {
    title: 'Drop-off analytics',
    description: 'See where respondents abandon your form and improve completion rates.',
  },
  responderEmailNotifications: {
    title: 'Respondent notifications',
    description: 'Send customized emails to respondents after they submit.',
  },
  customEmailDomain: {
    title: 'Custom email domain',
    description: 'Send notifications from your own email domain.',
  },
  apiAccess: {
    title: 'API access',
    description: 'Build custom integrations with our REST API.',
  },
  premiumIntegrations: {
    title: 'Premium integrations',
    description: 'Connect Google Analytics and Meta Pixel for conversion tracking.',
  },
  aiFeatures: {
    title: 'AI-Powered Features',
    description: 'Generate forms with AI, get smart insights from responses, and ask questions about your data.',
  },
}
