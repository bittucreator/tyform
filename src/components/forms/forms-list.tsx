'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DotsThree, PencilSimple, Eye, ChartBar, Copy, Trash, FileText, MagnifyingGlass, Calendar, ChatCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { formatDistanceToNow } from 'date-fns'
import type { Form } from '@/types/database'

interface FormsListProps {
  forms: Form[]
  responseCountMap: Record<string, number>
}

export function FormsList({ forms: initialForms, responseCountMap }: FormsListProps) {
  const [forms, setForms] = useState(initialForms)
  const [deleteForm, setDeleteForm] = useState<Form | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const router = useRouter()
  const supabase = createClient()

  // Filter forms
  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && form.is_published) ||
      (statusFilter === 'draft' && !form.is_published)
    return matchesSearch && matchesStatus
  })

  const handleDelete = async () => {
    if (!deleteForm) return

    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', deleteForm.id)

    if (error) {
      toast.error('Failed to delete form')
    } else {
      setForms(forms.filter((f) => f.id !== deleteForm.id))
      toast.success('Form deleted')
    }
    setDeleteForm(null)
  }

  const handleDuplicate = async (form: Form) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('forms')
      .insert({
        user_id: user.id,
        title: `${form.title} (copy)`,
        description: form.description,
        questions: form.questions,
        settings: form.settings,
        is_published: false,
      })
      .select()
      .single()

    if (error) {
      toast.error('Failed to duplicate form')
    } else if (data) {
      setForms([data as Form, ...forms])
      toast.success('Form duplicated')
    }
  }

  return (
    <>
      {/* Header */}
      <div className="border border-border/50 rounded-xl bg-card overflow-hidden w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-border/50">
          <div className="min-w-0">
            <h2 className="font-semibold text-[14px] tracking-tight">All Forms</h2>
            <p className="text-[12px] text-muted-foreground/70 mt-0.5">
              {filteredForms.length} form{filteredForms.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>
          <div className="flex flex-row gap-2 shrink-0">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              <Input 
                placeholder="Search forms..." 
                className="pl-9 h-9 text-[12px] w-45"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-30 h-9 text-[12px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Empty State */}
        {filteredForms.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-muted-foreground/40" weight="duotone" />
            </div>
            <p className="font-medium text-[14px] mb-1">No forms found</p>
            <p className="text-muted-foreground/70 text-[13px]">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters' 
                : 'Create your first form to get started'}
            </p>
          </div>
        ) : (
          /* Forms List */
          <div className="divide-y divide-border/50">
            {filteredForms.map((form) => (
              <div 
                key={form.id} 
                className="group flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => router.push(`/forms/${form.id}/edit`)}
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  form.is_published 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                    : 'bg-muted'
                }`}>
                  <FileText className={`w-5 h-5 ${
                    form.is_published 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-muted-foreground'
                  }`} weight="duotone" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <Link 
                      href={`/forms/${form.id}/edit`}
                      className="font-medium text-[13px] hover:underline truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {form.title}
                    </Link>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      form.is_published 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                    }`}>
                      {form.is_published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  {form.description && (
                    <p className="text-[12px] text-muted-foreground/60 truncate mt-0.5 max-w-md">
                      {form.description}
                    </p>
                  )}
                </div>
                
                {/* Stats */}
                <div className="hidden sm:flex items-center gap-5 text-[12px] text-muted-foreground shrink-0">
                  <div className="flex items-center gap-1.5 min-w-15" title="Questions">
                    <ChatCircle className="w-4 h-4 text-muted-foreground/50" weight="duotone" />
                    <span className="font-medium tabular-nums">{form.questions?.length || 0}</span>
                    <span className="text-muted-foreground/50 text-[11px]">Q</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-15" title="Responses">
                    <ChartBar className="w-4 h-4 text-muted-foreground/50" weight="duotone" />
                    <span className="font-medium tabular-nums">{responseCountMap[form.id] || 0}</span>
                    <span className="text-muted-foreground/50 text-[11px]">R</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-25 text-muted-foreground/60" title="Last updated">
                    <Calendar className="w-4 h-4 text-muted-foreground/40" weight="duotone" />
                    <span className="truncate text-[11px]">
                      {formatDistanceToNow(new Date(form.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <DotsThree className="h-4 w-4" weight="bold" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem asChild>
                        <Link href={`/forms/${form.id}/edit`} className="cursor-pointer text-[12px]">
                          <PencilSimple className="mr-2 h-3.5 w-3.5" />
                          Edit form
                        </Link>
                      </DropdownMenuItem>
                      {form.is_published && (
                        <DropdownMenuItem asChild>
                          <Link href={`/f/${form.id}`} target="_blank" className="cursor-pointer text-[12px]">
                            <Eye className="mr-2 h-3.5 w-3.5" />
                            View live
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href={`/forms/${form.id}/responses`} className="cursor-pointer text-[12px]">
                          <ChartBar className="mr-2 h-3.5 w-3.5" />
                          View responses
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDuplicate(form)} className="cursor-pointer text-[12px]">
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer text-[12px]"
                        onClick={() => setDeleteForm(form)}
                      >
                        <Trash className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteForm} onOpenChange={() => setDeleteForm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[15px]">Delete form?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              This action cannot be undone. This will permanently delete &quot;{deleteForm?.title}&quot; and all its responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-[12px] h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-[12px] h-8"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
