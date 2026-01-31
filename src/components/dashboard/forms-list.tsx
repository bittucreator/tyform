'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DotsThree, PencilSimple, Eye, ChartBar, Copy, Trash, FileText, MagnifyingGlass } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  const [search, setMagnifyingGlass] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const router = useRouter()
  const supabase = createClient()

  // Filter forms
  const filteredForms = forms.filter(form => {
    const matchesMagnifyingGlass = form.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && form.is_published) ||
      (statusFilter === 'draft' && !form.is_published)
    return matchesMagnifyingGlass && matchesStatus
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
      {/* Forms Table */}
      <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-border/50">
          <div>
            <h2 className="font-semibold text-[14px] tracking-tight">All Forms</h2>
            <p className="text-[12px] text-muted-foreground/70 mt-0.5">
              {filteredForms.length} form{filteredForms.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" strokeWidth={1.5} />
              <Input 
                placeholder="MagnifyingGlass forms..." 
                className="pl-9 h-8 text-[12px] w-full sm:w-40"
                value={search}
                onChange={(e) => setMagnifyingGlass(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-27.5 h-8 text-[12px]">
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
        
        {filteredForms.length === 0 ? (
          <div className="p-6 m-4 text-center border border-dashed border-border/50 rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-5 h-5 text-muted-foreground/40" strokeWidth={1.5} />
            </div>
            <p className="font-medium text-[13px] tracking-tight mb-1">No forms found</p>
            <p className="text-muted-foreground/70 text-[12px]">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters' 
                : 'Create a form to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[12px]">Name</TableHead>
                  <TableHead className="text-[12px]">Status</TableHead>
                  <TableHead className="text-[12px] hidden sm:table-cell">Questions</TableHead>
                  <TableHead className="text-[12px] hidden sm:table-cell">Responses</TableHead>
                  <TableHead className="text-[12px] hidden md:table-cell">Updated</TableHead>
                  <TableHead className="text-[12px] w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForms.map((form) => (
                  <TableRow 
                    key={form.id} 
                    className="group cursor-pointer"
                    onClick={() => router.push(`/forms/${form.id}/edit`)}
                  >
                    <TableCell>
                      <Link 
                        href={`/forms/${form.id}/edit`}
                        className="font-medium text-[13px] hover:underline block truncate max-w-50 sm:max-w-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {form.title}
                      </Link>
                      {form.description && (
                        <p className="text-[11px] text-muted-foreground/60 truncate max-w-50 sm:max-w-xs mt-0.5">
                          {form.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`text-[10px] border-0 ${
                          form.is_published 
                            ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' 
                            : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
                        }`}
                      >
                        {form.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground font-mono tabular-nums hidden sm:table-cell">
                      {form.questions?.length || 0}
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground font-mono tabular-nums hidden sm:table-cell">
                      {responseCountMap[form.id] || 0}
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground hidden md:table-cell">
                      {formatDistanceToNow(new Date(form.updated_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <DotsThree className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem asChild>
                            <Link href={`/forms/${form.id}/edit`} className="cursor-pointer text-[12px]">
                              <PencilSimple className="mr-2 h-3.5 w-3.5" />
                              PencilSimple form
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
