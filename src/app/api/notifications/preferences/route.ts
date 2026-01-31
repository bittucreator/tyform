import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// GET - Get notification preferences for user
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Get user's notification preferences
    const { data: preferences } = await adminClient
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Return default preferences if none exist
    if (!preferences) {
      return NextResponse.json({
        preferences: {
          email_notifications: true,
          weekly_digest: false,
          new_response: true,
          form_published: true,
          team_invite: true,
        }
      })
    }

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Update notification preferences
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      email_notifications, 
      weekly_digest, 
      new_response, 
      form_published, 
      team_invite 
    } = body

    const adminClient = createAdminClient()

    // Upsert notification preferences
    const { data: preferences, error } = await adminClient
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        email_notifications: email_notifications ?? true,
        weekly_digest: weekly_digest ?? false,
        new_response: new_response ?? true,
        form_published: form_published ?? true,
        team_invite: team_invite ?? true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating notification preferences:', error)
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
    }

    return NextResponse.json({ success: true, preferences })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
