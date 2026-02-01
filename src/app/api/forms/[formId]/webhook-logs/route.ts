import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify user has access to this form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, workspace_id')
      .eq('id', formId)
      .single()
    
    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }
    
    // Check workspace access
    if (form.workspace_id) {
      const { data: member } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', form.workspace_id)
        .eq('user_id', user.id)
        .single()
      
      if (!member) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }
    
    // Get query params for pagination and filtering
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status') as 'success' | 'failed' | 'pending' | null
    const webhookId = searchParams.get('webhookId')
    
    // Build query
    let query = supabase
      .from('webhook_logs')
      .select('*', { count: 'exact' })
      .eq('form_id', formId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (status && ['success', 'failed', 'pending'].includes(status)) {
      query = query.eq('status', status)
    }
    
    if (webhookId) {
      query = query.eq('webhook_id', webhookId)
    }
    
    const { data: logs, error: logsError, count } = await query
    
    if (logsError) {
      console.error('Error fetching webhook logs:', logsError)
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
    }
    
    // Get stats
    const { data: stats } = await supabase
      .from('webhook_logs')
      .select('status')
      .eq('form_id', formId)
    
    const successCount = stats?.filter(s => s.status === 'success').length || 0
    const failedCount = stats?.filter(s => s.status === 'failed').length || 0
    const pendingCount = stats?.filter(s => s.status === 'pending').length || 0
    
    return NextResponse.json({
      logs,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
      stats: {
        total: count || 0,
        success: successCount,
        failed: failedCount,
        pending: pendingCount,
        successRate: count ? Math.round((successCount / count) * 100) : 0,
      },
    })
  } catch (error) {
    console.error('Webhook logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Verify user has access to this form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, workspace_id')
      .eq('id', formId)
      .single()
    
    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }
    
    // Check workspace access (require admin/owner role for deletion)
    if (form.workspace_id) {
      const { data: member } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', form.workspace_id)
        .eq('user_id', user.id)
        .single()
      
      const memberRole = (member as { role: string } | null)?.role
      if (!memberRole || !['owner', 'admin'].includes(memberRole)) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    }
    
    // Get optional filters
    const searchParams = request.nextUrl.searchParams
    const olderThanDays = parseInt(searchParams.get('olderThanDays') || '0')
    const status = searchParams.get('status') as 'success' | 'failed' | 'pending' | null
    
    let query = supabase
      .from('webhook_logs')
      .delete()
      .eq('form_id', formId)
    
    if (olderThanDays > 0) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
      query = query.lt('created_at', cutoffDate.toISOString())
    }
    
    if (status && ['success', 'failed', 'pending'].includes(status)) {
      query = query.eq('status', status)
    }
    
    const { error: deleteError } = await query
    
    if (deleteError) {
      console.error('Error deleting webhook logs:', deleteError)
      return NextResponse.json({ error: 'Failed to delete logs' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete webhook logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
