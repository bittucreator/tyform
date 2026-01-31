'use client'

import type { Question, Json } from '@/types/database'

/**
 * Answer Piping - Replace {{field_id}} placeholders with actual answer values
 * Supports: {{question_id}} and {{question_id.property}} for complex types
 */
export function pipeAnswers(
  text: string,
  questions: Question[],
  answers: Record<string, Json>
): string {
  if (!text) return text
  
  // Match {{anything}} pattern
  const pattern = /\{\{([^}]+)\}\}/g
  
  return text.replace(pattern, (match, fieldRef) => {
    const parts = fieldRef.trim().split('.')
    const questionId = parts[0]
    const property = parts[1]
    
    // Find the question
    const question = questions.find(q => q.id === questionId)
    if (!question) return match // Keep original if question not found
    
    const answer = answers[questionId]
    if (answer === undefined || answer === null) {
      return '' // Return empty if no answer yet
    }
    
    // Handle different question types
    switch (question.type) {
      case 'multiple_choice':
      case 'dropdown':
        // Return the selected option label
        if (typeof answer === 'string') {
          const option = question.properties.options?.find(o => o.value === answer)
          return option?.label || String(answer)
        }
        return String(answer)
        
      case 'checkbox':
        // Return comma-separated labels
        if (Array.isArray(answer)) {
          const labels = answer.map(val => {
            const option = question.properties.options?.find(o => o.value === val)
            return option?.label || String(val)
          })
          return labels.join(', ')
        }
        return String(answer)
        
      case 'ranking':
        // Return ordered list
        if (Array.isArray(answer)) {
          return answer.map((val, i) => `${i + 1}. ${val}`).join(', ')
        }
        return String(answer)
        
      case 'matrix':
        // Handle matrix answers - return JSON or specific cell
        if (typeof answer === 'object' && !Array.isArray(answer) && property) {
          return String((answer as Record<string, unknown>)[property] || '')
        }
        return JSON.stringify(answer)
        
      case 'address':
        // Handle address - return specific field or full address
        if (typeof answer === 'object' && !Array.isArray(answer)) {
          const addr = answer as Record<string, string>
          if (property) {
            return addr[property] || ''
          }
          // Return full formatted address
          return [addr.street, addr.city, addr.state, addr.zip, addr.country]
            .filter(Boolean)
            .join(', ')
        }
        return String(answer)
        
      case 'yes_no':
        return answer ? 'Yes' : 'No'
        
      case 'rating':
        return `${answer}/${question.properties.max || 5}`
        
      case 'nps':
        return String(answer)
        
      case 'slider':
      case 'scale':
      case 'number':
        return String(answer)
        
      case 'date':
        // Format date nicely
        if (typeof answer === 'string') {
          try {
            return new Date(answer).toLocaleDateString()
          } catch {
            return answer
          }
        }
        return String(answer)
        
      default:
        return String(answer)
    }
  })
}

/**
 * Calculator - Evaluate formula with field values
 * Supports: +, -, *, /, (), and {{field_id}} references
 */
export function evaluateFormula(
  formula: string,
  questions: Question[],
  answers: Record<string, Json>
): number | null {
  if (!formula) return null
  
  try {
    // Replace all {{field_id}} with numeric values
    const expression = formula.replace(/\{\{([^}]+)\}\}/g, (match, fieldId) => {
      const answer = answers[fieldId.trim()]
      
      if (answer === undefined || answer === null) {
        return '0' // Treat undefined as 0
      }
      
      // Handle different answer types
      if (typeof answer === 'number') {
        return String(answer)
      }
      
      if (typeof answer === 'string') {
        const num = parseFloat(answer)
        return isNaN(num) ? '0' : String(num)
      }
      
      // For arrays (like checkbox), count selections or sum if numeric
      if (Array.isArray(answer)) {
        const sum = answer.reduce<number>((acc, val) => {
          const num = parseFloat(String(val))
          return acc + (isNaN(num) ? 0 : num)
        }, 0)
        return String(sum || answer.length)
      }
      
      return '0'
    })
    
    // Validate expression - only allow safe characters
    if (!/^[\d\s+\-*/().]+$/.test(expression)) {
      console.warn('Invalid calculator expression:', expression)
      return null
    }
    
    // Evaluate the expression safely
    // Using Function constructor with strict validation
    const result = new Function(`return (${expression})`)()
    
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return result
    }
    
    return null
  } catch (error) {
    console.warn('Calculator evaluation error:', error)
    return null
  }
}

/**
 * Format calculated value with prefix/suffix and decimal places
 */
export function formatCalculatedValue(
  value: number | null,
  options: {
    decimalPlaces?: number
    prefix?: string
    suffix?: string
  } = {}
): string {
  if (value === null) return '—'
  
  const { decimalPlaces = 2, prefix = '', suffix = '' } = options
  const formatted = value.toFixed(decimalPlaces)
  
  return `${prefix}${formatted}${suffix}`
}

/**
 * Extract field references from text (for dependency tracking)
 */
export function extractFieldReferences(text: string): string[] {
  if (!text) return []
  
  const pattern = /\{\{([^}.]+)/g
  const matches: string[] = []
  let match
  
  while ((match = pattern.exec(text)) !== null) {
    matches.push(match[1].trim())
  }
  
  return [...new Set(matches)]
}

/**
 * Check if a question title or description contains piping references
 */
export function hasPipingReferences(question: Question): boolean {
  const pattern = /\{\{[^}]+\}\}/
  return pattern.test(question.title) || pattern.test(question.description || '')
}
