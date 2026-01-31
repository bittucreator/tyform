'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { DotsThree, PencilSimple, Eye, Trash, Copy, ChartBar } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Form } from '@/types/database'

interface FormCardProps {
  form: Form
}

export function FormCard({ form }: FormCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    const { error } = await supabase.from('forms').delete().eq('id', form.id)
    if (error) {
      toast.error('Failed to delete form')
    } else {
      toast.success('Form deleted')
      router.refresh()
    }
  }

  const handleDuplicate = async () => {
    const { error } = await supabase.from('forms').insert({
      user_id: form.user_id,
      title: `${form.title} (copy)`,
      description: form.description,
      questions: form.questions,
      settings: form.settings,
      is_published: false,
    })

    if (error) {
      toast.error('Failed to duplicate form')
    } else {
      toast.success('Form duplicated')
      router.refresh()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <>
      <Card className="group hover:shadow-xs transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Link href={`/forms/${form.id}/edit`}>
                <h3 className="font-semibold text-lg text-foreground truncate hover:underline transition-colors">
                  {form.title}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {form.description || 'No description'}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <DotsThree className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/forms/${form.id}/edit`}>
                    <PencilSimple className="mr-2 h-4 w-4" />
                    PencilSimple
                  </Link>
                </DropdownMenuItem>
                {form.is_published && (
                  <DropdownMenuItem asChild>
                    <Link href={`/f/${form.id}`} target="_blank">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={`/forms/${form.id}/responses`}>
                    <ChartBar className="mr-2 h-4 w-4" />
                    Responses
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{form.questions?.length || 0} questions</span>
            <span>•</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                form.is_published
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {form.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-3 bg-muted/50 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Updated {formatDate(form.updated_at)}
          </span>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete form?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the form and all its
              responses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
