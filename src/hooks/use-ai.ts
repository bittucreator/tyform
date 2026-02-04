'use client'

import { useState, useCallback } from 'react'
import type { Question } from '@/types/database'

interface GeneratedForm {
  title: string
  description: string
  questions: Question[]
}

interface ResponseInsight {
  summary: string
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
  keyThemes: string[]
  actionItems: string[]
  highlights: {
    positive: string[]
    negative: string[]
  }
}

/**
 * Hook for AI form generation
 */
export function useAIFormGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateForm = useCallback(async (
    prompt: string,
    questionCount?: number
  ): Promise<GeneratedForm | null> => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-form',
          prompt,
          questionCount,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate form')
      }
      
      return data.form as GeneratedForm
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed'
      setError(message)
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const suggestQuestions = useCallback(async (
    formTitle: string,
    existingQuestions: Question[]
  ): Promise<Question[]> => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest-questions',
          formTitle,
          questions: existingQuestions,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to suggest questions')
      }
      
      return data.questions as Question[]
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Suggestion failed'
      setError(message)
      return []
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const improveQuestion = useCallback(async (
    question: Question
  ): Promise<{ title: string; description?: string } | null> => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'improve-question',
          question,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to improve question')
      }
      
      return data.improved
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Improvement failed'
      setError(message)
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return {
    isGenerating,
    error,
    generateForm,
    suggestQuestions,
    improveQuestion,
  }
}

/**
 * Hook for AI response insights
 */
export function useAIInsights() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getInsights = useCallback(async (
    formId: string
  ): Promise<ResponseInsight | null> => {
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'insights',
          formId,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get insights')
      }
      
      return data.insights as ResponseInsight
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed'
      setError(message)
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const askQuestion = useCallback(async (
    formId: string,
    question: string
  ): Promise<string | null> => {
    setIsAnalyzing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ask',
          formId,
          question,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer')
      }
      
      return data.answer as string
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Question failed'
      setError(message)
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  return {
    isAnalyzing,
    error,
    getInsights,
    askQuestion,
  }
}
