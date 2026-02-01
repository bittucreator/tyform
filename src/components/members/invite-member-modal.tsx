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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Envelope, PaperPlaneTilt, SpinnerGap } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useWorkspace } from '@/store/workspace'

interface InviteMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function InviteMemberModal({ open, onOpenChange, onSuccess }: InviteMemberModalProps) {
  const router = useRouter()
  const { activeWorkspace } = useWorkspace()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Member')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    if (!activeWorkspace) {
      toast.error('Please select a workspace first')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, workspaceId: activeWorkspace.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      if (data.warning) {
        toast.warning(data.warning)
      } else {
        toast.success(`Invitation sent to ${email}`)
      }

      setEmail('')
      setRole('Member')
      onOpenChange(false)
      onSuccess?.()
      router.refresh()

    } catch (error) {
      console.error('Error sending invitation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-130">
        <DialogHeader>
          <DialogTitle className="text-[17px]">Invite team member</DialogTitle>
          <DialogDescription className="text-[13px]">
            Send an email invitation to join your workspace
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[13px]">Email address</Label>
            <div className="relative">
              <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-10 text-[13px]"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-[13px]">Role</Label>
            <Select value={role} onValueChange={setRole} disabled={isLoading}>
              <SelectTrigger className="h-10 text-[13px] w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="w-[calc(var(--radix-select-trigger-width))]">
                <SelectItem value="Admin" textValue="Admin" className="text-[13px] py-2.5">
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="font-medium">Admin</span>
                    <span className="text-[11px] text-muted-foreground">Full access to all features</span>
                  </div>
                </SelectItem>
                <SelectItem value="Member" textValue="Member" className="text-[13px] py-2.5">
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="font-medium">Member</span>
                    <span className="text-[11px] text-muted-foreground">Can create and manage forms</span>
                  </div>
                </SelectItem>
                <SelectItem value="Viewer" textValue="Viewer" className="text-[13px] py-2.5">
                  <div className="flex items-center justify-between w-full gap-4">
                    <span className="font-medium">Viewer</span>
                    <span className="text-[11px] text-muted-foreground">Can only view forms and responses</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
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
              disabled={isLoading || !email}
              className="text-[12px] h-9"
            >
              {isLoading ? (
                <>
                  <SpinnerGap className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <PaperPlaneTilt className="h-3.5 w-3.5 mr-1.5" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
