'use client'

import { useState } from 'react'
import { Globe, Trash, Check, Clock, Copy, DotsThree, FileText, ArrowsClockwise, Link as LinkIcon } from '@phosphor-icons/react'
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
import { PrettyUrls } from './pretty-urls'
import type { Domain, Form } from '@/types/database'

interface DomainsListProps {
  domains: Domain[]
  userId: string
  forms: Pick<Form, 'id' | 'title'>[]
}

export function DomainsList({ domains: initialDomains, forms }: DomainsListProps) {
  const [domains, setDomains] = useState(initialDomains)
  const [deleteDomain, setDeleteDomain] = useState<Domain | null>(null)
  const [viewRecordsDomain, setViewRecordsDomain] = useState<Domain | null>(null)
  const [manageUrlsDomain, setManageUrlsDomain] = useState<Domain | null>(null)
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
                        {domain.verified && (
                          <DropdownMenuItem
                            className="text-[12px]"
                            onClick={() => setManageUrlsDomain(domain)}
                          >
                            <LinkIcon className="h-3.5 w-3.5 mr-2" />
                            Manage URLs
                          </DropdownMenuItem>
                        )}
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
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[15px]">DNS Configuration</DialogTitle>
            <DialogDescription className="text-[13px]">
              Add these DNS records to your domain provider&apos;s settings for <span className="font-medium text-foreground">{viewRecordsDomain?.domain}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-5">
            {/* Domain Status */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
              <div className={`w-3 h-3 rounded-full ${viewRecordsDomain?.verified ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
              <div>
                <p className="text-[13px] font-medium">
                  {viewRecordsDomain?.verified ? 'Domain Active' : 'Pending Verification'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {viewRecordsDomain?.verified 
                    ? 'Your domain is connected and serving forms' 
                    : 'Add the DNS records below to verify ownership'}
                </p>
              </div>
            </div>

            {/* DNS Records Header */}
            <div className="flex items-center justify-between">
              <h4 className="text-[13px] font-medium">DNS Records</h4>
              <p className="text-[10px] text-muted-foreground">Add these to Cloudflare, Namecheap, GoDaddy, etc.</p>
            </div>

            {/* CNAME Record */}
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <div className="bg-muted/30 px-4 py-2.5 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono">CNAME</Badge>
                  <span className="text-[12px] text-muted-foreground">Point your domain to Tyform</span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1.5">Name / Host</p>
                    <div className="flex items-center gap-2 bg-muted/30 rounded px-3 py-2">
                      <code className="font-mono text-[12px] flex-1">@</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard('@', 'cname-name')}
                      >
                        {copiedField === 'cname-name' ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Use @ or leave blank for root domain</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1.5">Value / Target</p>
                    <div className="flex items-center gap-2 bg-muted/30 rounded px-3 py-2">
                      <code className="font-mono text-[12px] flex-1">cname.tyform.com</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard('cname.tyform.com', 'cname-value')}
                      >
                        {copiedField === 'cname-value' ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TXT Record */}
            {viewRecordsDomain && !viewRecordsDomain.verified && (
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-2.5 border-b border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">TXT</Badge>
                    <span className="text-[12px] text-muted-foreground">Verify domain ownership</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1.5">Name / Host</p>
                      <div className="flex items-center gap-2 bg-muted/30 rounded px-3 py-2">
                        <code className="font-mono text-[12px] flex-1">_tyform</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard('_tyform', 'txt-name')}
                        >
                          {copiedField === 'txt-name' ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1.5">Value</p>
                      <div className="flex items-center gap-2 bg-muted/30 rounded px-3 py-2">
                        <code className="font-mono text-[11px] flex-1 truncate">{viewRecordsDomain.verification_token}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => copyToClipboard(viewRecordsDomain.verification_token || '', 'txt-value')}
                        >
                          {copiedField === 'txt-value' ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Legend */}
            <div className="flex items-center gap-6 pt-2 border-t border-border/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-[10px] text-muted-foreground">Verifying DNS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-[10px] text-muted-foreground">Issuing SSL</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] text-muted-foreground">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[10px] text-muted-foreground">Failed</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              DNS changes can take from a few seconds to 48 hours to propagate. Click Verify to check status.
            </p>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[12px]"
              onClick={() => setViewRecordsDomain(null)}
            >
              Close
            </Button>
            {viewRecordsDomain && !viewRecordsDomain.verified && (
              <Button
                size="sm"
                className="h-8 text-[12px]"
                onClick={() => {
                  handleVerify(viewRecordsDomain)
                  setViewRecordsDomain(null)
                }}
              >
                <ArrowsClockwise className="h-3.5 w-3.5 mr-1.5" />
                Verify
              </Button>
            )}
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

      {/* Manage URLs Dialog */}
      <Dialog open={!!manageUrlsDomain} onOpenChange={() => setManageUrlsDomain(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Manage URLs</DialogTitle>
            <DialogDescription className="text-[13px]">
              Create pretty URLs for your forms on <span className="font-medium text-foreground">{manageUrlsDomain?.domain}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {manageUrlsDomain && (
              <PrettyUrls domain={manageUrlsDomain} forms={forms as Form[]} />
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[12px]"
              onClick={() => setManageUrlsDomain(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
