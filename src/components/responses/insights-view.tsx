'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  ChartLine,
  CaretDown,
  Share,
  SpinnerGap,
  Desktop,
  DeviceMobile,
  DeviceTablet,
  Globe,
  TrendUp,
  TrendDown,
  Minus
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Form, Response } from '@/types/database'

interface InsightsViewProps {
  form: Form
  responses: Response[]
}

interface AnalyticsData {
  overview: {
    totalViews: number
    uniqueVisitors: number
    totalStarts: number
    startRate: number
    totalCompletions: number
    completionRate: number
    avgTimeSpent: number | null
  }
  devices: Record<string, number>
  trends: Array<{
    date: string
    views: number
    submissions: number
  }>
  dropOffAnalysis: Array<{
    questionId: string
    questionTitle: string
    questionNumber: number
    dropOffs: number
    answered: number
    answerRate: number
  }>
  topReferrers: Array<{
    domain: string
    count: number
  }>
}

type TimeFilter = '24h' | '7d' | '30d' | 'all'
type InsightTab = 'visits' | 'dropoff'

const TIME_FILTER_DAYS: Record<TimeFilter, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  'all': 365,
}

export function InsightsView({ form, responses }: InsightsViewProps) {
  const [activeTab, setActiveTab] = useState<InsightTab>('visits')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d')
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)
      try {
        const days = TIME_FILTER_DAYS[timeFilter]
        const response = await fetch(`/api/forms/${form.id}/analytics?days=${days}`)
        
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        } else {
          // If analytics table doesn't exist yet, use response-based fallback
          setAnalytics(null)
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
        setError('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [form.id, timeFilter])

  // Fallback stats from responses if analytics not available
  const fallbackStats = {
    totalViews: responses.length,
    uniqueVisitors: new Set(responses.map(r => r.metadata?.ip || r.id)).size,
    totalCompletions: responses.length,
    completionRate: 100,
    avgTimeSpent: null,
  }

  const stats = analytics?.overview || fallbackStats

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return '—'
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

  const hasData = responses.length > 0 || (analytics?.overview?.totalViews || 0) > 0

  // Device icon helper
  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <DeviceMobile className="w-4 h-4" />
      case 'tablet': return <DeviceTablet className="w-4 h-4" />
      default: return <Desktop className="w-4 h-4" />
    }
  }

  // Calculate device percentages
  const deviceTotal = Object.values(analytics?.devices || {}).reduce((a, b) => a + b, 0)
  const deviceBreakdown = Object.entries(analytics?.devices || {}).map(([device, count]) => ({
    device,
    count,
    percentage: deviceTotal > 0 ? Math.round((count / deviceTotal) * 100) : 0,
  }))

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
            Overview
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

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <SpinnerGap className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : activeTab === 'visits' ? (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="border border-border/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Views</div>
              <div className="text-2xl font-semibold">{stats.totalViews}</div>
            </div>
            <div className="border border-border/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Unique visitors</div>
              <div className="text-2xl font-semibold">{stats.uniqueVisitors}</div>
            </div>
            <div className="border border-border/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Submissions</div>
              <div className="text-2xl font-semibold">{stats.totalCompletions}</div>
            </div>
            <div className="border border-border/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Completion rate</div>
              <div className="text-2xl font-semibold flex items-center gap-2">
                {stats.completionRate}%
                {stats.completionRate > 50 ? (
                  <TrendUp className="w-5 h-5 text-green-500" />
                ) : stats.completionRate > 0 ? (
                  <Minus className="w-5 h-5 text-yellow-500" />
                ) : null}
              </div>
            </div>
            <div className="border border-border/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Avg. duration</div>
              <div className="text-2xl font-semibold">{formatDuration(stats.avgTimeSpent)}</div>
            </div>
          </div>

          {/* Charts and additional data */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Response Trends Mini-Chart */}
              <div className="border border-border/50 rounded-lg p-6">
                <h3 className="font-medium mb-4">Response Trends</h3>
                {analytics?.trends && analytics.trends.length > 0 ? (
                  <div className="h-40 flex items-end gap-1">
                    {analytics.trends.slice(-14).map((day, idx) => {
                      const maxSubmissions = Math.max(...analytics.trends.map(t => t.submissions), 1)
                      const height = (day.submissions / maxSubmissions) * 100
                      return (
                        <div
                          key={idx}
                          className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t cursor-pointer group relative"
                          style={{ height: `${Math.max(height, 4)}%` }}
                          title={`${day.date}: ${day.submissions} submissions`}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {day.submissions}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-muted-foreground">
                    No trend data available
                  </div>
                )}
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{analytics?.trends?.[analytics.trends.length - 14]?.date || ''}</span>
                  <span>{analytics?.trends?.[analytics.trends.length - 1]?.date || ''}</span>
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="border border-border/50 rounded-lg p-6">
                <h3 className="font-medium mb-4">Devices</h3>
                {deviceBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    {deviceBreakdown.map(({ device, count, percentage }) => (
                      <div key={device} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {getDeviceIcon(device)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{device}</span>
                            <span className="text-muted-foreground">{count}</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-muted-foreground">
                    No device data available
                  </div>
                )}
              </div>

              {/* Top Referrers */}
              <div className="border border-border/50 rounded-lg p-6">
                <h3 className="font-medium mb-4">Top Sources</h3>
                {analytics?.topReferrers && analytics.topReferrers.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.topReferrers.map(({ domain, count }, idx) => (
                      <div key={domain} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {idx + 1}
                        </div>
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1 text-sm truncate">{domain}</span>
                        <span className="text-sm text-muted-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-muted-foreground">
                    No referrer data available
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="border border-border/50 rounded-lg p-6">
                <h3 className="font-medium mb-4">Conversion Funnel</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Viewed form</span>
                      <span>{stats.totalViews}</span>
                    </div>
                    <div className="w-full h-3 bg-primary/80 rounded" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Started filling</span>
                      <span>{analytics?.overview?.totalStarts || Math.round(stats.totalViews * 0.7)}</span>
                    </div>
                    <div 
                      className="h-3 bg-primary/60 rounded" 
                      style={{ width: `${analytics?.overview?.startRate || 70}%` }}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completed</span>
                      <span>{stats.totalCompletions}</span>
                    </div>
                    <div 
                      className="h-3 bg-primary rounded" 
                      style={{ width: `${stats.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Drop-off tab */
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
              {(analytics?.dropOffAnalysis || []).map((item) => (
                <div 
                  key={item.questionId}
                  className="border border-border/50 rounded-lg p-4 flex items-center gap-4"
                >
                  <div className="shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {item.questionNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.questionTitle}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.answered} answered • {item.dropOffs} drop-offs
                    </div>
                  </div>
                  <div className="shrink-0 w-32">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          item.answerRate > 80 ? "bg-green-500" :
                          item.answerRate > 50 ? "bg-yellow-500" :
                          "bg-red-500"
                        )}
                        style={{ width: `${item.answerRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 w-12 text-right text-sm font-medium">
                    {item.answerRate}%
                  </div>
                </div>
              ))}
              
              {(!analytics?.dropOffAnalysis || analytics.dropOffAnalysis.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No question data available.</p>
                  <p className="text-sm mt-1">Add questions to your form to see drop-off analytics.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
