import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateResponseInsights, askAboutResponses } from '@/lib/ai-insights'
import { isAIConfigured } from '@/lib/ai'
import { getWorkspaceSubscription } from '@/lib/billing'
import { hasFeature, type PlanType } from '@/lib/plans'
import type { Question, Response, Form } from '@/types/database'

// POST - Get AI insights for form responses
export async function POST(request: NextRequest) {
  try {
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: 'AI is not configured. Please set up API keys.' },
        { status: 503 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check Pro subscription for AI features
    const { data: membership } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .limit(1)
      .single() as { data: { workspace_id: string } | null }

    if (membership?.workspace_id) {
      const subscription = await getWorkspaceSubscription(membership.workspace_id)
      const isActive = subscription && (subscription.status === 'active' || subscription.status === 'trialing')
      const plan: PlanType = isActive ? 'pro' : 'free'
      
      if (!hasFeature(plan, 'aiFeatures')) {
        return NextResponse.json(
          { error: 'AI features require a Pro subscription', requiresPro: true },
          { status: 403 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'AI features require a Pro subscription', requiresPro: true },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, formId, question: userQuestion } = body

    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 })
    }

    // Get form and verify ownership
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .eq('user_id', user.id)
      .single()

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const typedForm = form as Form

    // Get responses
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false })
      .limit(100)

    if (responsesError) {
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 })
    }

    if (!responses || responses.length === 0) {
      return NextResponse.json(
        { error: 'No responses to analyze' },
        { status: 400 }
      )
    }

    const questions = (typedForm.questions || []) as Question[]
    const typedResponses = responses as Response[]

    switch (action) {
      case 'insights': {
        const insights = await generateResponseInsights(questions, typedResponses)
        return NextResponse.json({ insights })
      }

      case 'ask': {
        if (!userQuestion) {
          return NextResponse.json({ error: 'Question is required' }, { status: 400 })
        }
        
        const answer = await askAboutResponses(questions, typedResponses, userQuestion)
        return NextResponse.json({ answer })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Insights API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI analysis failed' },
      { status: 500 }
    )
  }
}
