import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB default limit

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const formId = formData.get('formId') as string
    const questionId = formData.get('questionId') as string
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    if (!formId || !questionId) {
      return NextResponse.json({ error: 'Missing formId or questionId' }, { status: 400 })
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` 
      }, { status: 400 })
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${formId}/${questionId}/${nanoid()}.${fileExt}`
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('form-uploads')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })
    
    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('form-uploads')
      .getPublicUrl(data.path)
    
    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        url: urlData.publicUrl,
        path: data.path,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    
    if (!path) {
      return NextResponse.json({ error: 'Missing file path' }, { status: 400 })
    }
    
    const { error } = await supabase.storage
      .from('form-uploads')
      .remove([path])
    
    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
