'use client'

import { useState, useEffect } from 'react'
import { ChartBar, TrendUp, Users, FileText, SpinnerGap, Calendar } from '@phosphor-icons/react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ResponseTrendsChart } from './response-trends-chart'
import { FormPerformanceChart } from './form-performance-chart'
import { FieldAnalyticsChart } from './field-analytics-chart'

interface Form {
  id: string
  title: string
}

interface AnalyticsData {
  overview: {
    totalForms: number
    publishedForms: number
    totalResponses: number
    avgResponsesPerForm: number
    completionRate: number
  }
  responseTrends: Array<{
    date: string
    fullDate: string
    responses: number
  }>
  formPerformance: Array<{
    id: string
    name: string
    responses: number
    percentage: number
    isPublished: boolean
  }>
  fieldAnalytics: Array<{
    fieldId: string
    fieldLabel: string
    fieldTextT: string
    totalAnswers: number
    answerBreakdown: Array<{
      value: string
      count: number
      percentage: number
    }>
  }>
}

interface AnalyticsDashboardProps {
  forms: Form[]
}

export function AnalyticsDashboard({ forms }: AnalyticsDashboardProps) {
  const [selectedForm, setSelectedForm] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('30')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedForm !== 'all') {
          params.set('formId', selectedForm)
        }
        params.set('days', timeRange)

        const response = await fetch(`/api/analytics?${params}`)
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedForm, timeRange])

  const stats = data ? [
    {
      title: 'Total Forms',
      value: data.overview.totalForms,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Published',
      value: data.overview.publishedForms,
      icon: TrendUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Responses',
      value: data.overview.totalResponses,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Completion Rate',
      value: `${data.overview.completionRate}%`,
      icon: ChartBar,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ] : []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <SpinnerGap className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight">Analytics</h1>
          <p className="text-[13px] text-muted-foreground/80 mt-0.5">
            Overview of your forms performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-fit h-fit py-2 text-xs">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" align="end">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedForm} onValueChange={setSelectedForm}>
            <SelectTrigger className="w-fit h-fit py-2 text-xs">
              <SelectValue placeholder="All Forms" />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" align="end">
              <SelectItem value="all">All Forms</SelectItem>
              {forms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.title.length > 25 ? form.title.substring(0, 25) + '...' : form.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.title} 
            className="border border-border/50 rounded-lg bg-card p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </span>
            </div>
            <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      {data && data.overview.totalForms > 0 ? (
        <>
          {/* Response Trends */}
          <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h2 className="font-semibold text-[14px] tracking-tight">Response Trends</h2>
              <p className="text-[12px] text-muted-foreground/70 mt-0.5">
                Responses over the last {timeRange} days
              </p>
            </div>
            <div className="p-4">
              <ResponseTrendsChart data={data.responseTrends} />
            </div>
          </div>

          {/* Form Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
              <div className="p-4 border-b border-border/50">
                <h2 className="font-semibold text-[14px] tracking-tight">Form Performance</h2>
                <p className="text-[12px] text-muted-foreground/70 mt-0.5">
                  Responses by form
                </p>
              </div>
              <div className="p-4">
                <FormPerformanceChart data={data.formPerformance} />
              </div>
            </div>

            {/* Response Distribution */}
            <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
              <div className="p-4 border-b border-border/50">
                <h2 className="font-semibold text-[14px] tracking-tight">Response Distribution</h2>
                <p className="text-[12px] text-muted-foreground/70 mt-0.5">
                  Breakdown by form
                </p>
              </div>
              <div className="p-4 space-y-4">
                {data.formPerformance.slice(0, 5).map((form) => (
                  <div key={form.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[13px] truncate max-w-50">
                        {form.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-muted-foreground font-mono tabular-nums">
                          {form.responses}
                        </span>
                        <span className="text-[11px] text-muted-foreground/60">
                          ({form.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-chart-2 rounded-full transition-all"
                        style={{ width: `${Math.max(form.percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {data.formPerformance.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No response data yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Field Analytics (only when specific form is selected) */}
          {selectedForm !== 'all' && data.fieldAnalytics.length > 0 && (
            <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
              <div className="p-4 border-b border-border/50">
                <h2 className="font-semibold text-[14px] tracking-tight">Field Analytics</h2>
                <p className="text-[12px] text-muted-foreground/70 mt-0.5">
                  Response breakdown by field
                </p>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.fieldAnalytics.map((field) => (
                  <FieldAnalyticsChart key={field.fieldId} field={field} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="border border-dashed border-border/50 rounded-lg p-12 text-center">
          <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <ChartBar className="w-6 h-6 text-muted-foreground/40" strokeWidth={1.5} />
          </div>
          <p className="font-medium text-[14px] tracking-tight mb-1">No analytics yet</p>
          <p className="text-muted-foreground/70 text-[13px] max-w-sm mx-auto">
            Create and publish forms to start collecting data. Analytics will appear here once you receive responses.
          </p>
        </div>
      )}
    </div>
  )
}
