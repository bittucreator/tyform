import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function DELETE() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all workspaces owned by this user
    const { error: workspaceError } = await (supabase
      .from('workspaces') as ReturnType<typeof supabase.from>)
      .delete()
      .eq('owner_id', user.id)

    if (workspaceError) {
      console.error('Failed to delete workspaces:', workspaceError)
    }

    // Remove user from all workspace memberships
    const { error: memberError } = await (supabase
      .from('workspace_members') as ReturnType<typeof supabase.from>)
      .delete()
      .eq('user_id', user.id)

    if (memberError) {
      console.error('Failed to remove workspace memberships:', memberError)
    }

    // Delete all forms created by this user
    const { error: formsError } = await supabase
      .from('forms')
      .delete()
      .eq('user_id', user.id)

    if (formsError) {
      console.error('Failed to delete forms:', formsError)
    }

    // Delete user profile if exists
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('Failed to delete profile:', profileError)
    }

    // Delete the auth user using Admin API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && serviceRoleKey) {
      const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(user.id)
      
      if (deleteUserError) {
        console.error('Failed to delete auth user:', deleteUserError)
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
      }
    } else {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY for user deletion')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
