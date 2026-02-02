'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useFormBuilder } from '@/store/form-builder'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Download,
  ArrowsClockwise,
  ListBullets,
  CheckSquare,
  CaretDown,
  Star,
  ChartBar,
  TextT,
  TextAlignLeft,
  Envelope,
  Hash,
  Calendar,
  CheckCircle,
  Question as QuestionIcon,
  Lock,
  Crown,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { AdvancedAnalytics } from './advanced-analytics'
import { useProFeature } from '@/components/pro-feature-gate'
import type { Response, Question } from '@/types/database'

interface ResultsPanelProps {
  open: boolean
  onClose: () => void
}

type ResultsTab = 'submissions' | 'summary' | 'analytics'
type SubmissionFilter = 'completed' | 'partial'

interface QuestionSummary {
  question: Question
  responses: number
  options?: { label: string; count: number; percentage: number }[]
}

export function ResultsPanel({ open, onClose }: ResultsPanelProps) {
  const router = useRouter()
  const { form } = useFormBuilder()
  const supabase = createClient()
  
  // Pro feature checks
  const { shouldDisable: noAdvancedAnalytics } = useProFeature('advancedAnalytics')
  
  const [activeTab, setActiveTab] = useState<ResultsTab>('submissions')
  const [submissionFilter, setSubmissionFilter] = useState<SubmissionFilter>('completed')
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(false)
  const [enableLinkSharing, setEnableLinkSharing] = useState(false)
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0)

  const loadData = useCallback(async () => {
    if (!form.id) return
    
    setLoading(true)
    
    // Fetch responses
    const { data: responsesData, error: responsesError } = await supabase
      .from('responses')
      .select('*')
      .eq('form_id', form.id)
      .order('submitted_at', { ascending: false })

    if (!responsesError && responsesData) {
      setResponses(responsesData as Response[])
    }
    
    setLoading(false)
  }, [supabase, form.id])

  // Load data when panel is opened (called from onOpenChange)
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && form.id) {
      loadData()
    }
    if (!isOpen) {
      onClose()
    }
  }

  const handleRefresh = () => {
    loadData()
    setAnalyticsRefreshKey(prev => prev + 1)
  }

  const getQuestionSummaries = (): QuestionSummary[] => {
    const summaries: QuestionSummary[] = []
    
    form.questions.forEach((question) => {
      // Skip welcome and thank you screens
      if (question.type === 'welcome' || question.type === 'thank_you') return
      
      const questionResponses = responses.filter(
        (r) => r.answers[question.id] !== undefined
      )
      
      const summary: QuestionSummary = {
        question,
        responses: questionResponses.length,
      }
      
      // For multiple choice, checkbox, dropdown - calculate option breakdown
      if (['multiple_choice', 'checkbox', 'dropdown'].includes(question.type)) {
        const optionCounts: Record<string, number> = {}
        
        question.properties.options?.forEach((opt) => {
          optionCounts[opt.value] = 0
        })
        
        questionResponses.forEach((r) => {
          const answer = r.answers[question.id]
          if (Array.isArray(answer)) {
            answer.forEach((a) => {
              const key = String(a)
              if (optionCounts[key] !== undefined) optionCounts[key]++
            })
          } else if (typeof answer === 'string' && optionCounts[answer] !== undefined) {
            optionCounts[answer]++
          }
        })
        
        summary.options = question.properties.options?.map((opt) => ({
          label: opt.label,
          count: optionCounts[opt.value] || 0,
          percentage: questionResponses.length > 0 
            ? Math.round((optionCounts[opt.value] / questionResponses.length) * 100)
            : 0,
        }))
      }
      
      summaries.push(summary)
    })
    
    return summaries
  }

  const completedResponses = responses.filter((r) => {
    // A response is complete if it has answers for all required questions
    const requiredQuestions = form.questions.filter(
      (q) => q.required && q.type !== 'welcome' && q.type !== 'thank_you'
    )
    return requiredQuestions.every((q) => r.answers[q.id] !== undefined)
  })

  const partialResponses = responses.filter((r) => !completedResponses.includes(r))

  const getQuestionIcon = (type: string) => {
    const iconClass = "h-4 w-4"
    const iconMap: Record<string, React.ReactNode> = {
      multiple_choice: <ListBullets className={iconClass} weight="duotone" />,
      checkbox: <CheckSquare className={iconClass} weight="duotone" />,
      dropdown: <CaretDown className={iconClass} weight="duotone" />,
      rating: <Star className={iconClass} weight="duotone" />,
      scale: <ChartBar className={iconClass} weight="duotone" />,
      short_text: <TextT className={iconClass} weight="duotone" />,
      long_text: <TextAlignLeft className={iconClass} weight="duotone" />,
      email: <Envelope className={iconClass} weight="duotone" />,
      number: <Hash className={iconClass} weight="duotone" />,
      date: <Calendar className={iconClass} weight="duotone" />,
      yes_no: <CheckCircle className={iconClass} weight="duotone" />,
    }
    return iconMap[type] || <QuestionIcon className={iconClass} weight="duotone" />
  }

  const handleDownloadAttachments = () => {
    toast.info('Downloading attachments...')
    // In production, this would trigger a download of all file attachments
  }

  const handleDownloadPDF = () => {
    toast.info('Generating PDF report...')
    // In production, this would generate and download a PDF
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Form Results</SheetTitle>
        </SheetHeader>

        <div className="h-[calc(100vh-80px)]">
          {/* Tabs Header */}
          <div className="px-6 py-3 border-b flex items-center justify-between">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ResultsTab)}>
              <TabsList className="bg-transparent gap-2">
                <TabsTrigger 
                  value="submissions"
                  className="data-[state=active]:bg-muted rounded-md px-4"
                >
                  Submissions
                </TabsTrigger>
                <TabsTrigger 
                  value="summary"
                  className="data-[state=active]:bg-muted rounded-md px-4"
                >
                  Summary
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className="data-[state=active]:bg-muted rounded-md px-4"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {activeTab === 'submissions' && (
              <Button variant="outline" size="sm" onClick={handleDownloadAttachments}>
                <Download className="h-4 w-4 mr-2" />
                Download attachments
              </Button>
            )}

            {activeTab === 'analytics' && (
              <Button variant="ghost" size="sm" onClick={handleRefresh}>
                <ArrowsClockwise className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>

          <ScrollArea className="h-[calc(100%-60px)]">
            {/* Submissions Tab */}
            {activeTab === 'submissions' && (
              <div className="p-6">
                {/* Completed/Partial Toggle */}
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setSubmissionFilter('completed')}
                    className={cn(
                      'flex items-center gap-2 pb-2 border-b-2 transition-colors',
                      submissionFilter === 'completed'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Completed
                    <Badge variant="secondary" className="rounded-full">
                      {completedResponses.length}
                    </Badge>
                  </button>
                  <button
                    onClick={() => setSubmissionFilter('partial')}
                    className={cn(
                      'flex items-center gap-2 pb-2 border-b-2 transition-colors',
                      submissionFilter === 'partial'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    Partial
                    <Badge variant="secondary" className="rounded-full">
                      {partialResponses.length}
                    </Badge>
                  </button>
                </div>

                <Separator className="mb-6" />

                {/* Submissions List */}
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Loading submissions...
                  </div>
                ) : (submissionFilter === 'completed' ? completedResponses : partialResponses).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No {submissionFilter} submissions yet. Please{' '}
                    <button className="text-primary underline" onClick={onClose}>
                      share
                    </button>{' '}
                    your form to the world to start collecting submissions.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(submissionFilter === 'completed' ? completedResponses : partialResponses).map((response) => (
                      <div
                        key={response.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            {new Date(response.submitted_at).toLocaleString()}
                          </span>
                          <Badge variant="outline">
                            {Object.keys(response.answers).length} answers
                          </Badge>
                        </div>
                        <div className="text-sm">
                          {Object.entries(response.answers).slice(0, 2).map(([questionId, answer]) => {
                            const question = form.questions.find((q) => q.id === questionId)
                            return (
                              <div key={questionId} className="truncate">
                                <span className="font-medium">{question?.title}:</span>{' '}
                                <span className="text-muted-foreground">
                                  {typeof answer === 'object' ? JSON.stringify(answer) : String(answer)}
                                </span>
                              </div>
                            )
                          })}
                          {Object.keys(response.answers).length > 2 && (
                            <span className="text-muted-foreground">
                              +{Object.keys(response.answers).length - 2} more...
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === 'summary' && (
              <div className="flex">
                {/* Main Content */}
                <div className="flex-1 p-6">
                  {getQuestionSummaries().map((summary) => (
                    <div key={summary.question.id} className="mb-8 pb-8 border-b last:border-0">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="text-lg bg-muted rounded px-2 py-1">
                          {getQuestionIcon(summary.question.type)}
                        </span>
                        <div>
                          <h3 className="font-medium">{summary.question.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {summary.responses === 0
                              ? 'No one answered this question yet'
                              : `${summary.responses} response${summary.responses !== 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </div>

                      {/* Option breakdown for choice questions */}
                      {summary.options && (
                        <div className="ml-10 space-y-3 mt-4">
                          {summary.options.map((option) => (
                            <div key={option.label}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm">{option.label}</span>
                                <span className="text-sm text-muted-foreground">
                                  {option.count} responses • {option.percentage}%
                                </span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-400 rounded-full transition-all"
                                  style={{ width: `${option.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {getQuestionSummaries().length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No questions to summarize yet.
                    </div>
                  )}

                  <Separator className="my-6" />

                  <p className="text-sm text-muted-foreground text-center">
                    Open ended questions like short and long text input, contact info, address etc. are not included in this report.
                  </p>
                  <p className="text-sm text-center mt-2">
                    Finding issues with summary not being consistent with submissions?{' '}
                    <button className="text-primary hover:underline" onClick={handleRefresh}>
                      Click here
                    </button>{' '}
                    to generate it again.
                  </p>
                </div>

                {/* Sharing Sidebar */}
                <div className="w-72 border-l p-6">
                  <h3 className="font-semibold mb-4">Sharing Options</h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Enable Link Sharing</span>
                    <Switch
                      checked={enableLinkSharing}
                      onCheckedChange={setEnableLinkSharing}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mb-6">
                    Link sharing lets you share the summary report with anyone, no login required. The report updates in real-time with new responses.
                  </p>

                  <Button className="w-full" onClick={handleDownloadPDF}>
                    Download PDF Report
                  </Button>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="p-6">
                {noAdvancedAnalytics ? (
                  <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-primary" weight="fill" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                      Get detailed insights into form performance, drop-off rates, and completion times. Upgrade to Pro to unlock.
                    </p>
                    <Button onClick={() => router.push('/billing')}>
                      Upgrade to Pro
                    </Button>
                  </div>
                ) : form.id ? (
                  <AdvancedAnalytics formId={form.id} refreshKey={analyticsRefreshKey} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Save your form to see analytics.
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
