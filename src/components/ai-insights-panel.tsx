'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  Send,
  RefreshCw,
} from 'lucide-react'
import { Crown } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useAIInsights } from '@/hooks/use-ai'
import { usePlanAccess } from '@/lib/use-plan-access'
import { cn } from '@/lib/utils'

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

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AIInsightsPanelProps {
  formId: string
  responseCount: number
}

export function AIInsightsPanel({ formId, responseCount }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<ResponseInsight | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  
  const router = useRouter()
  const chatEndRef = useRef<HTMLDivElement>(null)
  const { isAnalyzing, error, getInsights, askQuestion } = useAIInsights()
  const { canUse, isLoading: planLoading, getUpgradeMessage } = usePlanAccess()
  
  const hasAIAccess = canUse('aiFeatures')
  const upgradeMessage = getUpgradeMessage('aiFeatures')

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const loadInsights = async () => {
    if (responseCount === 0) {
      toast('No responses yet', {
        description: 'Collect some responses first to get AI insights',
      })
      return
    }

    const result = await getInsights(formId)
    
    if (result) {
      setInsights(result)
      setHasLoaded(true)
    } else if (error) {
      toast.error('Analysis failed', {
        description: error,
      })
    }
  }

  const handleAskQuestion = async () => {
    if (!chatInput.trim() || isAsking) return

    const question = chatInput.trim()
    setChatInput('')
    setChatMessages((prev) => [...prev, { role: 'user', content: question }])
    setIsAsking(true)

    try {
      const answer = await askQuestion(formId, question)
      
      if (answer) {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: answer }])
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Sorry, I couldn\'t process that question. Please try again.' },
        ])
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'An error occurred. Please try again.' },
      ])
    } finally {
      setIsAsking(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAskQuestion()
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-green-500" />
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-500" />
      default:
        return <TrendingUp className="h-4 w-4 text-yellow-500" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'mixed':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  // Show upgrade prompt if user doesn't have AI access
  if (!planLoading && !hasAIAccess) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Get AI-powered analysis of your form responses
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Crown className="h-8 w-8 text-primary" weight="fill" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">{upgradeMessage?.title || 'Pro Feature'}</p>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                {upgradeMessage?.description || 'Upgrade to Pro to unlock AI-powered insights.'}
              </p>
            </div>
            <Button onClick={() => router.push('/billing')} className="gap-2">
              <Crown className="h-4 w-4" weight="fill" />
              Upgrade to Pro
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Initial state - no insights loaded yet
  if (!hasLoaded) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
          <CardDescription>
            Get AI-powered analysis of your form responses
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing responses...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Unlock AI Insights</p>
                <p className="text-sm text-muted-foreground max-w-62.5">
                  {responseCount === 0
                    ? 'Collect responses to get AI-powered insights'
                    : `Analyze ${responseCount} response${responseCount === 1 ? '' : 's'} with AI`}
                </p>
              </div>
              <Button
                onClick={loadInsights}
                disabled={responseCount === 0}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate Insights
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Insights loaded
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadInsights}
            disabled={isAnalyzing}
          >
            <RefreshCw className={cn('h-4 w-4', isAnalyzing && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6">
            {/* Summary */}
            {insights && (
              <>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Summary
                  </h4>
                  <p className="text-sm text-muted-foreground">{insights.summary}</p>
                </div>

                {/* Sentiment */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Overall Sentiment:</span>
                  <Badge className={getSentimentColor(insights.sentiment)}>
                    {getSentimentIcon(insights.sentiment)}
                    <span className="ml-1 capitalize">{insights.sentiment}</span>
                  </Badge>
                </div>

                {/* Key Themes */}
                {insights.keyThemes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Themes</h4>
                    <div className="flex flex-wrap gap-2">
                      {insights.keyThemes.map((theme, i) => (
                        <Badge key={i} variant="secondary">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlights */}
                {(insights.highlights.positive.length > 0 ||
                  insights.highlights.negative.length > 0) && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Highlights</h4>
                    
                    {insights.highlights.positive.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" /> Positive
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {insights.highlights.positive.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {insights.highlights.negative.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                          <ThumbsDown className="h-3 w-3" /> Areas for Improvement
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {insights.highlights.negative.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-500 mt-1">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Items */}
                {insights.actionItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Recommended Actions
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      {insights.actionItems.map((action, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-1">{i + 1}.</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            <Separator />

            {/* Chat Interface */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Ask AI
              </h4>
              
              {/* Chat Messages */}
              {chatMessages.length > 0 && (
                <div className="space-y-3 max-h-50 overflow-y-auto">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        'p-3 rounded-lg text-sm',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-8'
                          : 'bg-muted mr-8'
                      )}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {isAsking && (
                    <div className="bg-muted p-3 rounded-lg mr-8">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask a question about responses..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isAsking}
                />
                <Button
                  size="icon"
                  onClick={handleAskQuestion}
                  disabled={!chatInput.trim() || isAsking}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Example Questions */}
              <div className="flex flex-wrap gap-1">
                {[
                  'What do customers like most?',
                  'Main complaints?',
                  'NPS breakdown?',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setChatInput(q)}
                    className="text-xs px-2 py-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
