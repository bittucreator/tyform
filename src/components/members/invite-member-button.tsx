'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus } from '@phosphor-icons/react'
import { InviteMemberModal } from './invite-member-modal'

interface InviteMemberButtonProps {
  onSuccess?: () => void
}

export function InviteMemberButton({ onSuccess }: InviteMemberButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button size="sm" className="h-8 text-[12px]" onClick={() => setOpen(true)}>
        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
        Invite
      </Button>
      <InviteMemberModal open={open} onOpenChange={setOpen} onSuccess={onSuccess} />
    </>
  )
}
