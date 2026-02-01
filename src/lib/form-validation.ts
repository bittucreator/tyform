/**
 * Form validation utilities for different question types
 */

import type { Question, Json } from '@/types/database'

export interface ValidationResult {
  isValid: boolean
  error?: string
}

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

// Phone validation - accepts international formats
// Allows: +1234567890, (123) 456-7890, 123-456-7890, 123.456.7890, +1 (123) 456-7890, etc.
const PHONE_REGEX = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/

// URL validation - accepts http, https, and www
const URL_REGEX = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/

// Number validation
const isValidNumber = (value: string, min?: number, max?: number): boolean => {
  const num = parseFloat(value)
  if (isNaN(num)) return false
  if (min !== undefined && num < min) return false
  if (max !== undefined && num > max) return false
  return true
}

/**
 * Validate a single answer based on question type
 */
export function validateAnswer(
  question: Question,
  answer: Json | undefined
): ValidationResult {
  // If not required and empty, always valid
  if (!question.required && (answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0))) {
    return { isValid: true }
  }

  // If required and empty, invalid
  if (question.required && (answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0))) {
    return { isValid: false, error: 'This field is required' }
  }

  const value = String(answer || '')

  switch (question.type) {
    case 'email':
      if (!EMAIL_REGEX.test(value)) {
        return { isValid: false, error: 'Please enter a valid email address' }
      }
      break

    case 'phone':
      // Remove all spaces and check if it has at least 7 digits
      const digitsOnly = value.replace(/\D/g, '')
      if (digitsOnly.length < 7) {
        return { isValid: false, error: 'Please enter a valid phone number' }
      }
      if (!PHONE_REGEX.test(value.replace(/\s/g, ''))) {
        return { isValid: false, error: 'Please enter a valid phone number' }
      }
      break

    case 'url':
      if (!URL_REGEX.test(value)) {
        return { isValid: false, error: 'Please enter a valid URL (e.g., https://example.com)' }
      }
      break

    case 'number':
      const min = question.properties?.min as number | undefined
      const max = question.properties?.max as number | undefined
      if (!isValidNumber(value, min, max)) {
        if (min !== undefined && max !== undefined) {
          return { isValid: false, error: `Please enter a number between ${min} and ${max}` }
        } else if (min !== undefined) {
          return { isValid: false, error: `Please enter a number greater than or equal to ${min}` }
        } else if (max !== undefined) {
          return { isValid: false, error: `Please enter a number less than or equal to ${max}` }
        }
        return { isValid: false, error: 'Please enter a valid number' }
      }
      break

    case 'short_text': {
      const maxLength = question.properties?.maxLength as number | undefined
      if (maxLength !== undefined && value.length > maxLength) {
        return { isValid: false, error: `Please enter no more than ${maxLength} characters` }
      }
      break
    }

    case 'long_text': {
      const maxLenLong = question.properties?.maxLength as number | undefined
      if (maxLenLong !== undefined && value.length > maxLenLong) {
        return { isValid: false, error: `Please enter no more than ${maxLenLong} characters` }
      }
      break
    }

    case 'multiple_choice':
      // Value should be one of the available options
      const mcOptions = question.properties?.options || []
      const validValues = mcOptions.map(opt => opt.value)
      if (!validValues.includes(value)) {
        return { isValid: false, error: 'Please select a valid option' }
      }
      break

    case 'checkbox':
      // Answer should be an array with at least one selection
      if (!Array.isArray(answer) || answer.length === 0) {
        if (question.required) {
          return { isValid: false, error: 'Please select at least one option' }
        }
      }
      break

    case 'dropdown':
      // Value should be one of the available options
      const ddOptions = question.properties?.options || []
      const validDdValues = ddOptions.map(opt => opt.value)
      if (!validDdValues.includes(value)) {
        return { isValid: false, error: 'Please select a valid option' }
      }
      break

    case 'date':
      // Check if it's a valid date
      const dateValue = new Date(value)
      if (isNaN(dateValue.getTime())) {
        return { isValid: false, error: 'Please enter a valid date' }
      }
      break

    case 'rating': {
      const rating = Number(value)
      const maxRating = (question.properties?.max as number) || 5
      if (isNaN(rating) || rating < 1 || rating > maxRating) {
        return { isValid: false, error: 'Please select a rating' }
      }
      break
    }

    case 'scale': {
      const scaleValue = Number(value)
      const scaleMin = (question.properties?.min as number) || 1
      const scaleMax = (question.properties?.max as number) || 10
      if (isNaN(scaleValue) || scaleValue < scaleMin || scaleValue > scaleMax) {
        return { isValid: false, error: `Please select a value between ${scaleMin} and ${scaleMax}` }
      }
      break
    }

    case 'file_upload':
      // Check if files are uploaded
      if (!Array.isArray(answer) || answer.length === 0) {
        if (question.required) {
          return { isValid: false, error: 'Please upload a file' }
        }
      }
      break

    case 'signature':
      // Check if signature is provided
      if (!value || value === '') {
        if (question.required) {
          return { isValid: false, error: 'Please provide your signature' }
        }
      }
      break

    case 'ranking':
      // Check if all items are ranked
      if (!Array.isArray(answer) || answer.length === 0) {
        if (question.required) {
          return { isValid: false, error: 'Please rank all options' }
        }
      }
      break

    case 'calculator':
      // Calculated fields are read-only, always valid
      break

    case 'welcome':
    case 'thank_you':
      // These don't require validation
      break

    default:
      // Unknown type, consider valid
      break
  }

  return { isValid: true }
}

/**
 * Validate all answers in the form
 */
export function validateForm(
  questions: Question[],
  answers: Record<string, Json>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  let isValid = true

  for (const question of questions) {
    if (question.type === 'welcome' || question.type === 'thank_you') {
      continue
    }

    const result = validateAnswer(question, answers[question.id])
    if (!result.isValid && result.error) {
      errors[question.id] = result.error
      isValid = false
    }
  }

  return { isValid, errors }
}
