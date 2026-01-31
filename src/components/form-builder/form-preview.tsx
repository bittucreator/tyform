'use client'

import { useFormBuilder } from '@/store/form-builder'
import { Button } from '@/components/ui/button'
import { FileText, CaretLeft, CaretRight, Star } from '@phosphor-icons/react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { GoogleFontLoader } from '@/components/google-font-loader'

export function FormPreview() {
  const { form, selectQuestion, selectedQuestionId } = useFormBuilder()
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Find current question to preview
  const questions = form.questions
  
  // Compute the effective index based on selection
  const effectiveIndex = useMemo(() => {
    if (selectedQuestionId) {
      const index = questions.findIndex(q => q.id === selectedQuestionId)
      return index !== -1 ? index : currentIndex
    }
    return currentIndex
  }, [selectedQuestionId, questions, currentIndex])
  
  const currentQuestion = questions[effectiveIndex]

  const goNext = () => {
    if (effectiveIndex < questions.length - 1) {
      const nextIndex = effectiveIndex + 1
      setCurrentIndex(nextIndex)
      selectQuestion(questions[nextIndex].id)
    }
  }

  const goPrev = () => {
    if (effectiveIndex > 0) {
      const prevIndex = effectiveIndex - 1
      setCurrentIndex(prevIndex)
      selectQuestion(questions[prevIndex].id)
    }
  }

  // Get theme settings for empty state too
  const theme = form.settings.theme || {}
  const backgroundImage = theme.backgroundImage
  const backgroundType = theme.backgroundType || 'solid'
  const backgroundColor = theme.backgroundColor || '#ffffff'
  const backgroundLayout = theme.backgroundLayout || 'wallpaper'

  // Check if using wallpaper layout (full background)
  const isWallpaperLayout = backgroundType === 'image' && backgroundImage && backgroundLayout === 'wallpaper'

  // Compute background style for wallpaper layout only
  const getBackgroundStyle = (): React.CSSProperties => {
    if (isWallpaperLayout) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    }
    return { backgroundColor }
  }

  if (questions.length === 0) {
    return (
      <div 
        className="flex-1 flex items-center justify-center"
        style={getBackgroundStyle()}
      >
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Start building your form
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Click &quot;+ Add Block&quot; to add your first question
          </p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  const primaryColor = theme.primaryColor || '#000000'
  const buttonColor = theme.buttonColor || primaryColor
  const buttonTextColor = theme.buttonTextColor || '#ffffff'
  const fontFamily = theme.fontFamily || 'Inter'
  const textColor = theme.textColor || '#1f2937'

  // Render navigation bar
  const renderNavigation = () => (
    <div className="p-4 flex items-center justify-between border-t border-border bg-muted/30">
      <Button
        variant="ghost"
        size="sm"
        onClick={goPrev}
        disabled={effectiveIndex === 0}
        className="gap-2"
      >
        <CaretLeft className="h-4 w-4" />
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        {effectiveIndex + 1} / {questions.length}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={goNext}
        disabled={effectiveIndex === questions.length - 1}
        className="gap-2"
      >
        Next
        <CaretRight className="h-4 w-4" />
      </Button>
    </div>
  )

  // Render preview content
  const renderContent = () => {
    // Get alignment: per-question alignment takes priority, fallback to theme alignment
    const questionAlignment = currentQuestion.properties.alignment || theme.questionAlignment || 'left'
    const alignmentClass = questionAlignment === 'center' ? 'text-center' : questionAlignment === 'right' ? 'text-right' : 'text-left'
    
    return (
    <>
      {/* Welcome/Thank You Screen */}
      {(currentQuestion.type === 'welcome' || currentQuestion.type === 'thank_you') && (
        <div className={`space-y-6 ${alignmentClass}`}>
          {/* Cover Image - Landscape banner */}
          {currentQuestion.properties.coverImage && (
            <div className="-mx-4 -mt-4 mb-6 relative h-32">
              <Image
                src={currentQuestion.properties.coverImage}
                alt="Cover"
                fill
                className="object-cover"
              />
            </div>
          )}
          
          {/* Screen Image - Centered */}
          {currentQuestion.properties.screenImage && (
            <div className="flex justify-center mb-4">
              <div className="relative w-30 h-30">
                <Image
                  src={currentQuestion.properties.screenImage}
                  alt="Screen"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
          
          <h1 
            className="text-4xl font-bold"
            style={{ color: textColor }}
          >
            {currentQuestion.title || (currentQuestion.type === 'welcome' ? 'Welcome!' : 'Thank you!')}
          </h1>
          {currentQuestion.description && (
            <p 
              className="text-lg opacity-70"
              style={{ color: textColor }}
            >
              {currentQuestion.description}
            </p>
          )}
          {currentQuestion.type === 'welcome' && (
            <Button
              size="lg"
              className="mt-4"
              style={{ backgroundColor: buttonColor, color: buttonTextColor }}
            >
              {currentQuestion.properties.buttonText || "Let's start"}
            </Button>
          )}
        </div>
      )}

      {/* Regular question */}
      {currentQuestion.type !== 'welcome' && currentQuestion.type !== 'thank_you' && (
        <div className={`space-y-6 ${alignmentClass}`}>
          <h2 
            className="text-2xl font-semibold"
            style={{ color: textColor }}
          >
            {currentQuestion.title || 'Your question here...'}
            {currentQuestion.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </h2>
          {currentQuestion.description && (
            <p 
              className="opacity-70"
              style={{ color: textColor }}
            >
              {currentQuestion.description}
            </p>
          )}

          {/* Question type preview */}
          <div className="pt-4">
            {/* Text inputs */}
            {['short_text', 'email', 'number', 'phone', 'url'].includes(currentQuestion.type) && (
              <input
                type="text"
                placeholder={currentQuestion.properties.placeholder || 'Type your answer here...'}
                className="w-full text-lg border-0 border-b-2 border-muted bg-transparent py-2 focus:outline-none focus:border-foreground"
                style={{ color: textColor }}
                disabled
              />
            )}
            
            {currentQuestion.type === 'long_text' && (
              <textarea
                placeholder={currentQuestion.properties.placeholder || 'Type your answer here...'}
                className="w-full text-lg border-0 border-b-2 border-muted bg-transparent py-2 focus:outline-none focus:border-foreground resize-none"
                style={{ color: textColor }}
                rows={3}
                disabled
              />
            )}

            {/* Multiple Choice */}
            {currentQuestion.type === 'multiple_choice' && (
              <div className="space-y-3">
                {currentQuestion.properties.options?.map((option, index) => (
                  <div
                    key={option.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-foreground cursor-pointer transition-colors"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded bg-muted text-xs font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span style={{ color: textColor }}>{option.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Checkbox */}
            {currentQuestion.type === 'checkbox' && (
              <div className="space-y-3">
                {currentQuestion.properties.options?.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-foreground cursor-pointer transition-colors"
                  >
                    <div className="w-5 h-5 rounded border-2 border-muted-foreground" />
                    <span style={{ color: textColor }}>{option.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Dropdown */}
            {currentQuestion.type === 'dropdown' && (
              <div className="relative">
                <select 
                  className="w-full text-lg border-0 border-b-2 border-muted bg-transparent py-2 focus:outline-none appearance-none"
                  disabled
                >
                  <option>Select an option...</option>
                  {currentQuestion.properties.options?.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Rating */}
            {currentQuestion.type === 'rating' && (
              <div className="flex gap-2">
                {Array.from({ length: currentQuestion.properties.max || 5 }).map((_, i) => (
                  <button
                    key={i}
                    className="w-10 h-10 rounded-lg bg-muted hover:bg-muted-foreground/20 transition-colors flex items-center justify-center text-lg"
                    disabled
                  >
                    <Star className="h-5 w-5" weight="duotone" />
                  </button>
                ))}
              </div>
            )}

            {/* Scale */}
            {currentQuestion.type === 'scale' && (
              <div className="flex gap-2">
                {Array.from({ length: (currentQuestion.properties.max || 10) - (currentQuestion.properties.min || 1) + 1 }).map((_, i) => (
                  <button
                    key={i}
                    className="flex-1 h-10 rounded-lg bg-muted hover:bg-muted-foreground/20 transition-colors flex items-center justify-center text-sm font-medium"
                    disabled
                  >
                    {(currentQuestion.properties.min || 1) + i}
                  </button>
                ))}
              </div>
            )}

            {/* Yes/No */}
            {currentQuestion.type === 'yes_no' && (
              <div className="flex gap-3">
                <button className="flex-1 py-3 px-6 rounded-lg border border-border hover:border-foreground transition-colors text-foreground font-medium">
                  Yes
                </button>
                <button className="flex-1 py-3 px-6 rounded-lg border border-border hover:border-foreground transition-colors text-foreground font-medium">
                  No
                </button>
              </div>
            )}

            {/* Date */}
            {currentQuestion.type === 'date' && (
              <input
                type="date"
                className="text-lg border-0 border-b-2 border-muted bg-transparent py-2 focus:outline-none"
                disabled
              />
            )}

            {/* File Upload */}
            {currentQuestion.type === 'file_upload' && (
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <p className="text-muted-foreground">
                  Drag and drop files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Max {currentQuestion.properties.maxFiles || 5} files, up to {currentQuestion.properties.maxFileSize || 10}MB each
                </p>
              </div>
            )}

            {/* Signature */}
            {currentQuestion.type === 'signature' && (
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center bg-muted/20 min-h-37.5 flex flex-col items-center justify-center">
                <p className="text-muted-foreground">
                  Draw your signature here
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Use mouse or touch to sign
                </p>
              </div>
            )}

            {/* Matrix/Grid */}
            {currentQuestion.type === 'matrix' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="p-2"></th>
                      {(currentQuestion.properties.columns || [
                        { id: '1', label: 'Very Bad' },
                        { id: '2', label: 'Bad' },
                        { id: '3', label: 'Neutral' },
                        { id: '4', label: 'Good' },
                        { id: '5', label: 'Very Good' },
                      ]).map((col) => (
                        <th key={col.id} className="p-2 text-center text-muted-foreground font-medium">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(currentQuestion.properties.rows || [
                      { id: '1', label: 'Quality' },
                      { id: '2', label: 'Service' },
                      { id: '3', label: 'Value' },
                    ]).map((row) => (
                      <tr key={row.id} className="border-t border-border">
                        <td className="p-2 text-foreground">{row.label}</td>
                        {(currentQuestion.properties.columns || [
                          { id: '1', label: 'Very Bad' },
                          { id: '2', label: 'Bad' },
                          { id: '3', label: 'Neutral' },
                          { id: '4', label: 'Good' },
                          { id: '5', label: 'Very Good' },
                        ]).map((col) => (
                          <td key={col.id} className="p-2 text-center">
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground mx-auto" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Ranking */}
            {currentQuestion.type === 'ranking' && (
              <div className="space-y-2">
                {(currentQuestion.properties.options || [
                  { id: '1', label: 'Option 1', value: 'option_1' },
                  { id: '2', label: 'Option 2', value: 'option_2' },
                  { id: '3', label: 'Option 3', value: 'option_3' },
                ]).map((option, index) => (
                  <div
                    key={option.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:border-foreground cursor-grab transition-colors"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded bg-muted text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-foreground flex-1">{option.label}</span>
                    <span className="text-muted-foreground">⋮⋮</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">Drag items to reorder</p>
              </div>
            )}

            {/* Slider */}
            {currentQuestion.type === 'slider' && (
              <div className="space-y-3">
                <div className="relative pt-1">
                  <input
                    type="range"
                    min={currentQuestion.properties.min || 0}
                    max={currentQuestion.properties.max || 100}
                    step={currentQuestion.properties.step || 1}
                    defaultValue={(currentQuestion.properties.min || 0) + ((currentQuestion.properties.max || 100) - (currentQuestion.properties.min || 0)) / 2}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-foreground"
                    disabled
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{currentQuestion.properties.minLabel || currentQuestion.properties.min || 0}</span>
                  <span>{currentQuestion.properties.maxLabel || currentQuestion.properties.max || 100}</span>
                </div>
              </div>
            )}

            {/* NPS */}
            {currentQuestion.type === 'nps' && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <button
                      key={i}
                      className={`flex-1 h-10 rounded-lg transition-colors flex items-center justify-center text-sm font-medium ${
                        i <= 6 ? 'bg-red-100 hover:bg-red-200 text-red-700' :
                        i <= 8 ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' :
                        'bg-green-100 hover:bg-green-200 text-green-700'
                      }`}
                      disabled
                    >
                      {i}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{currentQuestion.properties.leftLabel || 'Not likely at all'}</span>
                  <span>{currentQuestion.properties.rightLabel || 'Extremely likely'}</span>
                </div>
              </div>
            )}

            {/* Payment */}
            {currentQuestion.type === 'payment' && (() => {
              const provider = currentQuestion.properties.paymentProvider || 'stripe'
              const providerName = provider === 'stripe' ? 'Stripe' : provider === 'dodo' ? 'Dodo Payments' : 'Polar'

              return (
                <div className="border-2 border-border/50 rounded-xl p-6 space-y-4 bg-muted/5">
                  {/* Product title and price */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{currentQuestion.properties.productName || 'Product'}</p>
                      <p className="text-sm text-muted-foreground mt-1">{currentQuestion.properties.productDescription || 'Product description'}</p>
                    </div>
                    <p className="text-2xl font-bold shrink-0" style={{ color: primaryColor }}>
                      {currentQuestion.properties.currency || '$'}{currentQuestion.properties.amount || '0.00'}
                    </p>
                  </div>
                  
                  {/* Product image - landscape */}
                  {currentQuestion.properties.productImage && (
                    <div className="relative w-full h-48">
                      <Image
                        src={currentQuestion.properties.productImage}
                        alt={currentQuestion.properties.productName || 'Product'}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <button
                    className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                    style={{ backgroundColor: buttonColor, color: buttonTextColor }}
                    disabled
                  >
                    {currentQuestion.properties.paymentButtonText || 'Pay Now'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secure payment via {providerName}</span>
                  </div>
                </div>
              )
            })()}

            {/* Address */}
            {currentQuestion.type === 'address' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Street address"
                  className="w-full text-base border-0 border-b-2 border-muted bg-transparent py-2 focus:outline-none focus:border-foreground"
                  disabled
                />
                <input
                  type="text"
                  placeholder="Apartment, suite, etc. (optional)"
                  className="w-full text-base border-0 border-b-2 border-muted bg-transparent py-2 focus:outline-none focus:border-foreground"
                  disabled
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full text-base border-0 border-b-2 border-muted bg-transparent py-2 focus:outline-none focus:border-foreground"
                    disabled
                  />
                  <input
                    type="text"
                    placeholder="State / Province"
                    className="w-full text-base border-0 border-b-2 border-muted bg-transparent py-2 focus:outline-none focus:border-foreground"
                    disabled
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="ZIP / Postal code"
                    className="w-full text-base border-0 border-b-2 border-muted bg-transparent py-2 focus:outline-none focus:border-foreground"
                    disabled
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    className="w-full text-base border-0 border-b-2 border-muted bg-transparent py-2 focus:outline-none focus:border-foreground"
                    disabled
                  />
                </div>
              </div>
            )}

            {/* Calculator */}
            {currentQuestion.type === 'calculator' && (
              <div className="space-y-3">
                <div 
                  className="text-3xl font-bold p-4 rounded-lg text-center"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  {currentQuestion.properties.prefix || ''} 
                  0.00
                  {currentQuestion.properties.suffix || ''}
                </div>
                {currentQuestion.properties.formula && (
                  <p className="text-xs text-muted-foreground text-center font-mono">
                    Formula: {currentQuestion.properties.formula}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* OK/Continue Button */}
          <div className={cn(
            "pt-4",
            questionAlignment === 'center' && "flex justify-center",
            questionAlignment === 'right' && "flex justify-end"
          )}>
            <Button
              className="px-6 py-2 font-medium"
              style={{ 
                backgroundColor: buttonColor,
                color: buttonTextColor,
                borderRadius: theme.buttonStyle === 'pill' ? '9999px' :
                  theme.buttonStyle === 'square' ? '4px' : '8px',
              }}
            >
              OK
              <span className="ml-2 text-xs opacity-70">Press Enter ↵</span>
            </Button>
          </div>
        </div>
      )}
    </>
  )
  }

  // Stack Layout: Image on top, content below
  if (backgroundType === 'image' && backgroundImage && backgroundLayout === 'stack') {
    return (
      <>
        <GoogleFontLoader font={fontFamily} />
        <div 
          className="flex-1 flex flex-col overflow-hidden"
          style={{ backgroundColor, fontFamily }}
        >
        {/* Image at top */}
        <div 
          className="h-48 w-full bg-cover bg-center shrink-0"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        {/* Content below */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div className="max-w-xl w-full text-center">
            {renderContent()}
          </div>
        </div>
        {renderNavigation()}
      </div>
      </>
    )
  }

  // Split Layout: Image on left, content on right
  if (backgroundType === 'image' && backgroundImage && backgroundLayout === 'split') {
    return (
      <>
        <GoogleFontLoader font={fontFamily} />
        <div 
          className="flex-1 flex overflow-hidden"
          style={{ fontFamily }}
        >
        {/* Image on left */}
        <div 
          className="w-1/2 h-full bg-cover bg-center shrink-0"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        {/* Content on right */}
        <div 
          className="w-1/2 flex flex-col"
          style={{ backgroundColor }}
        >
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div className="max-w-md w-full text-center">
              {renderContent()}
            </div>
          </div>
          {renderNavigation()}
        </div>
      </div>
      </>
    )
  }

  // Wallpaper Layout (default): Full background image
  const backgroundStyle: React.CSSProperties = {
    ...getBackgroundStyle(),
    fontFamily,
  }

  return (
    <>
      <GoogleFontLoader font={fontFamily} />
      <div 
        className="flex-1 flex flex-col overflow-hidden"
        style={backgroundStyle}
      >
      {/* Preview content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-xl w-full text-center">
          {renderContent()}
        </div>
      </div>

      {/* Navigation */}
      {renderNavigation()}
    </div>
    </>
  )
}
