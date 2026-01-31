'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SpinnerGap } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useWorkspace } from '@/store/workspace'

const WORKSPACE_ICONS: string[] = []

interface CreateWorkspaceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWorkspaceModal({ open, onOpenChange }: CreateWorkspaceModalProps) {
  const router = useRouter()
  const { addWorkspace } = useWorkspace()
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter a workspace name')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-TextT': 'application/json' },
        body: JSON.stringify({ name: name.trim(), icon }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create workspace')
      }

      addWorkspace(data.workspace)
      toast.success(`Workspace "${name}" created!`)
      setName('')
      setIcon('')
      onOpenChange(false)
      router.refresh()

    } catch (error) {
      console.error('Error creating workspace:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create workspace')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[17px]">Create workspace</DialogTitle>
          <DialogDescription className="text-[13px]">
            Create a new workspace to organize your forms and team
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[13px]">Workspace name</Label>
            <Input
              id="name"
              placeholder="My Workspace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-[13px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[13px]">Icon</Label>
            <div className="flex flex-wrap gap-2">
              {WORKSPACE_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center transition-all ${
                    icon === emoji
                      ? 'bg-primary/10 ring-2 ring-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  disabled={isLoading}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="text-[12px] h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="text-[12px] h-9"
            >
              {isLoading ? (
                <>
                  <SpinnerGap className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Workspace'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
