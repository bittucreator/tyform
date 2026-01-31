'use client'

import { useState } from 'react'
import { Plus, Copy, Check } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AddDomainButtonProps {
  userId: string
}

interface AddedDomain {
  domain: string
  verification_token: string
}

export function AddDomainButton({ userId }: AddDomainButtonProps) {
  const [newDomain, setNewDomain] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [addedDomain, setAddedDomain] = useState<AddedDomain | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const generateToken = () => {
    return 'tyform-verify-' + Math.random().toString(36).substring(2, 15)
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return

    // Basic domain validation
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
    if (!domainRegex.test(newDomain)) {
      toast.error('Please enter a valid domain')
      return
    }

    setIsAdding(true)
    const token = generateToken()

    const { error } = await supabase
      .from('domains')
      .insert({
        user_id: userId,
        domain: newDomain.toLowerCase(),
        verification_token: token,
      })

    if (error) {
      if (error.code === '23505') {
        toast.error('This domain is already registered')
      } else {
        toast.error('Failed to add domain')
      }
    } else {
      setAddedDomain({
        domain: newDomain.toLowerCase(),
        verification_token: token,
      })
      setNewDomain('')
      router.refresh()
    }

    setIsAdding(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    setAddedDomain(null)
    setNewDomain('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose()
      else setIsOpen(true)
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 text-[12px]">
          
          Add Domain
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {!addedDomain ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-[15px]">Add a custom domain</DialogTitle>
              <DialogDescription className="text-[13px]">
                Connect your own domain to host forms on your URL
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="forms.yourdomain.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                className="h-9 text-[13px]"
              />
              <p className="text-[11px] text-muted-foreground/60 mt-2">
                Enter a subdomain or domain you own (e.g., forms.example.com)
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[12px]"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddDomain}
                disabled={isAdding || !newDomain.trim()}
                size="sm"
                className="h-8 text-[12px]"
              >
                {isAdding ? 'Adding...' : 'Add Domain'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-[15px]">DNS Configuration</DialogTitle>
              <DialogDescription className="text-[13px]">
                Add these records to your domain&apos;s DNS settings for <span className="font-medium text-foreground">{addedDomain.domain}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {/* CNAME Record */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-[13px] font-medium">CNAME Record</p>
                  <p className="text-[11px] text-muted-foreground/60">Point your domain to Tyform</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">TextT</p>
                    <p className="font-mono text-[12px]">CNAME</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">Name</p>
                    <p className="font-mono text-[12px]">@</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">Value</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-[12px]">cname.tyform.app</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => copyToClipboard('cname.tyform.app', 'cname')}
                      >
                        {copiedField === 'cname' ? (
                          <Check className="h-2.5 w-2.5 text-green-500" />
                        ) : (
                          <Copy className="h-2.5 w-2.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* TXT Record */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-[13px] font-medium">TXT Record</p>
                  <p className="text-[11px] text-muted-foreground/60">Verify domain ownership</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">TextT</p>
                    <p className="font-mono text-[12px]">TXT</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">Name</p>
                    <p className="font-mono text-[12px]">_tyform</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">Value</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-[11px] truncate max-w-24">
                        {addedDomain.verification_token}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => copyToClipboard(addedDomain.verification_token, 'txt')}
                      >
                        {copiedField === 'txt' ? (
                          <Check className="h-2.5 w-2.5 text-green-500" />
                        ) : (
                          <Copy className="h-2.5 w-2.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground/60">
                DNS changes can take up to 48 hours to propagate. You can verify your domain from the domains list once the records are set.
              </p>
            </div>
            <DialogFooter>
              <Button
                size="sm"
                className="h-8 text-[12px]"
                onClick={handleClose}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
