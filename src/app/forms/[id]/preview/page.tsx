'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FormViewer } from '@/components/form-viewer'
import { Button } from '@/components/ui/button'
import { ArrowLeft, PencilSimple, Eye } from '@phosphor-icons/react'
import Link from 'next/link'
import type { Form } from '@/types/database'
import { use } from 'react'

interface PreviewPageProps {
  params: Promise<{ id: string }>
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadForm() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: formData, error: fetchError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !formData) {
        setError('Form not found or you do not have access to preview it.')
        setLoading(false)
        return
      }

      setForm(formData as Form)
      setLoading(false)
    }

    loadForm()
  }, [id, router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading preview...</div>
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{error || 'Form not found'}</p>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Preview Banner */}
      <div className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" weight="bold" />
          <span className="text-sm font-medium">
            Preview Mode {!form.is_published && '— This form is not published yet'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/forms/${id}/edit`}>
            <Button size="sm" variant="outline" className="bg-white/20 border-amber-600 text-amber-950 hover:bg-white/30">
              <PencilSimple className="h-4 w-4 mr-1" />
              Edit Form
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" variant="outline" className="bg-white/20 border-amber-600 text-amber-950 hover:bg-white/30">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Form Preview */}
      <div className="flex-1">
        <FormViewer form={form} submissionCount={0} isPreview />
      </div>
    </div>
  )
}
