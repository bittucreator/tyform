import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Type for form_views table (not yet in generated types)
interface FormView {
  id: string
  form_id: string
  visitor_id: string
  viewed_at: string
  started_form: boolean
  completed_form: boolean
  time_spent_seconds: number | null
  device_type: string | null
  browser: string | null
  referrer: string | null
  drop_off_question_id: string | null
}

// Type for responses
interface FormResponse {
  id: string
  form_id: string
  answers: Record<string, unknown>
  submitted_at: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const supabase = await createClient()
    const { formId } = await params
    const { searchParams } = new URL(request.url)
    
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify form ownership
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, title, questions')
      .eq('id', formId)
      .eq('user_id', user.id)
      .single()

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Get form views
    const { data: views } = await supabase
      .from('form_views')
      .select('*')
      .eq('form_id', formId)
      .gte('viewed_at', startDate.toISOString())
      .order('viewed_at', { ascending: true })

    // Get responses
    const { data: responses } = await supabase
      .from('responses')
      .select('*')
      .eq('form_id', formId)
      .gte('submitted_at', startDate.toISOString())
      .order('submitted_at', { ascending: true })

    const viewsData = (views || []) as FormView[]
    const responsesData = (responses || []) as FormResponse[]

    // Calculate overview metrics
    const totalViews = viewsData.length
    const uniqueVisitors = new Set(viewsData.map(v => v.visitor_id)).size
    const totalStarts = viewsData.filter(v => v.started_form).length
    const totalCompletions = responsesData.length
    const completionRate = totalViews > 0 
      ? Math.round((totalCompletions / totalViews) * 100) 
      : 0
    const startRate = totalViews > 0 
      ? Math.round((totalStarts / totalViews) * 100) 
      : 0

    // Average time spent
    const timesSpent = viewsData
      .filter(v => v.time_spent_seconds !== null)
      .map(v => v.time_spent_seconds as number)
    const avgTimeSpent = timesSpent.length > 0
      ? Math.round(timesSpent.reduce((a, b) => a + b, 0) / timesSpent.length)
      : null

    // Device breakdown
    const deviceCounts: Record<string, number> = {}
    viewsData.forEach(v => {
      const device = v.device_type || 'unknown'
      deviceCounts[device] = (deviceCounts[device] || 0) + 1
    })

    // Daily trends (for chart)
    const dailyData: Record<string, { views: number; submissions: number }> = {}
    
    // Initialize all days in range
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailyData[dateStr] = { views: 0, submissions: 0 }
    }

    // Count views per day
    viewsData.forEach(v => {
      const dateStr = new Date(v.viewed_at).toISOString().split('T')[0]
      if (dailyData[dateStr]) {
        dailyData[dateStr].views++
      }
    })

    // Count submissions per day
    responsesData.forEach(r => {
      const dateStr = new Date(r.submitted_at).toISOString().split('T')[0]
      if (dailyData[dateStr]) {
        dailyData[dateStr].submissions++
      }
    })

    // Convert to array sorted by date
    const trends = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        views: data.views,
        submissions: data.submissions,
      }))

    // Question drop-off analysis
    const questionDropOffs: Record<string, number> = {}
    viewsData.forEach(v => {
      if (v.drop_off_question_id) {
        questionDropOffs[v.drop_off_question_id] = 
          (questionDropOffs[v.drop_off_question_id] || 0) + 1
      }
    })

    const questions = (form.questions || []) as Array<{ id: string; title: string; type: string }>
    const dropOffAnalysis = questions
      .filter(q => q.type !== 'welcome' && q.type !== 'thank_you')
      .map((q, idx) => {
        // Calculate how many people answered this question
        const answeredCount = responsesData.filter(r => {
          const answers = r.answers as Record<string, unknown>
          const answer = answers?.[q.id]
          return answer !== undefined && answer !== null && answer !== ''
        }).length

        return {
          questionId: q.id,
          questionTitle: q.title,
          questionNumber: idx + 1,
          dropOffs: questionDropOffs[q.id] || 0,
          answered: answeredCount,
          answerRate: totalCompletions > 0 
            ? Math.round((answeredCount / totalCompletions) * 100) 
            : 0,
        }
      })

    // Referrer breakdown
    const referrerCounts: Record<string, number> = {}
    viewsData.forEach(v => {
      if (v.referrer) {
        try {
          const url = new URL(v.referrer)
          const domain = url.hostname
          referrerCounts[domain] = (referrerCounts[domain] || 0) + 1
        } catch {
          referrerCounts['Direct'] = (referrerCounts['Direct'] || 0) + 1
        }
      } else {
        referrerCounts['Direct'] = (referrerCounts['Direct'] || 0) + 1
      }
    })

    const topReferrers = Object.entries(referrerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count }))

    return NextResponse.json({
      overview: {
        totalViews,
        uniqueVisitors,
        totalStarts,
        startRate,
        totalCompletions,
        completionRate,
        avgTimeSpent,
      },
      devices: deviceCounts,
      trends,
      dropOffAnalysis,
      topReferrers,
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
