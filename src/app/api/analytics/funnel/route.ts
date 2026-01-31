import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Form, Response as FormResponse } from '@/types/database'

interface QuestionTime {
  questionId: string
  questionTitle: string
  avgTime: number
  minTime: number
  maxTime: number
  totalResponses: number
}

interface FunnelStep {
  questionId: string
  questionTitle: string
  questionType: string
  views: number
  completions: number
  dropOffs: number
  dropOffRate: number
  conversionRate: number
}

interface GeoLocation {
  country: string
  city?: string
  region?: string
  latitude?: number
  longitude?: number
  count: number
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('formId')

    if (!formId) {
      return NextResponse.json({ error: 'Form ID required' }, { status: 400 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .eq('user_id', user.id)
      .single()

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const formData = form as Form
    const questions = formData.questions.filter(q => 
      q.type !== 'welcome' && q.type !== 'thank_you'
    )

    // Get all responses for this form
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false })

    if (responsesError) {
      console.error('Responses error:', responsesError)
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 })
    }

    const allResponses = (responses || []) as FormResponse[]
    
    // Separate complete and drop-off responses
    const completeResponses = allResponses.filter(r => 
      !(r.metadata as Record<string, unknown>)?.isDropOff
    )
    const dropOffResponses = allResponses.filter(r => 
      (r.metadata as Record<string, unknown>)?.isDropOff
    )

    // Calculate Conversion Funnel
    const funnel: FunnelStep[] = questions.map((question, index) => {
      // Count views (anyone who reached this question)
      const views = completeResponses.length + dropOffResponses.filter(r => {
        const meta = r.metadata as Record<string, unknown>
        const times = meta?.questionTimes as Record<string, number> | undefined
        return times && times[question.id] !== undefined
      }).length

      // Count completions (anyone who answered this question)
      const completions = completeResponses.filter(r => {
        const answers = r.answers as Record<string, unknown>
        return answers[question.id] !== undefined
      }).length

      // Count drop-offs (people who dropped off at this exact question)
      const dropOffs = dropOffResponses.filter(r => {
        const meta = r.metadata as Record<string, unknown>
        return meta?.dropOffQuestionId === question.id
      }).length

      return {
        questionId: question.id,
        questionTitle: question.title || `Question ${index + 1}`,
        questionType: question.type,
        views,
        completions,
        dropOffs,
        dropOffRate: views > 0 ? Math.round((dropOffs / views) * 100) : 0,
        conversionRate: views > 0 ? Math.round((completions / views) * 100) : 0,
      }
    })

    // Calculate Time Analytics
    const timeAnalytics: QuestionTime[] = questions.map((question, index) => {
      const times: number[] = []
      
      allResponses.forEach(r => {
        const meta = r.metadata as Record<string, unknown>
        const questionTimes = meta?.questionTimes as Record<string, number> | undefined
        if (questionTimes && questionTimes[question.id] !== undefined) {
          times.push(questionTimes[question.id])
        }
      })

      const avgTime = times.length > 0 
        ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
        : 0
      const minTime = times.length > 0 ? Math.min(...times) : 0
      const maxTime = times.length > 0 ? Math.max(...times) : 0

      return {
        questionId: question.id,
        questionTitle: question.title || `Question ${index + 1}`,
        avgTime,
        minTime,
        maxTime,
        totalResponses: times.length,
      }
    })

    // Total completion time
    const completionTimes: number[] = []
    completeResponses.forEach(r => {
      const meta = r.metadata as Record<string, unknown>
      if (meta?.startedAt && meta?.completedAt) {
        const start = new Date(meta.startedAt as string).getTime()
        const end = new Date(meta.completedAt as string).getTime()
        const diffSeconds = Math.round((end - start) / 1000)
        if (diffSeconds > 0 && diffSeconds < 3600) { // Exclude outliers (> 1 hour)
          completionTimes.push(diffSeconds)
        }
      }
    })

    const avgCompletionTime = completionTimes.length > 0
      ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
      : 0

    // Calculate Geographic Data
    const geoMap = new Map<string, GeoLocation>()
    
    completeResponses.forEach(r => {
      const meta = r.metadata as Record<string, unknown>
      const country = meta?.country as string | undefined
      if (country) {
        const key = `${country}-${meta?.city || 'unknown'}`
        const existing = geoMap.get(key)
        if (existing) {
          existing.count++
        } else {
          geoMap.set(key, {
            country,
            city: meta?.city as string | undefined,
            region: meta?.region as string | undefined,
            latitude: meta?.latitude as number | undefined,
            longitude: meta?.longitude as number | undefined,
            count: 1,
          })
        }
      }
    })

    const geoData = Array.from(geoMap.values()).sort((a, b) => b.count - a.count)

    // Country breakdown
    const countryMap = new Map<string, number>()
    geoData.forEach(g => {
      countryMap.set(g.country, (countryMap.get(g.country) || 0) + g.count)
    })
    const countryBreakdown = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)

    // Device breakdown
    const deviceMap = new Map<string, number>()
    const browserMap = new Map<string, number>()
    const osMap = new Map<string, number>()

    completeResponses.forEach(r => {
      const meta = r.metadata as Record<string, unknown>
      if (meta?.device) {
        deviceMap.set(meta.device as string, (deviceMap.get(meta.device as string) || 0) + 1)
      }
      if (meta?.browser) {
        browserMap.set(meta.browser as string, (browserMap.get(meta.browser as string) || 0) + 1)
      }
      if (meta?.os) {
        osMap.set(meta.os as string, (osMap.get(meta.os as string) || 0) + 1)
      }
    })

    const deviceBreakdown = Array.from(deviceMap.entries())
      .map(([device, count]) => ({ device, count, percentage: Math.round((count / completeResponses.length) * 100) }))
      .sort((a, b) => b.count - a.count)

    const browserBreakdown = Array.from(browserMap.entries())
      .map(([browser, count]) => ({ browser, count, percentage: Math.round((count / completeResponses.length) * 100) }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      funnel,
      timeAnalytics,
      avgCompletionTime,
      geoData,
      countryBreakdown,
      deviceBreakdown,
      browserBreakdown,
      summary: {
        totalViews: allResponses.length,
        totalCompletions: completeResponses.length,
        totalDropOffs: dropOffResponses.length,
        completionRate: allResponses.length > 0 
          ? Math.round((completeResponses.length / allResponses.length) * 100)
          : 0,
      },
    })

  } catch (error) {
    console.error('Funnel analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
