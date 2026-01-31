'use client'

import { useState } from 'react'
import { Globe, Trash, Check, Clock, Copy, DotsThree, FileText, ArrowsClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import type { Domain } from '@/types/database'

interface DomainsListProps {
  domains: Domain[]
  userId: string
}

export function DomainsList({ domains: initialDomains }: DomainsListProps) {
  const [domains, setDomains] = useState(initialDomains)
  const [deleteDomain, setDeleteDomain] = useState<Domain | null>(null)
  const [viewRecordsDomain, setViewRecordsDomain] = useState<Domain | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [verifyingDomainId, setVerifyingDomainId] = useState<string | null>(null)
  const supabase = createClient()

  const handleDelete = async () => {
    if (!deleteDomain) return

    const { error } = await supabase
      .from('domains')
      .delete()
      .eq('id', deleteDomain.id)

    if (error) {
      toast.error('Failed to delete domain')
    } else {
      setDomains(domains.filter((d) => d.id !== deleteDomain.id))
      toast.success('Domain deleted')
    }
    setDeleteDomain(null)
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleVerify = async (domain: Domain) => {
    setVerifyingDomainId(domain.id)
    toast.info('Checking DNS records...')
    
    try {
      const response = await fetch('/api/domains/verify', {
        method: 'POST',
        headers: { 'Content-TextT': 'application/json' },
        body: JSON.stringify({ domainId: domain.id })
      })
      
      const data = await response.json()
      
      if (data.success && data.verified) {
        toast.success('DNS records verified! Your domain is now active.')
        setDomains(domains.map(d => 
          d.id === domain.id ? { ...d, verified: true } : d
        ))
      } else {
        // Show detailed error message
        const errors: string[] = []
        if (data.instructions) {
          if (data.instructions.txt.status === 'missing') {
            errors.push('TXT record not found or invalid')
          }
          if (data.instructions.cname.status === 'missing') {
            errors.push('CNAME record not found')
          }
        }
        toast.error(
          errors.length > 0 
            ? `Verification failed: ${errors.join(', ')}`
            : 'DNS records not found. Please check your configuration and try again.'
        )
      }
    } catch (error) {
      console.error('Verification error:', error)
      toast.error('Failed to verify domain. Please try again.')
    } finally {
      setVerifyingDomainId(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Domains Table */}
      {domains.length > 0 ? (
        <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[12px]">Domain</TableHead>
                <TableHead className="text-[12px]">Status</TableHead>
                <TableHead className="text-[12px] hidden sm:table-cell">Added</TableHead>
                <TableHead className="text-[12px] w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground/50" />
                      <span className="font-medium text-[13px]">{domain.domain}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {verifyingDomainId === domain.id ? (
                      <Badge className="text-[10px] border-0 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                        <ArrowsClockwise className="h-2.5 w-2.5 mr-1 animate-spin" />
                        Verifying
                      </Badge>
                    ) : domain.verified ? (
                      <Badge className="text-[10px] border-0 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400">
                        <Check className="h-2.5 w-2.5 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="text-[10px] border-0 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
                        <Clock className="h-2.5 w-2.5 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-[12px] text-muted-foreground hidden sm:table-cell">
                    {formatDistanceToNow(new Date(domain.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                        >
                          <DotsThree className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          className="text-[12px]"
                          onClick={() => setViewRecordsDomain(domain)}
                        >
                          <FileText className="h-3.5 w-3.5 mr-2" />
                          View Records
                        </DropdownMenuItem>
                        {!domain.verified && (
                          <DropdownMenuItem
                            className="text-[12px]"
                            onClick={() => handleVerify(domain)}
                            disabled={verifyingDomainId === domain.id}
                          >
                            <ArrowsClockwise className={`h-3.5 w-3.5 mr-2 ${verifyingDomainId === domain.id ? 'animate-spin' : ''}`} />
                            {verifyingDomainId === domain.id ? 'Verifying...' : 'Verify Domain'}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-[12px] text-destructive focus:text-destructive"
                          onClick={() => setDeleteDomain(domain)}
                        >
                          <Trash className="h-3.5 w-3.5 mr-2" />
                          Delete Domain
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border border-dashed border-border/50 rounded-lg p-8 text-center">
          <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center mx-auto mb-3">
            <Globe className="w-5 h-5 text-muted-foreground/40" strokeWidth={1.5} />
          </div>
          <p className="font-medium text-[13px] tracking-tight mb-1">No domains connected</p>
          <p className="text-muted-foreground/70 text-[12px] max-w-sm mx-auto">
            Click &quot;Add Domain&quot; above to connect your first custom domain
          </p>
        </div>
      )}

      {/* View Records Dialog */}
      <Dialog open={!!viewRecordsDomain} onOpenChange={() => setViewRecordsDomain(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[15px]">DNS Configuration</DialogTitle>
            <DialogDescription className="text-[13px]">
              Add these records to your domain&apos;s DNS settings for <span className="font-medium text-foreground">{viewRecordsDomain?.domain}</span>
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
            {viewRecordsDomain && !viewRecordsDomain.verified && (
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
                        {viewRecordsDomain.verification_token}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => copyToClipboard(viewRecordsDomain.verification_token || '', 'txt')}
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
            )}

            {viewRecordsDomain?.verified ? (
              <p className="text-[11px] text-green-600">
                ✓ This domain has been verified and is active.
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground/60">
                DNS changes can take up to 48 hours to propagate.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              size="sm"
              className="h-8 text-[12px]"
              onClick={() => setViewRecordsDomain(null)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteDomain} onOpenChange={() => setDeleteDomain(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[15px]">Delete domain?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              This will remove {deleteDomain?.domain} from your account. Forms will no longer be accessible at this domain.
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
