'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CaretDown, CaretUp, Check, Star, FloppyDisk, ArrowCounterClockwise, CalendarBlank } from '@phosphor-icons/react'
import { format, parse } from 'date-fns'
import { cn } from '@/lib/utils'
import { getBackgroundStyle, getButtonRadius, type FormTheme } from '@/lib/themes'
import { 
  shouldShowQuestion, 
  getNextQuestionIndex, 
  getPreviousQuestionIndex,
  getVisibleQuestions 
} from '@/lib/logic'
import { pipeAnswers, evaluateFormula, formatCalculatedValue } from '@/lib/answer-piping'
import { 
  savePartialSubmission, 
  loadPartialSubmission, 
  clearPartialSubmission,
  getTimeSinceLastSave 
} from '@/lib/partial-submissions'
import { getPrefillFromURL } from '@/lib/prefill'
import {
  startFormSession,
  trackQuestionView,
  trackQuestionComplete,
  getSessionAnalytics,
  getDropOffData,
  getDeviceInfo,
  fetchGeoData,
  clearSession,
} from '@/lib/analytics-tracking'
import { FileUpload } from './file-upload'
import { SignatureInput } from './signature-input'
import { RankingInput } from './ranking-input'
import { PoweredByBadge } from './powered-by-badge'
import { GoogleFontLoader } from '@/components/google-font-loader'
import { validateAnswer } from '@/lib/form-validation'
import type { Form, Question, Json } from '@/types/database'

interface FormViewerProps {
  form: Form
  submissionCount?: number
  isPreview?: boolean
}

export function FormViewer({ form, submissionCount = 0, isPreview = false }: FormViewerProps) {
  const searchParams = useSearchParams()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Json>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResumePrompt, setShowResumePrompt] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const geoDataRef = useRef<{ country?: string; city?: string; region?: string; latitude?: number; longitude?: number } | null>(null)
  const analyticsInitialized = useRef(false)

  const questions = form.questions
  const currentQuestion = questions[currentIndex]
  
  // Initialize analytics session (skip in preview mode)
  useEffect(() => {
    if (isPreview) return
    
    if (!analyticsInitialized.current) {
      startFormSession(form.id)
      analyticsInitialized.current = true
      
      // Fetch geo data in background
      fetchGeoData().then(geo => {
        geoDataRef.current = geo
      })
    }
    
    // Track drop-off on page leave
    const handleBeforeUnload = () => {
      if (!isSubmitted) {
        const dropOff = getDropOffData()
        if (dropOff) {
          // Use sendBeacon for reliable delivery on page unload
          const deviceInfo = getDeviceInfo()
          navigator.sendBeacon('/api/analytics/drop-off', JSON.stringify({
            formId: form.id,
            ...dropOff,
            ...deviceInfo,
            ...geoDataRef.current,
          }))
        }
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [form.id, isSubmitted, isPreview])
  
  // Track question views (skip in preview mode)
  useEffect(() => {
    if (isPreview) return
    
    if (currentQuestion) {
      trackQuestionView(currentQuestion.id)
    }
  }, [currentQuestion, isPreview])
  
  // Initialize with prefill from URL and/or partial submission
  useEffect(() => {
    // Check for partial submission first
    if (form.settings.enablePartialSubmissions) {
      const partial = loadPartialSubmission(form.id)
      if (partial && Object.keys(partial.answers).length > 0) {
        setShowResumePrompt(true)
        setLastSaveTime(getTimeSinceLastSave(form.id))
        return
      }
    }
    
    // Then check for URL prefill
    if (form.settings.enablePrefill && searchParams) {
      const prefilled = getPrefillFromURL(questions, form.settings, searchParams)
      if (Object.keys(prefilled).length > 0) {
        setAnswers(prefilled)
      }
    }
  }, [form.id, form.settings, questions, searchParams])
  
  // Auto-save partial submissions
  useEffect(() => {
    if (form.settings.enablePartialSubmissions && Object.keys(answers).length > 0 && !isSubmitted) {
      const timer = setTimeout(() => {
        savePartialSubmission(form.id, answers, currentIndex)
      }, 2000) // Debounce saves
      
      return () => clearTimeout(timer)
    }
  }, [answers, currentIndex, form.id, form.settings.enablePartialSubmissions, isSubmitted])
  
  // Calculate visible questions and progress with logic
  const visibleQuestions = useMemo(() => 
    getVisibleQuestions(questions, answers),
    [questions, answers]
  )
  const currentVisibleIndex = visibleQuestions.findIndex(q => q.id === currentQuestion?.id)
  const progress = visibleQuestions.length > 0 
    ? ((currentVisibleIndex + 1) / visibleQuestions.length) * 100 
    : 0
  
  // Get theme with defaults
  const theme = useMemo((): FormTheme => ({
    primaryColor: form.settings.theme?.primaryColor || '#635BFF',
    backgroundColor: form.settings.theme?.backgroundColor || '#ffffff',
    textColor: form.settings.theme?.textColor || '#1f2937',
    fontFamily: form.settings.theme?.fontFamily || 'Inter',
    buttonStyle: (form.settings.theme as FormTheme)?.buttonStyle || 'rounded',
    backgroundType: (form.settings.theme as FormTheme)?.backgroundType || 'solid',
    backgroundGradient: (form.settings.theme as FormTheme)?.backgroundGradient,
    backgroundImage: (form.settings.theme as FormTheme)?.backgroundImage,
    backgroundLayout: (form.settings.theme as FormTheme)?.backgroundLayout || 'wallpaper',
    gradientStart: (form.settings.theme as FormTheme)?.gradientStart,
    gradientEnd: (form.settings.theme as FormTheme)?.gradientEnd,
    questionAlignment: (form.settings.theme as FormTheme)?.questionAlignment || 'left',
  }), [form.settings.theme])

  // Generate theme styles
  const themeStyles = useMemo(() => ({
    ...getBackgroundStyle(theme),
    fontFamily: theme.fontFamily,
    color: theme.textColor,
    '--form-primary': theme.primaryColor,
    '--form-text': theme.textColor,
    '--form-bg': theme.backgroundColor,
  } as React.CSSProperties), [theme])

  const canGoNext = useCallback(() => {
    if (!currentQuestion) return false
    if (currentQuestion.type === 'welcome') return true
    if (currentQuestion.type === 'thank_you') return false
    
    const answer = answers[currentQuestion.id]
    
    // If not required and empty, can proceed
    if (!currentQuestion.required && (answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0))) {
      setValidationError(null)
      return true
    }
    
    // Run validation
    const validation = validateAnswer(currentQuestion, answer as Json)
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid input')
      return false
    }
    
    setValidationError(null)
    return true
  }, [currentQuestion, answers])

  // Resume or start fresh handlers
  const handleResume = useCallback(() => {
    const partial = loadPartialSubmission(form.id)
    if (partial) {
      setAnswers(partial.answers)
      setCurrentIndex(partial.currentIndex)
    }
    setShowResumePrompt(false)
  }, [form.id])

  const handleStartFresh = useCallback(() => {
    clearPartialSubmission(form.id)
    // Apply URL prefill if enabled
    if (form.settings.enablePrefill && searchParams) {
      const prefilled = getPrefillFromURL(questions, form.settings, searchParams)
      if (Object.keys(prefilled).length > 0) {
        setAnswers(prefilled)
      }
    }
    setShowResumePrompt(false)
  }, [form.id, form.settings, questions, searchParams])

  const handleSubmit = useCallback(async () => {
    // In preview mode, just show the thank you screen without actually submitting
    if (isPreview) {
      setIsSubmitted(true)
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Get analytics data
      const sessionAnalytics = getSessionAnalytics()
      const deviceInfo = getDeviceInfo()
      
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: form.id,
          answers,
          metadata: {
            userAgent: navigator.userAgent,
            // Analytics data
            ...(sessionAnalytics || {}),
            ...deviceInfo,
            ...(geoDataRef.current || {}),
          },
        }),
      })
      
      if (response.ok) {
        setIsSubmitted(true)
        // Clear partial submission on successful submit
        clearPartialSubmission(form.id)
        // Clear analytics session
        clearSession()
      } else {
        console.error('Submit failed:', await response.json())
      }
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [form.id, answers, isPreview])

  const handleNext = useCallback(() => {
    const nextIndex = getNextQuestionIndex(currentIndex, questions, answers)
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex)
    } else {
      handleSubmit()
    }
  }, [currentIndex, questions, answers, handleSubmit])

  const handlePrevious = () => {
    const prevIndex = getPreviousQuestionIndex(currentIndex, questions, answers)
    setCurrentIndex(prevIndex)
    setValidationError(null) // Clear validation error when going back
  }

  const setAnswer = (questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value as Json }))
    setValidationError(null) // Clear validation error when answer changes
    // Track that this question was answered (skip in preview mode)
    if (!isPreview) {
      trackQuestionComplete(questionId)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (canGoNext()) handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canGoNext, handleNext])

  // Show resume prompt for partial submissions
  if (showResumePrompt) {
    return (
      <>
        <GoogleFontLoader font={theme.fontFamily} />
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={themeStyles}
        >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg"
        >
          <div 
            className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${theme.primaryColor}20` }}
          >
            <FloppyDisk className="h-8 w-8" style={{ color: theme.primaryColor }} />
          </div>
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ color: theme.textColor }}
          >
            {form.settings.partialSubmissionMessage || 'Welcome back!'}
          </h1>
          <p 
            className="text-base mb-6"
            style={{ color: theme.textColor, opacity: 0.7 }}
          >
            You have a saved response from {lastSaveTime || 'earlier'}. Would you like to continue where you left off?
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleStartFresh}
              className="gap-2"
              style={{ 
                borderColor: `${theme.textColor}30`,
                color: theme.textColor,
              }}
            >
              <ArrowCounterClockwise className="h-4 w-4" />
              Start Fresh
            </Button>
            <Button
              onClick={handleResume}
              className="gap-2"
              style={{ backgroundColor: theme.buttonColor || theme.primaryColor, color: theme.buttonTextColor || '#ffffff' }}
            >
              <FloppyDisk className="h-4 w-4" />
              Continue
            </Button>
          </div>
        </motion.div>
      </div>
      </>
    )
  }

  if (isSubmitted || (currentQuestion?.type === 'thank_you')) {
    const thankYouQuestion = questions.find((q) => q.type === 'thank_you')
    const thankYou = thankYouQuestion || {
      title: 'Thank you!',
      description: 'Your response has been recorded.',
      properties: {},
    }
    const thankYouProps = (thankYou as Question).properties || {}

    return (
      <>
        <GoogleFontLoader font={theme.fontFamily} />
        <div
          className="min-h-screen flex flex-col items-center justify-center p-4"
          style={themeStyles}
        >
        {/* Cover Image - Landscape banner */}
        {thankYouProps.coverImage && (
          <div className="w-full max-w-2xl mb-8">
            <img
              src={thankYouProps.coverImage}
              alt="Cover"
              className="w-full h-40 md:h-56 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg"
        >
          {/* Screen Image - Centered (replaces check icon if provided) */}
          {thankYouProps.screenImage ? (
            <div className="flex justify-center mb-6">
              <img
                src={thankYouProps.screenImage}
                alt="Thank you"
                className="max-w-36 max-h-36 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          ) : (
            <div 
              className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${theme.primaryColor}20` }}
            >
              <Check className="h-8 w-8" style={{ color: theme.primaryColor }} />
            </div>
          )}
          <h1 
            className="text-3xl font-bold mb-4"
            style={{ color: theme.textColor }}
          >
            {thankYou.title}
          </h1>
          <p 
            className="text-lg"
            style={{ color: theme.textColor, opacity: 0.7 }}
          >
            {thankYou.description}
          </p>
        </motion.div>
      </div>
      </>
    )
  }

  // Render progress bar
  const renderProgressBar = () => (
    form.settings.showProgressBar && currentQuestion?.type !== 'welcome' && (
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 w-full" style={{ backgroundColor: `${theme.primaryColor}20` }}>
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${progress}%`,
              backgroundColor: theme.primaryColor 
            }}
          />
        </div>
      </div>
    )
  )

  // Render navigation buttons
  const renderNavigation = () => (
    currentQuestion?.type !== 'welcome' && (
      <div className="fixed bottom-6 right-6 flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          style={{ 
            borderColor: `${theme.textColor}30`,
            color: theme.textColor,
          }}
        >
          <CaretUp className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={!canGoNext()}
          style={{ 
            borderColor: `${theme.textColor}30`,
            color: theme.textColor,
          }}
        >
          <CaretDown className="h-4 w-4" />
        </Button>
      </div>
    )
  )

  // Render main content
  const renderContent = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuestion?.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <QuestionRenderer
          question={currentQuestion}
          questions={questions}
          answers={answers}
          answer={answers[currentQuestion?.id]}
          setAnswer={(value) => setAnswer(currentQuestion?.id, value)}
          questionNumber={form.settings.showQuestionNumbers ? currentVisibleIndex + 1 : undefined}
          theme={theme}
          formId={form.id}
          onNext={handleNext}
          canGoNext={canGoNext()}
          isSubmitting={isSubmitting}
          isLastQuestion={getNextQuestionIndex(currentIndex, questions, answers) >= questions.length}
          validationError={validationError}
        />
      </motion.div>
    </AnimatePresence>
  )

  // Stack Layout: Image on top, content below
  if (theme.backgroundType === 'image' && theme.backgroundImage && theme.backgroundLayout === 'stack') {
    return (
      <>
        <GoogleFontLoader font={theme.fontFamily} />
        <div 
          className="min-h-screen flex flex-col"
          style={{ 
            backgroundColor: theme.backgroundColor,
            fontFamily: theme.fontFamily,
            color: theme.textColor,
          }}
        >
        {renderProgressBar()}
        
        {/* Image at top */}
        <div 
          className="h-64 md:h-80 w-full bg-cover bg-center shrink-0"
          style={{ backgroundImage: `url(${theme.backgroundImage})` }}
        />
        
        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-2xl">
            {renderContent()}
          </div>
        </div>

        {renderNavigation()}
        
        {form.settings.showPoweredBy !== false && (
          <PoweredByBadge theme={theme} />
        )}
      </div>
      </>
    )
  }

  // Split Layout: Image on left, content on right
  if (theme.backgroundType === 'image' && theme.backgroundImage && theme.backgroundLayout === 'split') {
    return (
      <>
        <GoogleFontLoader font={theme.fontFamily} />
        <div 
          className="min-h-screen flex"
          style={{ 
            fontFamily: theme.fontFamily,
            color: theme.textColor,
          }}
        >
        {renderProgressBar()}
        
        {/* Image on left - hidden on mobile */}
        <div 
          className="hidden md:block w-1/2 min-h-screen bg-cover bg-center"
          style={{ backgroundImage: `url(${theme.backgroundImage})` }}
        />
        
        {/* Content on right */}
        <div 
          className="w-full md:w-1/2 min-h-screen flex flex-col"
          style={{ backgroundColor: theme.backgroundColor }}
        >
          <div className="flex-1 flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-xl">
              {renderContent()}
            </div>
          </div>
        </div>

        {renderNavigation()}
        
        {form.settings.showPoweredBy !== false && (
          <PoweredByBadge theme={theme} />
        )}
      </div>
      </>
    )
  }

  // Wallpaper Layout (default): Full background image
  return (
    <>
      <GoogleFontLoader font={theme.fontFamily} />
      <div 
        className="min-h-screen flex flex-col"
        style={themeStyles}
      >
      {/* Progress bar */}
      {form.settings.showProgressBar && currentQuestion?.type !== 'welcome' && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 w-full" style={{ backgroundColor: `${theme.primaryColor}20` }}>
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${progress}%`,
                backgroundColor: theme.primaryColor 
              }}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion?.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QuestionRenderer
                question={currentQuestion}
                questions={questions}
                answers={answers}
                answer={answers[currentQuestion?.id]}
                setAnswer={(value) => setAnswer(currentQuestion?.id, value)}
                questionNumber={form.settings.showQuestionNumbers ? currentVisibleIndex + 1 : undefined}
                theme={theme}
                formId={form.id}
                onNext={handleNext}
                canGoNext={canGoNext()}
                isSubmitting={isSubmitting}
                isLastQuestion={getNextQuestionIndex(currentIndex, questions, answers) >= questions.length}
                validationError={validationError}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      {currentQuestion?.type !== 'welcome' && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            style={{ 
              borderColor: `${theme.textColor}30`,
              color: theme.textColor,
            }}
          >
            <CaretUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={!canGoNext()}
            style={{ 
              borderColor: `${theme.textColor}30`,
              color: theme.textColor,
            }}
          >
            <CaretDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Powered by Tyform badge - shown for free users */}
      {form.settings.showPoweredBy !== false && (
        <PoweredByBadge theme={theme} />
      )}
    </div>
    </>
  )
}

interface QuestionRendererProps {
  question: Question
  questions: Question[]
  answers: Record<string, Json>
  answer: unknown
  setAnswer: (value: unknown) => void
  questionNumber?: number
  theme: FormTheme
  formId: string
  onNext: () => void
  canGoNext: boolean
  isSubmitting: boolean
  isLastQuestion: boolean
  validationError?: string | null
}

function QuestionRenderer({
  question,
  questions,
  answers,
  answer,
  setAnswer,
  questionNumber,
  theme,
  formId,
  onNext,
  canGoNext,
  isSubmitting,
  isLastQuestion,
  validationError,
}: QuestionRendererProps) {
  if (!question) return null

  const buttonRadius = getButtonRadius(theme.buttonStyle)
  
  // Apply answer piping to title and description
  const pipedTitle = pipeAnswers(question.title, questions, answers)
  const pipedDescription = question.description 
    ? pipeAnswers(question.description, questions, answers) 
    : undefined

  // Welcome screen
  if (question.type === 'welcome') {
    return (
      <div className="text-center">
        {/* Cover Image - Landscape banner */}
        {question.properties.coverImage && (
          <div className="mb-8 -mx-4 md:-mx-8">
            <img
              src={question.properties.coverImage}
              alt="Cover"
              className="w-full h-40 md:h-56 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}
        
        {/* Screen Image - Centered */}
        {question.properties.screenImage && (
          <div className="flex justify-center mb-6">
            <img
              src={question.properties.screenImage}
              alt="Screen"
              className="max-w-36 max-h-36 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}
        
        <h1 
          className="text-4xl md:text-5xl font-bold mb-6"
          style={{ color: theme.textColor }}
        >
          {pipedTitle}
        </h1>
        {pipedDescription && (
          <p 
            className="text-xl mb-8"
            style={{ color: theme.textColor, opacity: 0.7 }}
          >
            {pipedDescription}
          </p>
        )}
        <button 
          onClick={onNext}
          className="px-6 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ 
            backgroundColor: theme.buttonColor || theme.primaryColor,
            color: theme.buttonTextColor || '#ffffff',
            borderRadius: buttonRadius,
          }}
        >
          {question.properties.buttonText || 'Start'}
          <span className="ml-2 text-xs opacity-70">Press Enter ↵</span>
        </button>
      </div>
    )
  }
  
  // Calculator type - compute and display value
  if (question.type === 'calculator') {
    const calculatedValue = evaluateFormula(
      question.properties.formula || '',
      questions,
      answers
    )
    const formattedValue = formatCalculatedValue(calculatedValue, {
      decimalPlaces: question.properties.decimalPlaces,
      prefix: question.properties.prefix,
      suffix: question.properties.suffix,
    })
    
    return (
      <div>
        <div className="mb-8">
          {questionNumber && (
            <span 
              className="text-sm font-medium mb-2 block"
              style={{ color: theme.textColor, opacity: 0.5 }}
            >
              {questionNumber}
            </span>
          )}
          <h2 
            className="text-2xl md:text-3xl font-semibold mb-2"
            style={{ color: theme.textColor }}
          >
            {pipedTitle}
          </h2>
          {pipedDescription && (
            <p 
              className="text-lg"
              style={{ color: theme.textColor, opacity: 0.7 }}
            >
              {pipedDescription}
            </p>
          )}
        </div>
        
        <div 
          className="text-4xl md:text-5xl font-bold mb-8 p-6 rounded-lg"
          style={{ 
            color: theme.primaryColor,
            backgroundColor: `${theme.primaryColor}10`,
          }}
        >
          {formattedValue}
        </div>
        
        <button
          onClick={onNext}
          className="px-6 py-2 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ 
            backgroundColor: theme.buttonColor || theme.primaryColor,
            color: theme.buttonTextColor || '#ffffff',
            borderRadius: buttonRadius,
          }}
        >
          {isLastQuestion ? 'Submit' : 'OK'}
          <span className="ml-2 text-xs opacity-70">Press Enter ↵</span>
        </button>
      </div>
    )
  }

  return (
    <div style={{ textAlign: (question.properties.alignment as 'left' | 'center' | 'right') || theme.questionAlignment || 'left' }}>
      {/* Question header */}
      <div className="mb-8">
        {questionNumber && (
          <span 
            className="text-sm font-medium mb-2 block"
            style={{ color: theme.textColor, opacity: 0.5 }}
          >
            {questionNumber}
          </span>
        )}
        <h2 
          className="text-2xl md:text-3xl font-semibold mb-2"
          style={{ color: theme.textColor }}
        >
          {pipedTitle}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </h2>
        {pipedDescription && (
          <p 
            className="text-lg"
            style={{ color: theme.textColor, opacity: 0.7 }}
          >
            {pipedDescription}
          </p>
        )}
      </div>

      {/* Input based on question type */}
      <div className="mb-8">
        {question.type === 'short_text' && (
          <Input
            value={(answer as string) || ''}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.properties.placeholder}
            className="text-lg py-6"
            style={{ 
              borderColor: `${theme.textColor}30`,
              color: theme.textColor,
              backgroundColor: 'transparent',
            }}
          />
        )}

        {question.type === 'long_text' && (
          <Textarea
            value={(answer as string) || ''}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.properties.placeholder}
            rows={4}
            className="text-lg"
            style={{ 
              borderColor: `${theme.textColor}30`,
              color: theme.textColor,
              backgroundColor: 'transparent',
            }}
          />
        )}

        {question.type === 'email' && (
          <Input
            type="email"
            value={(answer as string) || ''}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.properties.placeholder || 'name@example.com'}
            className="text-lg py-6"
            style={{ 
              borderColor: `${theme.textColor}30`,
              color: theme.textColor,
              backgroundColor: 'transparent',
            }}
          />
        )}

        {question.type === 'number' && (
          <Input
            type="number"
            value={(answer as string) || ''}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.properties.placeholder}
            className="text-lg py-6"
            style={{ 
              borderColor: `${theme.textColor}30`,
              color: theme.textColor,
              backgroundColor: 'transparent',
            }}
          />
        )}

        {question.type === 'phone' && (
          <Input
            type="tel"
            value={(answer as string) || ''}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.properties.placeholder || '+1 (555) 000-0000'}
            className="text-lg py-6"
            style={{ 
              borderColor: `${theme.textColor}30`,
              color: theme.textColor,
              backgroundColor: 'transparent',
            }}
          />
        )}

        {question.type === 'url' && (
          <Input
            type="url"
            value={(answer as string) || ''}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.properties.placeholder || 'https://'}
            className="text-lg py-6"
            style={{ 
              borderColor: `${theme.textColor}30`,
              color: theme.textColor,
              backgroundColor: 'transparent',
            }}
          />
        )}

        {question.type === 'multiple_choice' && (
          <RadioGroup
            value={(answer as string) || ''}
            onValueChange={setAnswer}
            className="space-y-3"
          >
            {question.properties.options?.map((option, idx) => (
              <div
                key={option.id}
                className="flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all"
                style={{
                  borderColor: answer === option.value ? theme.primaryColor : `${theme.textColor}20`,
                  backgroundColor: answer === option.value ? `${theme.primaryColor}10` : 'transparent',
                }}
                onClick={() => setAnswer(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.id} />
                <Label htmlFor={option.id} className="text-lg cursor-pointer flex-1" style={{ color: theme.textColor }}>
                  <span style={{ color: theme.textColor, opacity: 0.5 }} className="text-sm mr-2">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'checkbox' && (
          <div className="space-y-3">
            {question.properties.options?.map((option, idx) => {
              const selected = Array.isArray(answer) ? answer.includes(option.value) : false
              return (
                <div
                  key={option.id}
                  className="flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all"
                  style={{
                    borderColor: selected ? theme.primaryColor : `${theme.textColor}20`,
                    backgroundColor: selected ? `${theme.primaryColor}10` : 'transparent',
                  }}
                  onClick={() => {
                    const current = Array.isArray(answer) ? answer : []
                    if (selected) {
                      setAnswer(current.filter((v: string) => v !== option.value))
                    } else {
                      setAnswer([...current, option.value])
                    }
                  }}
                >
                  <Checkbox checked={selected} />
                  <Label className="text-lg cursor-pointer flex-1" style={{ color: theme.textColor }}>
                    <span style={{ color: theme.textColor, opacity: 0.5 }} className="text-sm mr-2">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {option.label}
                  </Label>
                </div>
              )
            })}
          </div>
        )}

        {question.type === 'dropdown' && (
          <Select value={(answer as string) || ''} onValueChange={setAnswer}>
            <SelectTrigger 
              className="text-lg py-6"
              style={{ 
                borderColor: `${theme.textColor}30`,
                color: theme.textColor,
              }}
            >
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.properties.options?.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {question.type === 'rating' && (
          <div className="flex gap-2">
            {Array.from({ length: question.properties.max || 5 }).map((_, i) => {
              const isSelected = (answer as number) > i
              return (
                <button
                  key={i}
                  onClick={() => setAnswer(i + 1)}
                  className="p-2 transition-transform hover:scale-110"
                >
                  <Star
                    weight={isSelected ? 'fill' : 'regular'}
                    className="h-10 w-10 transition-colors"
                    style={{
                      color: isSelected ? '#FBBF24' : `${theme.textColor}40`,
                    }}
                  />
                </button>
              )
            })}
          </div>
        )}

        {question.type === 'scale' && (
          <div className="flex gap-2 flex-wrap">
            {Array.from({
              length: (question.properties.max || 10) - (question.properties.min || 1) + 1,
            }).map((_, i) => {
              const value = (question.properties.min || 1) + i
              const isSelected = answer === value
              return (
                <button
                  key={value}
                  onClick={() => setAnswer(value)}
                  className="h-12 w-12 rounded-lg border-2 font-medium transition-all"
                  style={{
                    backgroundColor: isSelected ? theme.primaryColor : 'transparent',
                    color: isSelected ? '#fff' : theme.textColor,
                    borderColor: isSelected ? theme.primaryColor : `${theme.textColor}30`,
                  }}
                >
                  {value}
                </button>
              )
            })}
          </div>
        )}

        {question.type === 'yes_no' && (
          <div className="flex gap-4">
            {['Yes', 'No'].map((option) => {
              const isSelected = answer === option.toLowerCase()
              return (
                <button
                  key={option}
                  onClick={() => setAnswer(option.toLowerCase())}
                  className="flex-1 py-4 px-8 rounded-lg border-2 font-medium text-lg transition-all"
                  style={{
                    backgroundColor: isSelected ? theme.primaryColor : 'transparent',
                    color: isSelected ? '#fff' : theme.textColor,
                    borderColor: isSelected ? theme.primaryColor : `${theme.textColor}30`,
                  }}
                >
                  {option}
                </button>
              )
            })}
          </div>
        )}

        {question.type === 'date' && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="w-full flex items-center justify-between text-lg py-4 px-4 rounded-md border transition-colors hover:bg-accent/50"
                style={{ 
                  borderColor: `${theme.textColor}30`,
                  color: answer ? theme.textColor : `${theme.textColor}60`,
                  backgroundColor: 'transparent',
                }}
              >
                <span>
                  {answer 
                    ? format(new Date(answer as string), 'dd/MM/yyyy')
                    : 'dd/mm/yyyy'
                  }
                </span>
                <CalendarBlank className="h-5 w-5" style={{ color: theme.textColor, opacity: 0.6 }} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={answer ? new Date(answer as string) : undefined}
                onSelect={(date) => setAnswer(date ? format(date, 'yyyy-MM-dd') : '')}
                initialFocus
              />
              <div className="flex justify-between p-3 border-t">
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={() => setAnswer('')}
                >
                  Clear
                </button>
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={() => setAnswer(format(new Date(), 'yyyy-MM-dd'))}
                >
                  Today
                </button>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {question.type === 'file_upload' && (
          <FileUpload
            formId={formId}
            questionId={question.id}
            value={(answer as { name: string; size: number; type: string; url: string; path: string }[]) || []}
            onChange={(files) => setAnswer(files)}
            acceptedFileTypes={question.properties.acceptedFileTypes}
            maxFileSize={question.properties.maxFileSize}
            maxFiles={question.properties.maxFiles}
            theme={theme}
          />
        )}

        {question.type === 'signature' && (
          <SignatureInput
            value={(answer as string) || ''}
            onChange={setAnswer}
            theme={theme}
          />
        )}

        {question.type === 'slider' && (
          <div className="space-y-4">
            <input
              type="range"
              min={question.properties.min || 0}
              max={question.properties.max || 100}
              step={question.properties.step || 1}
              value={(answer as number) || question.properties.min || 0}
              onChange={(e) => setAnswer(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${theme.primaryColor} 0%, ${theme.primaryColor} ${((((answer as number) || question.properties.min || 0) - (question.properties.min || 0)) / ((question.properties.max || 100) - (question.properties.min || 0))) * 100}%, ${theme.textColor}20 ${((((answer as number) || question.properties.min || 0) - (question.properties.min || 0)) / ((question.properties.max || 100) - (question.properties.min || 0))) * 100}%, ${theme.textColor}20 100%)`,
              }}
            />
            <div className="flex justify-between text-sm" style={{ color: theme.textColor, opacity: 0.7 }}>
              <span>{question.properties.minLabel || question.properties.min || 0}</span>
              <span className="text-2xl font-bold" style={{ color: theme.primaryColor }}>
                {answer !== undefined ? String(answer) : '-'}
              </span>
              <span>{question.properties.maxLabel || question.properties.max || 100}</span>
            </div>
          </div>
        )}

        {question.type === 'nps' && (
          <div className="space-y-3">
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
              {Array.from({ length: 11 }).map((_, i) => {
                const isSelected = answer === i
                // Color coding: 0-6 red (detractors), 7-8 yellow (passives), 9-10 green (promoters)
                const getBgColor = () => {
                  if (isSelected) {
                    if (i <= 6) return '#EF4444' // red-500
                    if (i <= 8) return '#EAB308' // yellow-500
                    return '#22C55E' // green-500
                  }
                  if (i <= 6) return '#FEE2E2' // red-100
                  if (i <= 8) return '#FEF9C3' // yellow-100
                  return '#DCFCE7' // green-100
                }
                const getTextColor = () => {
                  if (isSelected) return '#fff'
                  if (i <= 6) return '#DC2626' // red-600
                  if (i <= 8) return '#CA8A04' // yellow-600
                  return '#16A34A' // green-600
                }
                const getBorderColor = () => {
                  if (i <= 6) return '#FECACA' // red-200
                  if (i <= 8) return '#FEF08A' // yellow-200
                  return '#BBF7D0' // green-200
                }
                return (
                  <button
                    key={i}
                    onClick={() => setAnswer(i)}
                    className={cn(
                      "h-10 w-10 sm:h-12 sm:w-12 rounded-lg font-medium text-sm sm:text-base transition-all border",
                      isSelected && "ring-2 ring-offset-2"
                    )}
                    style={{
                      backgroundColor: getBgColor(),
                      color: getTextColor(),
                      borderColor: getBorderColor(),
                      // @ts-expect-error ringColor is a valid CSS custom property for Tailwind
                      '--tw-ring-color': getBgColor(),
                    }}
                  >
                    {i}
                  </button>
                )
              })}
            </div>
            <div className="flex justify-between text-xs sm:text-sm" style={{ color: theme.textColor, opacity: 0.6 }}>
              <span>{question.properties.leftLabel || 'Not likely at all'}</span>
              <span>{question.properties.rightLabel || 'Extremely likely'}</span>
            </div>
          </div>
        )}

        {question.type === 'matrix' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left" style={{ color: theme.textColor }}></th>
                  {(question.properties.columns || [
                    { id: '1', label: 'Very Bad' },
                    { id: '2', label: 'Bad' },
                    { id: '3', label: 'Neutral' },
                    { id: '4', label: 'Good' },
                    { id: '5', label: 'Very Good' },
                  ]).map((col) => (
                    <th key={col.id} className="p-2 text-center font-medium" style={{ color: theme.textColor, opacity: 0.7 }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(question.properties.rows || [
                  { id: '1', label: 'Quality' },
                  { id: '2', label: 'Service' },
                  { id: '3', label: 'Value' },
                ]).map((row) => (
                  <tr key={row.id} className="border-t" style={{ borderColor: `${theme.textColor}20` }}>
                    <td className="p-2 font-medium" style={{ color: theme.textColor }}>{row.label}</td>
                    {(question.properties.columns || [
                      { id: '1', label: 'Very Bad' },
                      { id: '2', label: 'Bad' },
                      { id: '3', label: 'Neutral' },
                      { id: '4', label: 'Good' },
                      { id: '5', label: 'Very Good' },
                    ]).map((col, colIndex) => {
                      const matrixAnswer = (answer as Record<string, string>) || {}
                      const isSelected = matrixAnswer[row.id] === col.id
                      // Color coding based on column position (sentiment)
                      const columns = question.properties.columns || [
                        { id: '1', label: 'Very Bad' },
                        { id: '2', label: 'Bad' },
                        { id: '3', label: 'Neutral' },
                        { id: '4', label: 'Good' },
                        { id: '5', label: 'Very Good' },
                      ]
                      const totalCols = columns.length
                      const getColor = () => {
                        const position = colIndex / (totalCols - 1) // 0 to 1
                        if (position <= 0.2) return { bg: '#EF4444', border: '#DC2626' } // red
                        if (position <= 0.4) return { bg: '#F97316', border: '#EA580C' } // orange
                        if (position <= 0.6) return { bg: '#EAB308', border: '#CA8A04' } // yellow
                        if (position <= 0.8) return { bg: '#84CC16', border: '#65A30D' } // lime
                        return { bg: '#22C55E', border: '#16A34A' } // green
                      }
                      const color = getColor()
                      return (
                        <td key={col.id} className="p-2 text-center">
                          <button
                            onClick={() => {
                              const current = (answer as Record<string, string>) || {}
                              setAnswer({ ...current, [row.id]: col.id })
                            }}
                            className="w-6 h-6 rounded-full border-2 transition-all hover:scale-110"
                            style={{
                              borderColor: isSelected ? color.border : `${theme.textColor}30`,
                              backgroundColor: isSelected ? color.bg : 'transparent',
                            }}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {question.type === 'ranking' && (
          <RankingInput
            options={question.properties.options || []}
            value={(answer as string[]) || []}
            onChange={setAnswer}
            theme={theme}
          />
        )}

        {question.type === 'address' && (
          <div className="space-y-4">
            <Input
              value={((answer as Record<string, string>) || {}).street || ''}
              onChange={(e) => setAnswer({ ...(answer as Record<string, string>) || {}, street: e.target.value })}
              placeholder="Street address"
              className="text-base py-5"
              style={{ 
                borderColor: `${theme.textColor}30`,
                color: theme.textColor,
                backgroundColor: 'transparent',
              }}
            />
            <Input
              value={((answer as Record<string, string>) || {}).street2 || ''}
              onChange={(e) => setAnswer({ ...(answer as Record<string, string>) || {}, street2: e.target.value })}
              placeholder="Apartment, suite, etc. (optional)"
              className="text-base py-5"
              style={{ 
                borderColor: `${theme.textColor}30`,
                color: theme.textColor,
                backgroundColor: 'transparent',
              }}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={((answer as Record<string, string>) || {}).city || ''}
                onChange={(e) => setAnswer({ ...(answer as Record<string, string>) || {}, city: e.target.value })}
                placeholder="City"
                className="text-base py-5"
                style={{ 
                  borderColor: `${theme.textColor}30`,
                  color: theme.textColor,
                  backgroundColor: 'transparent',
                }}
              />
              <Input
                value={((answer as Record<string, string>) || {}).state || ''}
                onChange={(e) => setAnswer({ ...(answer as Record<string, string>) || {}, state: e.target.value })}
                placeholder="State / Province"
                className="text-base py-5"
                style={{ 
                  borderColor: `${theme.textColor}30`,
                  color: theme.textColor,
                  backgroundColor: 'transparent',
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={((answer as Record<string, string>) || {}).zip || ''}
                onChange={(e) => setAnswer({ ...(answer as Record<string, string>) || {}, zip: e.target.value })}
                placeholder="ZIP / Postal code"
                className="text-base py-5"
                style={{ 
                  borderColor: `${theme.textColor}30`,
                  color: theme.textColor,
                  backgroundColor: 'transparent',
                }}
              />
              <Input
                value={((answer as Record<string, string>) || {}).country || ''}
                onChange={(e) => setAnswer({ ...(answer as Record<string, string>) || {}, country: e.target.value })}
                placeholder="Country"
                className="text-base py-5"
                style={{ 
                  borderColor: `${theme.textColor}30`,
                  color: theme.textColor,
                  backgroundColor: 'transparent',
                }}
              />
            </div>
          </div>
        )}

        {question.type === 'payment' && (() => {
          const provider = question.properties.paymentProvider || 'stripe'
          const getPaymentLink = () => {
            switch (provider) {
              case 'stripe':
                // Stripe Payment Links are pre-generated URLs from Stripe Dashboard
                // Format: https://buy.stripe.com/{payment_link_id}
                // Note: Product/Price IDs (price_xxx) require server-side Checkout Session creation
                if (question.properties.stripePaymentLink) {
                  return question.properties.stripePaymentLink
                }
                // Stripe product IDs cannot be converted to direct checkout URLs client-side
                // They require creating a Checkout Session via API
                return null
              case 'dodo':
                // Dodo Payments supports static payment links with product ID
                // Format: https://checkout.dodopayments.com/buy/{product_id}
                if (question.properties.dodoPaymentLink) {
                  return question.properties.dodoPaymentLink
                }
                if (question.properties.dodoProductId) {
                  return `https://checkout.dodopayments.com/buy/${question.properties.dodoProductId}`
                }
                return null
              case 'polar':
                // Polar requires Checkout Session creation via API (POST /v1/checkouts)
                // Use pre-generated checkout links from Polar dashboard
                if (question.properties.polarPaymentLink) {
                  return question.properties.polarPaymentLink
                }
                // Polar product IDs cannot be converted to direct checkout URLs client-side
                return null
              default:
                return null
            }
          }
          const getProductId = () => {
            switch (provider) {
              case 'stripe':
                return question.properties.stripeProductId
              case 'dodo':
                return question.properties.dodoProductId
              case 'polar':
                return question.properties.polarProductId
              default:
                return null
            }
          }
          const paymentLink = getPaymentLink()
          const productId = getProductId()
          const hasPaymentConfig = paymentLink || productId
          const providerName = provider === 'stripe' ? 'Stripe' : provider === 'dodo' ? 'Dodo Payments' : 'Polar'

          return (
            <div className="space-y-4 p-6 rounded-xl border-2" style={{ borderColor: `${theme.textColor}15`, backgroundColor: `${theme.textColor}03` }}>
              {/* Product title and price */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-lg" style={{ color: theme.textColor }}>
                    {question.properties.productName || 'Product'}
                  </p>
                  <p className="text-sm mt-1" style={{ color: theme.textColor, opacity: 0.7 }}>
                    {question.properties.productDescription || 'Product description'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold" style={{ color: theme.primaryColor }}>
                    {question.properties.currency || '$'}{question.properties.amount || '0.00'}
                  </p>
                </div>
              </div>
              
              {/* Product image - landscape */}
              {question.properties.productImage && (
                <div className="w-full">
                  <img
                    src={question.properties.productImage}
                    alt={question.properties.productName || 'Product'}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
              
              {hasPaymentConfig ? (
                <a
                  href={paymentLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-lg font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: theme.buttonColor || theme.primaryColor, color: theme.buttonTextColor || '#ffffff' }}
                  onClick={() => setAnswer({ provider, productId, link: paymentLink, timestamp: new Date().toISOString() })}
                >
                  {question.properties.paymentButtonText || 'Pay Now'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              ) : (
                <div className="py-4 px-6 rounded-lg bg-yellow-50 border border-yellow-200 text-center">
                  <p className="text-sm text-yellow-800">
                    {provider === 'dodo' 
                      ? 'Payment not configured. Please add a Dodo Product ID or payment link in the form builder.'
                      : `Payment not configured. Please add a ${providerName} Payment Link in the form builder.`}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-2 text-xs" style={{ color: theme.textColor, opacity: 0.5 }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure payment via {providerName}</span>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Validation error message */}
      {validationError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-500 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {validationError}
          </p>
        </div>
      )}

      {/* Submit/Next button */}
      <button
        onClick={onNext}
        disabled={!canGoNext || isSubmitting}
        className="px-6 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ 
          backgroundColor: theme.buttonColor || theme.primaryColor,
          color: theme.buttonTextColor || '#ffffff',
          borderRadius: buttonRadius,
        }}
      >
        {isSubmitting ? 'Submitting...' : isLastQuestion ? 'Submit' : 'OK'}
        <span className="ml-2 text-xs opacity-70">Press Enter ↵</span>
      </button>
    </div>
  )
}
