'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash, Link as LinkIcon, Check, Pencil, Star, Copy } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Domain, DomainUrl, Form } from '@/types/database'

interface PrettyUrlsProps {
  domain: Domain
  forms: Form[]
}

export function PrettyUrls({ domain, forms }: PrettyUrlsProps) {
  const [urls, setUrls] = useState<DomainUrl[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [deleteUrl, setDeleteUrl] = useState<DomainUrl | null>(null)
  const [editUrl, setEditUrl] = useState<DomainUrl | null>(null)
  const [selectedForm, setSelectedForm] = useState('')
  const [slug, setSlug] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null)
    })
  }, [supabase.auth])

  const loadUrls = useCallback(async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('domain_urls')
      .select('*')
      .eq('domain_id', domain.id)
      .order('created_at', { ascending: false })
    
    setUrls((data as DomainUrl[]) || [])
    setIsLoading(false)
  }, [domain.id, supabase])

  useEffect(() => {
    loadUrls()
  }, [loadUrls])

  const handleSave = async () => {
    if (!selectedForm || !slug) {
      toast.error('Please select a form and enter a slug')
      return
    }

    // Validate slug
    const slugPattern = /^[a-z0-9-]+$/
    if (!slugPattern.test(slug)) {
      toast.error('Slug can only contain lowercase letters, numbers, and hyphens')
      return
    }

    setIsSaving(true)

    try {
      // If setting as default, unset other defaults first
      if (isDefault) {
        await supabase
          .from('domain_urls')
          .update({ is_default: false })
          .eq('domain_id', domain.id)
      }

      if (editUrl) {
        // Update existing
        const { error } = await supabase
          .from('domain_urls')
          .update({
            form_id: selectedForm,
            slug,
            is_default: isDefault,
            updated_at: new Date().toISOString()
          })
          .eq('id', editUrl.id)

        if (error) throw error
        toast.success('URL updated')
      } else {
        // Create new
        const { error } = await supabase
          .from('domain_urls')
          .insert({
            domain_id: domain.id,
            form_id: selectedForm,
            slug,
            is_default: isDefault,
            user_id: userId
          })

        if (error) {
          if (error.code === '23505') {
            toast.error('This slug is already in use')
          } else {
            throw error
          }
          return
        }
        toast.success('URL created')
      }

      await loadUrls()
      resetForm()
      setIsAddOpen(false)
      setEditUrl(null)
    } catch (error) {
      console.error(error)
      toast.error('Failed to save URL')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteUrl) return

    const { error } = await supabase
      .from('domain_urls')
      .delete()
      .eq('id', deleteUrl.id)

    if (error) {
      toast.error('Failed to delete URL')
    } else {
      setUrls(urls.filter(u => u.id !== deleteUrl.id))
      toast.success('URL deleted')
    }
    setDeleteUrl(null)
  }

  const resetForm = () => {
    setSelectedForm('')
    setSlug('')
    setIsDefault(false)
  }

  const openEdit = (url: DomainUrl) => {
    setEditUrl(url)
    setSelectedForm(url.form_id)
    setSlug(url.slug)
    setIsDefault(url.is_default)
    setIsAddOpen(true)
  }

  const copyUrl = (url: DomainUrl) => {
    const fullUrl = `https://${domain.domain}/${url.slug}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(url.id)
    toast.success('URL copied')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getFormName = (formId: string) => {
    const form = forms.find(f => f.id === formId)
    return form?.title || 'Unknown Form'
  }

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-medium">Pretty URLs</h3>
          <p className="text-[11px] text-muted-foreground">Map forms to custom URLs on your domain</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open)
          if (!open) {
            resetForm()
            setEditUrl(null)
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-7 text-[11px]">
              <Plus className="h-3 w-3 mr-1" />
              Add URL
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-[15px]">{editUrl ? 'Edit URL' : 'Add Pretty URL'}</DialogTitle>
              <DialogDescription className="text-[13px]">
                Create a memorable URL for your form on {domain.domain}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-[12px]">Select Form</Label>
                <Select value={selectedForm} onValueChange={setSelectedForm}>
                  <SelectTrigger className="h-9 text-[13px]">
                    <SelectValue placeholder="Choose a form" />
                  </SelectTrigger>
                  <SelectContent>
                    {forms.map(form => (
                      <SelectItem key={form.id} value={form.id} className="text-[13px]">
                        {form.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[12px]">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-muted-foreground">{domain.domain}/</span>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="contact"
                    className="h-9 text-[13px]"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Only lowercase letters, numbers, and hyphens</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isDefault" className="text-[12px] font-normal cursor-pointer">
                  Set as default (shows when visiting {domain.domain})
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)} className="h-8 text-[12px]">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-8 text-[12px]">
                {isSaving ? 'Saving...' : editUrl ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {urls.length === 0 ? (
        <div className="border border-dashed rounded-lg p-6 text-center">
          <LinkIcon className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-[12px] text-muted-foreground">No URLs configured yet</p>
          <p className="text-[11px] text-muted-foreground/60">Add a pretty URL to get started</p>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {urls.map(url => (
            <div key={url.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                {url.is_default && (
                  <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                )}
                <div>
                  <p className="text-[12px] font-medium">
                    {domain.domain}/{url.slug}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    → {getFormName(url.form_id)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => copyUrl(url)}
                >
                  {copiedId === url.id ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => openEdit(url)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => setDeleteUrl(url)}
                >
                  <Trash className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteUrl} onOpenChange={() => setDeleteUrl(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[15px]">Delete URL?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              This will remove {domain.domain}/{deleteUrl?.slug}. The form will still be accessible at its original Tyform URL.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-[12px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 h-8 text-[12px]"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
