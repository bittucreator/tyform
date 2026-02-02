import type { FormSettings } from '@/types/database'

export interface FormAccessStatus {
  isOpen: boolean
  reason?: 'closed' | 'scheduled' | 'limit_reached' | 'not_started' | 'password_required'
  message: string
  requiresPassword?: boolean
}

/**
 * Check if form is currently accessible based on settings
 */
export function checkFormAccess(
  settings: FormSettings,
  currentSubmissionCount: number = 0,
  passwordVerified: boolean = false
): FormAccessStatus {
  // Check if password protected and not verified
  if (settings.password && !passwordVerified) {
    return {
      isOpen: false,
      reason: 'password_required',
      message: 'This form is password protected.',
      requiresPassword: true,
    }
  }
  
  // Check if manually closed
  if (settings.closeForm) {
    return {
      isOpen: false,
      reason: 'closed',
      message: settings.closedMessage || 'This form is currently closed.',
    }
  }
  
  // Check scheduling - close by date
  if (settings.closeByDate?.enabled && settings.closeByDate.date) {
    const closeDate = new Date(settings.closeByDate.date)
    const now = new Date()
    
    if (now > closeDate) {
      return {
        isOpen: false,
        reason: 'scheduled',
        message: settings.closedByDateMessage || 
          `This form closed on ${closeDate.toLocaleDateString()}.`,
      }
    }
  }
  
  // Check submission limits
  if (settings.closeBySubmissions?.enabled && settings.closeBySubmissions.max) {
    if (currentSubmissionCount >= settings.closeBySubmissions.max) {
      return {
        isOpen: false,
        reason: 'limit_reached',
        message: settings.closedByLimitMessage || 
          'This form has reached its maximum number of responses.',
      }
    }
  }
  
  return {
    isOpen: true,
    message: '',
  }
}

/**
 * Get remaining time until form closes
 */
export function getTimeUntilClose(settings: FormSettings): string | null {
  if (!settings.closeByDate?.enabled || !settings.closeByDate.date) {
    return null
  }
  
  const closeDate = new Date(settings.closeByDate.date)
  const now = new Date()
  const diff = closeDate.getTime() - now.getTime()
  
  if (diff <= 0) return null
  
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`
  return 'Less than a minute'
}

/**
 * Get remaining submissions count
 */
export function getRemainingSubmissions(
  settings: FormSettings,
  currentCount: number
): number | null {
  if (!settings.closeBySubmissions?.enabled || !settings.closeBySubmissions.max) {
    return null
  }
  
  return Math.max(0, settings.closeBySubmissions.max - currentCount)
}

/**
 * Format close date for display
 */
export function formatCloseDate(settings: FormSettings): string | null {
  if (!settings.closeByDate?.enabled || !settings.closeByDate.date) {
    return null
  }
  
  const closeDate = new Date(settings.closeByDate.date)
  return closeDate.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

/**
 * Check if form has password protection
 */
export function isPasswordProtected(settings: FormSettings): boolean {
  return !!settings.password && settings.password.length > 0
}

/**
 * Verify form password
 */
export function verifyFormPassword(settings: FormSettings, inputPassword: string): boolean {
  if (!settings.password) return true
  return settings.password === inputPassword
}
