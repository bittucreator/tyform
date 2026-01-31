import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns'
import type { Form, Response as FormResponse } from '@/types/database'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('formId')
    const days = parseInt(searchParams.get('days') || '30')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get forms query
    let formsQuery = supabase.from('forms').select('*').eq('user_id', user.id)
    if (formId) {
      formsQuery = formsQuery.eq('id', formId)
    }
    
    const { data: formsData, error: formsError } = await formsQuery
    if (formsError) {
      console.error('Forms query error:', formsError)
      return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 })
    }
    
    const forms = (formsData || []) as Form[]

    if (forms.length === 0) {
      return NextResponse.json({
        overview: {
          totalForms: 0,
          publishedForms: 0,
          totalResponses: 0,
          avgResponsesPerForm: 0,
          completionRate: 0,
        },
        responseTrends: [],
        formPerformance: [],
        fieldAnalytics: [],
      })
    }

    const formIds = forms.map(f => f.id)
    
    // Get responses with date filter
    const startDate = startOfDay(subDays(new Date(), days))
    const { data: responsesData, error: responsesError } = await supabase
      .from('responses')
      .select('*')
      .in('form_id', formIds)
      .gte('submitted_at', startDate.toISOString())
      .order('submitted_at', { ascending: true })

    if (responsesError) {
      console.error('Responses query error:', responsesError)
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 })
    }

    const allResponses = (responsesData || []) as FormResponse[]

    // Calculate overview stats
    const publishedForms = forms.filter(f => f.is_published).length
    const totalResponses = allResponses.length
    const avgResponsesPerForm = forms.length > 0 ? Math.round(totalResponses / forms.length) : 0

    // Calculate completion rate (responses with all required fields filled)
    const completedResponses = allResponses.filter(r => {
      const data = r.answers as Record<string, unknown>
      return data && Object.keys(data).length > 0
    }).length
    const completionRate = totalResponses > 0 
      ? Math.round((completedResponses / totalResponses) * 100) 
      : 0

    // Response trends by day
    const dateRange = eachDayOfInterval({
      start: startDate,
      end: new Date()
    })

    const responseTrends = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayResponses = allResponses.filter(r => 
        format(new Date(r.submitted_at), 'yyyy-MM-dd') === dateStr
      )
      return {
        date: format(date, 'MMM dd'),
        fullDate: dateStr,
        responses: dayResponses.length,
      }
    })

    // Form performance
    const formPerformance = forms.map(form => {
      const formResponses = allResponses.filter(r => r.form_id === form.id)
      const percentage = totalResponses > 0 
        ? Math.round((formResponses.length / totalResponses) * 100)
        : 0
      return {
        id: form.id,
        name: form.title,
        responses: formResponses.length,
        percentage,
        isPublished: form.is_published,
      }
    }).sort((a, b) => b.responses - a.responses)

    // Field-level analytics (aggregate across forms if no specific form selected)
    const fieldAnalytics: Array<{
      fieldId: string
      fieldLabel: string
      fieldType: string
      totalAnswers: number
      answerBreakdown: Array<{ value: string; count: number; percentage: number }>
    }> = []

    if (formId && forms.length === 1) {
      const form = forms[0]
      const fields = (form.questions || []) as Array<{
        id: string
        type: string
        title: string
        properties?: { options?: Array<{ id: string; label: string }> }
      }>

      for (const field of fields) {
        const answers = allResponses
          .map(r => {
            const data = r.answers as Record<string, unknown>
            return data?.[field.id]
          })
          .filter(Boolean)

        // For choice-based fields, calculate breakdown
        if (['multiple_choice', 'dropdown', 'checkboxes', 'rating'].includes(field.type)) {
          const breakdown: Record<string, number> = {}
          
          answers.forEach(answer => {
            if (Array.isArray(answer)) {
              answer.forEach(a => {
                breakdown[String(a)] = (breakdown[String(a)] || 0) + 1
              })
            } else {
              breakdown[String(answer)] = (breakdown[String(answer)] || 0) + 1
            }
          })

          const total = Object.values(breakdown).reduce((a, b) => a + b, 0)
          const answerBreakdown = Object.entries(breakdown)
            .map(([value, count]) => ({
              value: field.properties?.options?.find(o => o.id === value)?.label || value,
              count,
              percentage: total > 0 ? Math.round((count / total) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count)

          fieldAnalytics.push({
            fieldId: field.id,
            fieldLabel: field.title,
            fieldType: field.type,
            totalAnswers: answers.length,
            answerBreakdown,
          })
        } else if (field.type === 'rating') {
          const breakdown: Record<string, number> = {}
          answers.forEach(answer => {
            breakdown[String(answer)] = (breakdown[String(answer)] || 0) + 1
          })

          const total = Object.values(breakdown).reduce((a, b) => a + b, 0)
          const answerBreakdown = Object.entries(breakdown)
            .map(([value, count]) => ({
              value: `${value} stars`,
              count,
              percentage: total > 0 ? Math.round((count / total) * 100) : 0
            }))
            .sort((a, b) => parseInt(b.value) - parseInt(a.value))

          fieldAnalytics.push({
            fieldId: field.id,
            fieldLabel: field.title,
            fieldType: field.type,
            totalAnswers: answers.length,
            answerBreakdown,
          })
        }
      }
    }

    return NextResponse.json({
      overview: {
        totalForms: forms.length,
        publishedForms,
        totalResponses,
        avgResponsesPerForm,
        completionRate,
      },
      responseTrends,
      formPerformance,
      fieldAnalytics,
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
