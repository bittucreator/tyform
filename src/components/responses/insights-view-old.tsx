'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { 
  ChartLine,
  CaretDown,
  Share
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Form, Response, Question } from '@/types/database'

interface InsightsViewProps {
  form: Form
  responses: Response[]
}

type TimeFilter = '24h' | '7d' | '30d' | 'all'
type InsightTab = 'visits' | 'dropoff'

export function InsightsView({ form, responses }: InsightsViewProps) {
  const [activeTab, setActiveTab] = useState<InsightTab>('visits')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24h')
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)

  // Filter responses by time
  const filteredResponses = useMemo(() => {
    const now = new Date()
    return responses.filter(r => {
      const submitted = new Date(r.submitted_at)
      switch (timeFilter) {
        case '24h':
          return (now.getTime() - submitted.getTime()) <= 24 * 60 * 60 * 1000
        case '7d':
          return (now.getTime() - submitted.getTime()) <= 7 * 24 * 60 * 60 * 1000
        case '30d':
          return (now.getTime() - submitted.getTime()) <= 30 * 24 * 60 * 60 * 1000
        default:
          return true
      }
    })
  }, [responses, timeFilter])

  // Calculate stats
  const stats = useMemo(() => {
    // Unique visitors (based on IP or user agent)
    const uniqueVisitors = new Set(
      filteredResponses.map(r => r.metadata?.ip || r.metadata?.userAgent || r.id)
    ).size

    // Calculate average visit duration from responses that have timing data
    const durationsMs = filteredResponses
      .filter(r => r.metadata?.startedAt && r.metadata?.completedAt)
      .map(r => {
        const start = new Date(r.metadata!.startedAt!).getTime()
        const end = new Date(r.metadata!.completedAt!).getTime()
        return end - start
      })
    
    const avgDuration = durationsMs.length > 0 
      ? Math.round(durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length / 1000)
      : null

    return {
      visits: filteredResponses.length, // Simplified: using submissions as visits
      uniqueVisitors,
      submissions: filteredResponses.length,
      uniqueRespondents: uniqueVisitors,
      avgDuration,
    }
  }, [filteredResponses])

  // Calculate question drop-off data
  const dropOffData = useMemo(() => {
    const questions = form.questions.filter(q => q.type !== 'welcome' && q.type !== 'thank_you')
    
    return questions.map((question, index) => {
      // Count how many responses have this question answered
      const answered = filteredResponses.filter(r => {
        const answer = r.answers?.[question.id]
        return answer !== undefined && answer !== null && answer !== ''
      }).length

      // Count drop-offs (people who viewed but didn't complete)
      const dropOffs = filteredResponses.filter(r => 
        r.metadata?.dropOffQuestionId === question.id
      ).length

      const viewRate = filteredResponses.length > 0 
        ? Math.round((answered / filteredResponses.length) * 100) 
        : 0

      return {
        id: question.id,
        title: question.title,
        index: index + 1,
        answered,
        dropOffs,
        viewRate,
      }
    })
  }, [form.questions, filteredResponses])

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return '...'
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const timeFilterLabels: Record<TimeFilter, string> = {
    '24h': 'Last 24 hours',
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    'all': 'All time',
  }

  const hasData = responses.length > 0

  return (
    <div className="space-y-6">
      {/* Sub-tabs and time filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('visits')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-colors",
              activeTab === 'visits'
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Visits
          </button>
          <button
            onClick={() => setActiveTab('dropoff')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-colors",
              activeTab === 'dropoff'
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Question drop-off
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {timeFilterLabels[timeFilter]}
            <CaretDown className="h-4 w-4" />
          </button>
          
          {showTimeDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowTimeDropdown(false)} 
              />
              <div className="absolute right-0 top-full mt-2 bg-popover border border-border rounded-lg shadow-lg py-1 z-20 min-w-40">
                {(Object.keys(timeFilterLabels) as TimeFilter[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTimeFilter(key)
                      setShowTimeDropdown(false)
                    }}
                    className={cn(
                      "w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors",
                      timeFilter === key && "bg-muted"
                    )}
                  >
                    {timeFilterLabels[key]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {activeTab === 'visits' && (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-5 gap-4">
            <div className="border border-border/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Visits</div>
              <div className="text-2xl font-semibold">{stats.visits}</div>
            </div>
            <div className="border border-border/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Unique visitors</div>
              <div className="text-2xl font-semibold">{stats.uniqueVisitors}</div>
            </div>
            <div className="border border-border/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Submissions</div>
              <div className="text-2xl font-semibold">{stats.submissions}</div>
            </div>
            <div className="border border-border/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Unique respondents</div>
              <div className="text-2xl font-semibold">{stats.uniqueRespondents}</div>
            </div>
            <div className="border border-border/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Visit duration</div>
              <div className="text-2xl font-semibold">{formatDuration(stats.avgDuration)}</div>
            </div>
          </div>

          {/* Empty state or chart */}
          {!hasData ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="mb-4">
                <ChartLine className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Waiting for respondents
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                You&apos;ll see insights here once your form is out in the wild.
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                <Share className="h-4 w-4 mr-2" />
                Share your form
              </Button>
            </div>
          ) : (
            <div className="border border-border/50 rounded-lg p-6">
              <div className="text-center text-muted-foreground py-12">
                <ChartLine className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p>Visit trends chart coming soon</p>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'dropoff' && (
        <>
          {!hasData ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="mb-4">
                <ChartLine className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No drop-off data yet
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                Once you have responses, you&apos;ll see which questions cause users to leave.
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                <Share className="h-4 w-4 mr-2" />
                Share your form
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {dropOffData.map((item) => (
                <div 
                  key={item.id}
                  className="border border-border/50 rounded-lg p-4 flex items-center gap-4"
                >
                  <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {item.index}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.answered} answered • {item.dropOffs} drop-offs
                    </div>
                  </div>
                  <div className="shrink-0">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${item.viewRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 w-12 text-right text-sm font-medium">
                    {item.viewRate}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
