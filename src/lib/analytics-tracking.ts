'use client'

interface DeviceInfo {
  device: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
}

interface GeoData {
  country?: string
  city?: string
  region?: string
  latitude?: number
  longitude?: number
}

interface AnalyticsSession {
  formId: string
  startedAt: number
  currentQuestionId: string | null
  questionStartTime: number
  questionTimes: Record<string, number> // questionId -> milliseconds spent
  completedQuestions: string[]
}

// Session storage
let currentSession: AnalyticsSession | null = null

/**
 * Start tracking a form session
 */
export function startFormSession(formId: string): void {
  currentSession = {
    formId,
    startedAt: Date.now(),
    currentQuestionId: null,
    questionStartTime: Date.now(),
    questionTimes: {},
    completedQuestions: [],
  }
}

/**
 * Track when user views a question
 */
export function trackQuestionView(questionId: string): void {
  if (!currentSession) return
  
  const now = Date.now()
  
  // Save time for previous question
  if (currentSession.currentQuestionId) {
    const timeSpent = now - currentSession.questionStartTime
    const prevId = currentSession.currentQuestionId
    currentSession.questionTimes[prevId] = (currentSession.questionTimes[prevId] || 0) + timeSpent
  }
  
  // Start tracking new question
  currentSession.currentQuestionId = questionId
  currentSession.questionStartTime = now
}

/**
 * Track when user completes/answers a question
 */
export function trackQuestionComplete(questionId: string): void {
  if (!currentSession) return
  
  if (!currentSession.completedQuestions.includes(questionId)) {
    currentSession.completedQuestions.push(questionId)
  }
}

/**
 * Get current session data for submission
 */
export function getSessionAnalytics(): {
  startedAt: string
  completedAt: string
  questionTimes: Record<string, number>
  isComplete: boolean
  dropOffQuestionId?: string
} | null {
  if (!currentSession) return null
  
  const now = Date.now()
  
  // Finalize current question time
  if (currentSession.currentQuestionId) {
    const timeSpent = now - currentSession.questionStartTime
    const prevId = currentSession.currentQuestionId
    currentSession.questionTimes[prevId] = (currentSession.questionTimes[prevId] || 0) + timeSpent
  }
  
  // Convert milliseconds to seconds
  const questionTimes: Record<string, number> = {}
  for (const [qId, ms] of Object.entries(currentSession.questionTimes)) {
    questionTimes[qId] = Math.round(ms / 1000)
  }
  
  return {
    startedAt: new Date(currentSession.startedAt).toISOString(),
    completedAt: new Date(now).toISOString(),
    questionTimes,
    isComplete: true,
  }
}

/**
 * Get drop-off data (for partial submissions/page leave)
 */
export function getDropOffData(): {
  startedAt: string
  questionTimes: Record<string, number>
  dropOffQuestionId: string | undefined
  isComplete: boolean
} | null {
  if (!currentSession) return null
  
  const now = Date.now()
  
  // Finalize current question time
  if (currentSession.currentQuestionId) {
    const timeSpent = now - currentSession.questionStartTime
    const prevId = currentSession.currentQuestionId
    currentSession.questionTimes[prevId] = (currentSession.questionTimes[prevId] || 0) + timeSpent
  }
  
  // Convert milliseconds to seconds
  const questionTimes: Record<string, number> = {}
  for (const [qId, ms] of Object.entries(currentSession.questionTimes)) {
    questionTimes[qId] = Math.round(ms / 1000)
  }
  
  return {
    startedAt: new Date(currentSession.startedAt).toISOString(),
    questionTimes,
    dropOffQuestionId: currentSession.currentQuestionId || undefined,
    isComplete: false,
  }
}

/**
 * Clear current session
 */
export function clearSession(): void {
  currentSession = null
}

/**
 * Detect device type from user agent
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return { device: 'desktop', browser: 'unknown', os: 'unknown' }
  }
  
  const ua = navigator.userAgent
  
  // Detect device
  let device: 'desktop' | 'mobile' | 'tablet' = 'desktop'
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = 'tablet'
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    device = 'mobile'
  }
  
  // Detect browser
  let browser = 'unknown'
  if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser'
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera'
  else if (ua.includes('Edg')) browser = 'Edge'
  else if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari')) browser = 'Safari'
  
  // Detect OS
  let os = 'unknown'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  
  return { device, browser, os }
}

/**
 * Fetch geographic data from IP (using a free geo API)
 */
export async function fetchGeoData(): Promise<GeoData> {
  try {
    // Using ipapi.co free tier (1000 requests/day)
    const response = await fetch('https://ipapi.co/json/', {
      cache: 'no-store',
    })
    
    if (!response.ok) return {}
    
    const data = await response.json()
    
    return {
      country: data.country_name,
      city: data.city,
      region: data.region,
      latitude: data.latitude,
      longitude: data.longitude,
    }
  } catch (error) {
    console.warn('Failed to fetch geo data:', error)
    return {}
  }
}

/**
 * Format seconds to human readable time
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  } else {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
}

/**
 * Calculate average time from array of times
 */
export function calculateAverageTime(times: number[]): number {
  if (times.length === 0) return 0
  const sum = times.reduce((a, b) => a + b, 0)
  return Math.round(sum / times.length)
}
