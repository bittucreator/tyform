import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { nanoid } from 'nanoid'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB limit for social preview images

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }
  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminClient = getAdminClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const formId = formData.get('formId') as string
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    if (!formId) {
      return NextResponse.json({ error: 'Missing formId' }, { status: 400 })
    }
    
    // Verify file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` 
      }, { status: 400 })
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `social-previews/${user.id}/${formId}/${nanoid()}.${fileExt}`
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Upload to Supabase Storage using admin client to bypass RLS
    const { data, error } = await adminClient.storage
      .from('form-uploads')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })
    
    if (error) {
      console.error('Upload error:', error)
      if (error.message?.includes('bucket') || error.message?.includes('not found')) {
        return NextResponse.json({ 
          error: 'Storage bucket not configured. Please create a "form-uploads" bucket in Supabase.' 
        }, { status: 500 })
      }
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
    }
    
    // Get public URL
    const { data: urlData } = adminClient.storage
      .from('form-uploads')
      .getPublicUrl(data.path)
    
    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    })
  } catch (error) {
    console.error('Social preview upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
