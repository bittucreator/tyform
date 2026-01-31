'use client'

import type { Json } from '@/types/database'

const STORAGE_PREFIX = 'tyform_partial_'
const EXPIRY_DAYS = 30

interface PartialSubmission {
  formId: string
  answers: Record<string, Json>
  currentIndex: number
  savedAt: number // timestamp
  expiresAt: number // timestamp
}

/**
 * Save partial submission to localStorage
 */
export function savePartialSubmission(
  formId: string,
  answers: Record<string, Json>,
  currentIndex: number
): void {
  if (typeof window === 'undefined') return
  
  const now = Date.now()
  const submission: PartialSubmission = {
    formId,
    answers,
    currentIndex,
    savedAt: now,
    expiresAt: now + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  }
  
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${formId}`,
      JSON.stringify(submission)
    )
  } catch (error) {
    console.warn('Failed to save partial submission:', error)
  }
}

/**
 * Load partial submission from localStorage
 */
export function loadPartialSubmission(
  formId: string
): PartialSubmission | null {
  if (typeof window === 'undefined') return null
  
  try {
    const data = localStorage.getItem(`${STORAGE_PREFIX}${formId}`)
    if (!data) return null
    
    const submission: PartialSubmission = JSON.parse(data)
    
    // Check if expired
    if (submission.expiresAt < Date.now()) {
      clearPartialSubmission(formId)
      return null
    }
    
    return submission
  } catch (error) {
    console.warn('Failed to load partial submission:', error)
    return null
  }
}

/**
 * Clear partial submission from localStorage
 */
export function clearPartialSubmission(formId: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${formId}`)
  } catch (error) {
    console.warn('Failed to clear partial submission:', error)
  }
}

/**
 * Check if there's a saved partial submission
 */
export function hasPartialSubmission(formId: string): boolean {
  return loadPartialSubmission(formId) !== null
}

/**
 * Get time since last save (formatted)
 */
export function getTimeSinceLastSave(formId: string): string | null {
  const submission = loadPartialSubmission(formId)
  if (!submission) return null
  
  const diff = Date.now() - submission.savedAt
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

/**
 * Get all partial submissions (for debugging/admin)
 */
export function getAllPartialSubmissions(): PartialSubmission[] {
  if (typeof window === 'undefined') return []
  
  const submissions: PartialSubmission[] = []
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        const data = localStorage.getItem(key)
        if (data) {
          const submission: PartialSubmission = JSON.parse(data)
          if (submission.expiresAt >= Date.now()) {
            submissions.push(submission)
          }
        }
      }
    }
  } catch (error) {
    console.warn('Failed to get all partial submissions:', error)
  }
  
  return submissions
}

/**
 * Clear all expired partial submissions
 */
export function clearExpiredSubmissions(): void {
  if (typeof window === 'undefined') return
  
  try {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        const data = localStorage.getItem(key)
        if (data) {
          const submission: PartialSubmission = JSON.parse(data)
          if (submission.expiresAt < Date.now()) {
            keysToRemove.push(key)
          }
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.warn('Failed to clear expired submissions:', error)
  }
}
