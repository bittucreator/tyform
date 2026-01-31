'use client'

import { useEffect, useState } from 'react'
import { 
  ArrowDown, 
  Clock, 
  MapPin, 
  Monitor, 
  DeviceMobile, 
  DeviceTablet,
  TrendDown,
  Users,
  Globe,
  SpinnerGap,
  WarningCircle,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/analytics-tracking'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface FunnelStep {
  questionId: string
  questionTitle: string
  questionTextT: string
  views: number
  completions: number
  dropOffs: number
  dropOffRate: number
  conversionRate: number
}

interface TimeData {
  questionId: string
  questionTitle: string
  avgTime: number
  minTime: number
  maxTime: number
  totalResponses: number
}

interface GeoLocation {
  country: string
  city?: string
  region?: string
  latitude?: number
  longitude?: number
  count: number
}

interface DeviceData {
  device: string
  count: number
  percentage: number
}

interface CountryData {
  country: string
  count: number
}

interface AnalyticsSummary {
  totalViews: number
  totalCompletions: number
  totalDropOffs: number
  completionRate: number
}

interface FunnelAnalyticsData {
  funnel: FunnelStep[]
  timeAnalytics: TimeData[]
  avgCompletionTime: number
  geoData: GeoLocation[]
  countryBreakdown: CountryData[]
  deviceBreakdown: DeviceData[]
  browserBreakdown: { browser: string; count: number; percentage: number }[]
  summary: AnalyticsSummary
}

interface AdvancedAnalyticsProps {
  formId: string
  refreshKey?: number
}

export function AdvancedAnalytics({ formId, refreshKey = 0 }: AdvancedAnalyticsProps) {
  const [data, setData] = useState<FunnelAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'funnel' | 'time' | 'geo'>('funnel')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/analytics/funnel?formId=${formId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch analytics')
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (formId) {
      fetchData()
    }
  }, [formId, refreshKey])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <WarningCircle className="h-5 w-5 mr-2" />
        {error}
      </div>
    )
  }

  if (!data || data.funnel.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <TrendDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No analytics data yet.</p>
        <p className="text-sm mt-2">Analytics will appear once you have submissions.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View Tabs */}
      <div className="flex gap-2 border-b pb-4">
        <button
          onClick={() => setActiveView('funnel')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeView === 'funnel' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          <TrendDown className="h-4 w-4 inline mr-2" />
          Conversion Funnel
        </button>
        <button
          onClick={() => setActiveView('time')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeView === 'time' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          Time Analytics
        </button>
        <button
          onClick={() => setActiveView('geo')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeView === 'geo' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          <Globe className="h-4 w-4 inline mr-2" />
          Geographic Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-sm">Total Views</span>
          </div>
          <p className="text-2xl font-bold">{data.summary.totalViews}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Users className="h-4 w-4" />
            <span className="text-sm">Completions</span>
          </div>
          <p className="text-2xl font-bold">{data.summary.totalCompletions}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <TrendDown className="h-4 w-4" />
            <span className="text-sm">Drop-offs</span>
          </div>
          <p className="text-2xl font-bold">{data.summary.totalDropOffs}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Avg. Time</span>
          </div>
          <p className="text-2xl font-bold">{formatTime(data.avgCompletionTime)}</p>
        </div>
      </div>

      {/* Funnel View */}
      {activeView === 'funnel' && (
        <FunnelChart funnel={data.funnel} />
      )}

      {/* Time Analytics View */}
      {activeView === 'time' && (
        <TimeChart timeData={data.timeAnalytics} avgTotal={data.avgCompletionTime} />
      )}

      {/* Geographic View */}
      {activeView === 'geo' && (
        <GeoChart 
          geoData={data.geoData} 
          countryBreakdown={data.countryBreakdown}
          deviceBreakdown={data.deviceBreakdown}
        />
      )}
    </div>
  )
}

// Funnel Chart Component
function FunnelChart({ funnel }: { funnel: FunnelStep[] }) {
  const maxViews = Math.max(...funnel.map(f => f.views), 1)

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Conversion Funnel</h3>
      <p className="text-sm text-muted-foreground">
        See where users drop off in your form. Wider bars indicate more users at that step.
      </p>
      
      <div className="space-y-3 mt-6">
        {funnel.map((step, index) => {
          const widthPercent = (step.views / maxViews) * 100
          const isHighDropOff = step.dropOffRate > 20
          
          return (
            <TooltipProvider key={step.questionId}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate max-w-[60%]">
                        {index + 1}. {step.questionTitle}
                      </span>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-green-600">{step.completions} completed</span>
                        {step.dropOffs > 0 && (
                          <span className={cn(
                            'flex items-center gap-1',
                            isHighDropOff ? 'text-red-600' : 'text-orange-500'
                          )}>
                            <ArrowDown className="h-3 w-3" />
                            {step.dropOffs} dropped
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-8 bg-muted rounded-lg overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-lg transition-all flex items-center justify-end pr-3',
                          isHighDropOff 
                            ? 'bg-linear-to-r from-green-500 to-red-400' 
                            : 'bg-linear-to-r from-green-500 to-green-400'
                        )}
                        style={{ width: `${widthPercent}%` }}
                      >
                        <span className="text-white text-xs font-medium">
                          {step.conversionRate}% conversion
                        </span>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p><strong>Views:</strong> {step.views}</p>
                    <p><strong>Completions:</strong> {step.completions}</p>
                    <p><strong>Drop-offs:</strong> {step.dropOffs}</p>
                    <p><strong>Drop-off rate:</strong> {step.dropOffRate}%</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>

      {/* Problem Areas */}
      {funnel.some(f => f.dropOffRate > 20) && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
          <h4 className="font-medium text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
            <WarningCircle className="h-4 w-4" weight="duotone" />
            High Drop-off Questions
          </h4>
          <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
            {funnel
              .filter(f => f.dropOffRate > 20)
              .map(f => (
                <li key={f.questionId}>
                  • &ldquo;{f.questionTitle}&rdquo; has a {f.dropOffRate}% drop-off rate
                </li>
              ))
            }
          </ul>
        </div>
      )}
    </div>
  )
}

// Time Chart Component
function TimeChart({ timeData, avgTotal }: { timeData: TimeData[]; avgTotal: number }) {
  const maxTime = Math.max(...timeData.map(t => t.avgTime), 1)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Time Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Average time spent on each question
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total avg. time</p>
          <p className="text-xl font-bold">{formatTime(avgTotal)}</p>
        </div>
      </div>
      
      <div className="space-y-3 mt-6">
        {timeData.map((item, index) => {
          const widthPercent = (item.avgTime / maxTime) * 100
          const isSlow = item.avgTime > avgTotal / timeData.length * 2
          
          return (
            <TooltipProvider key={item.questionId}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate max-w-[60%]">
                        {index + 1}. {item.questionTitle}
                      </span>
                      <span className={cn(
                        'text-sm font-medium',
                        isSlow ? 'text-orange-600' : 'text-muted-foreground'
                      )}>
                        {formatTime(item.avgTime)}
                      </span>
                    </div>
                    <div className="h-6 bg-muted rounded-lg overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-lg transition-all',
                          isSlow ? 'bg-orange-400' : 'bg-blue-400'
                        )}
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p><strong>Avg time:</strong> {formatTime(item.avgTime)}</p>
                    <p><strong>Min time:</strong> {formatTime(item.minTime)}</p>
                    <p><strong>Max time:</strong> {formatTime(item.maxTime)}</p>
                    <p><strong>Responses:</strong> {item.totalResponses}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>

      {/* Slow Questions */}
      {timeData.some(t => t.avgTime > avgTotal / timeData.length * 2) && (
        <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
          <h4 className="font-medium text-orange-700 dark:text-orange-300 mb-2">
            🐢 Slow Questions
          </h4>
          <p className="text-sm text-orange-600 dark:text-orange-400">
            Consider simplifying these questions to improve completion rates.
          </p>
        </div>
      )}
    </div>
  )
}

// Geographic Chart Component
function GeoChart({ 
  geoData, 
  countryBreakdown,
  deviceBreakdown 
}: { 
  geoData: GeoLocation[]
  countryBreakdown: CountryData[]
  deviceBreakdown: DeviceData[]
}) {
  const totalResponses = countryBreakdown.reduce((sum, c) => sum + c.count, 0)

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <Monitor className="h-4 w-4" />
      case 'mobile': return <DeviceMobile className="h-4 w-4" />
      case 'tablet': return <DeviceTablet className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-lg">Geographic Data</h3>
        <p className="text-sm text-muted-foreground">
          Where your responses are coming from
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Country Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Top Countries
          </h4>
          {countryBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No geographic data available</p>
          ) : (
            <div className="space-y-2">
              {countryBreakdown.slice(0, 10).map((country) => {
                const percentage = Math.round((country.count / totalResponses) * 100)
                return (
                  <div key={country.country} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{country.country}</span>
                        <span className="text-sm text-muted-foreground">
                          {country.count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Device Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Devices
          </h4>
          {deviceBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No device data available</p>
          ) : (
            <div className="space-y-3">
              {deviceBreakdown.map((device) => (
                <div key={device.device} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    {getDeviceIcon(device.device)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{device.device}</span>
                      <span className="text-sm text-muted-foreground">
                        {device.count} ({device.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Visualization (simplified dot map) */}
      {geoData.length > 0 && geoData[0].latitude && (
        <div className="mt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4" />
            Response Locations
          </h4>
          <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
            {/* Simple world map background */}
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
              <Globe className="h-32 w-32" />
            </div>
            {/* Location dots */}
            <div className="absolute inset-0 p-4">
              {geoData.slice(0, 20).map((loc, i) => {
                if (!loc.latitude || !loc.longitude) return null
                // Convert lat/lng to relative position (simplified)
                const x = ((loc.longitude + 180) / 360) * 100
                const y = ((90 - loc.latitude) / 180) * 100
                return (
                  <TooltipProvider key={i}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute h-3 w-3 rounded-full bg-primary animate-pulse cursor-pointer"
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <p className="font-medium">{loc.city || loc.country}</p>
                          <p className="text-muted-foreground">{loc.count} responses</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* City Breakdown */}
      {geoData.some(g => g.city) && (
        <div className="mt-4">
          <h4 className="font-medium mb-3">Top Cities</h4>
          <div className="flex flex-wrap gap-2">
            {geoData
              .filter(g => g.city)
              .slice(0, 10)
              .map((loc, i) => (
                <div 
                  key={i}
                  className="px-3 py-1 bg-muted rounded-full text-sm"
                >
                  {loc.city}, {loc.country} ({loc.count})
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}
