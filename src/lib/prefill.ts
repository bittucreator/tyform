'use client'

import type { Question, FormSettings, Json } from '@/types/database'

/**
 * Parse URL parameters and map them to question answers
 */
export function getPrefillFromURL(
  questions: Question[],
  settings: FormSettings,
  searchParams: URLSearchParams
): Record<string, Json> {
  const prefilled: Record<string, Json> = {}
  
  if (!settings.enablePrefill) {
    return prefilled
  }
  
  // Use custom mapping if defined
  const mapping = settings.prefillMapping || {}
  
  // Process each URL parameter
  searchParams.forEach((value, key) => {
    // Check if there's a custom mapping for this param
    if (mapping[key]) {
      const questionId = mapping[key]
      const question = questions.find(q => q.id === questionId)
      if (question) {
        prefilled[questionId] = parseValueForQuestion(value, question)
      }
    } else {
      // Try to find question by ID or by matching title
      let question = questions.find(q => q.id === key)
      
      if (!question) {
        // Try to match by title (case-insensitive, sanitized)
        const sanitizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '')
        question = questions.find(q => {
          const sanitizedTitle = q.title.toLowerCase().replace(/[^a-z0-9]/g, '')
          return sanitizedTitle === sanitizedKey
        })
      }
      
      if (question) {
        prefilled[question.id] = parseValueForQuestion(value, question)
      }
    }
  })
  
  return prefilled
}

/**
 * Parse a string value to the appropriate type for a question
 */
function parseValueForQuestion(value: string, question: Question): Json {
  switch (question.type) {
    case 'number':
    case 'rating':
    case 'scale':
    case 'slider':
    case 'nps':
      const num = parseFloat(value)
      return isNaN(num) ? value : num
      
    case 'yes_no':
      return value.toLowerCase() === 'yes' || value === '1' || value.toLowerCase() === 'true'
      
    case 'checkbox':
    case 'ranking':
      // Support comma-separated values
      if (value.includes(',')) {
        return value.split(',').map(v => v.trim())
      }
      return [value]
      
    case 'multiple_choice':
    case 'dropdown':
      // Try to match by option value or label
      const option = question.properties.options?.find(
        o => o.value === value || o.label.toLowerCase() === value.toLowerCase()
      )
      return option?.value || value
      
    case 'date':
      // Try to parse as date and return ISO string
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0]
        }
      } catch {
        // Fall through to return original value
      }
      return value
      
    case 'address':
      // Support JSON format for address
      try {
        const parsed = JSON.parse(value)
        if (typeof parsed === 'object') {
          return parsed
        }
      } catch {
        // Single value goes to street
        return { street: value }
      }
      return value
      
    default:
      return value
  }
}

/**
 * Generate a prefill URL for a form
 */
export function generatePrefillURL(
  baseUrl: string,
  formId: string,
  prefills: Record<string, string | number | boolean>
): string {
  const url = new URL(`/f/${formId}`, baseUrl)
  
  Object.entries(prefills).forEach(([key, value]) => {
    url.searchParams.set(key, String(value))
  })
  
  return url.toString()
}

/**
 * Get prefill documentation for a form (for share panel)
 */
export function getPrefillDocumentation(
  questions: Question[]
): { id: string; title: string; type: string; example: string }[] {
  return questions
    .filter(q => !['welcome', 'thank_you', 'calculator', 'signature'].includes(q.type))
    .map(q => {
      let example = ''
      switch (q.type) {
        case 'short_text':
        case 'long_text':
          example = 'John Doe'
          break
        case 'email':
          example = 'john@example.com'
          break
        case 'number':
          example = '42'
          break
        case 'phone':
          example = '+1234567890'
          break
        case 'url':
          example = 'https://example.com'
          break
        case 'date':
          example = '2024-01-15'
          break
        case 'yes_no':
          example = 'yes'
          break
        case 'rating':
        case 'scale':
          example = '5'
          break
        case 'nps':
          example = '9'
          break
        case 'slider':
          example = '50'
          break
        case 'multiple_choice':
        case 'dropdown':
          example = q.properties.options?.[0]?.value || 'option_1'
          break
        case 'checkbox':
          example = q.properties.options?.slice(0, 2).map(o => o.value).join(',') || 'option_1,option_2'
          break
        default:
          example = 'value'
      }
      
      return {
        id: q.id,
        title: q.title || 'Untitled',
        type: q.type,
        example,
      }
    })
}
