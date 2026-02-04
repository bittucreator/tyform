import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateFormFromPrompt, suggestQuestions, improveQuestion } from '@/lib/ai-forms'
import { isAIConfigured } from '@/lib/ai'
import { getWorkspaceSubscription } from '@/lib/billing'
import { hasFeature, type PlanType } from '@/lib/plans'

// POST - Generate form from prompt
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

    // Get user's default workspace to check subscription
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
      // No workspace = free plan, no AI access
      return NextResponse.json(
        { error: 'AI features require a Pro subscription', requiresPro: true },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, prompt, formTitle, questions, question, questionCount } = body

    switch (action) {
      case 'generate-form': {
        if (!prompt) {
          return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
        }
        
        const result = await generateFormFromPrompt({
          prompt,
          questionCount: questionCount || 5,
          includeWelcome: true,
          includeThankYou: true,
        })
        
        return NextResponse.json({ form: result })
      }

      case 'suggest-questions': {
        if (!formTitle || !questions) {
          return NextResponse.json(
            { error: 'Form title and existing questions are required' },
            { status: 400 }
          )
        }
        
        const suggestions = await suggestQuestions(formTitle, questions, 3)
        return NextResponse.json({ questions: suggestions })
      }

      case 'improve-question': {
        if (!question) {
          return NextResponse.json({ error: 'Question is required' }, { status: 400 })
        }
        
        const improved = await improveQuestion(question)
        return NextResponse.json({ improved })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Forms API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI generation failed' },
      { status: 500 }
    )
  }
}
