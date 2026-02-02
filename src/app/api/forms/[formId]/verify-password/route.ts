import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyFormPassword } from '@/lib/form-access'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required', valid: false },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Fetch form settings
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, settings')
      .eq('id', formId)
      .single()

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Form not found', valid: false },
        { status: 404 }
      )
    }

    const isValid = verifyFormPassword(form.settings || {}, password)

    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error('Error verifying form password:', error)
    return NextResponse.json(
      { error: 'Failed to verify password', valid: false },
      { status: 500 }
    )
  }
}
