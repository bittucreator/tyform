'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Globe, Plus, Copy, Trash, CheckCircle, XCircle, ArrowsClockwise, Link as LinkIcon, LockSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { PrettyUrls } from '@/components/domains/pretty-urls'
import type { Domain, Form } from '@/types/database'

interface DomainData {
  id: string
  domain: string
  status: 'pending' | 'verified' | 'failed'
  verification_token: string
  sslReady?: boolean
  created_at: string
}

export default function DomainsPage() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [domains, setDomains] = useState<DomainData[]>([])
  const [forms, setForms] = useState<Form[]>([])
  const [loadingDomains, setLoadingDomains] = useState(true)
  const [newDomain, setNewDomain] = useState('')
  const [addingDomain, setAddingDomain] = useState(false)
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null)
  const [deletingDomain, setDeletingDomain] = useState<string | null>(null)
  const [manageUrlsDomain, setManageUrlsDomain] = useState<{ id: string; domain: string } | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const wsRes = await fetch('/api/workspaces')
        if (wsRes.ok) {
          const wsData = await wsRes.json()
          if (wsData.workspaces?.length > 0) {
            const ws = wsData.workspaces[0]
            setWorkspaceId(ws.id)
            
            // Fetch domains
            const domainsRes = await fetch(`/api/workspaces/${ws.id}/domains`)
            if (domainsRes.ok) {
              const domainsData = await domainsRes.json()
              setDomains(domainsData.domains || [])
            }
            
            // Fetch forms for pretty URLs
            const formsRes = await fetch(`/api/forms?workspaceId=${ws.id}`)
            if (formsRes.ok) {
              const formsData = await formsRes.json()
              setForms(formsData.forms || [])
            }
          }
        }
      } catch (error) {
        console.error('Failed to load domains:', error)
      } finally {
        setLoadingDomains(false)
      }
    }
    loadData()
  }, [])

  const handleAddDomain = async () => {
    if (!workspaceId || !newDomain.trim()) return

    setAddingDomain(true)
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setDomains([...domains, data.domain])
        setNewDomain('')
        toast.success('Domain added! Configure DNS to verify.')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to add domain')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setAddingDomain(false)
    }
  }

  const handleVerifyDomain = async (domainId: string) => {
    if (!workspaceId) return

    setVerifyingDomain(domainId)
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/domains/${domainId}/verify`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setDomains(domains.map(d => d.id === domainId ? { ...d, status: data.status } : d))
        toast.success(data.status === 'verified' ? 'Domain verified!' : 'Verification pending')
      } else {
        toast.error('Verification failed')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setVerifyingDomain(null)
    }
  }

  const handleDeleteDomain = async (domainId: string) => {
    if (!workspaceId) return

    setDeletingDomain(domainId)
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/domains/${domainId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDomains(domains.filter(d => d.id !== domainId))
        toast.success('Domain removed')
      } else {
        toast.error('Failed to remove domain')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setDeletingDomain(null)
    }
  }

  if (loadingDomains) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Domains</h1>
        <p className="text-muted-foreground mt-1">
          Add custom domains to serve your forms on branded URLs
        </p>
      </div>

      {/* Add Domain Section */}
      <div className="border rounded-xl p-5 space-y-4">
        <div>
          <h3 className="font-medium text-sm mb-1">Add custom domain</h3>
          <p className="text-xs text-muted-foreground">
            Use your own domain for a professional, branded experience
          </p>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="forms.yourdomain.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="h-9 text-sm flex-1"
          />
          <Button 
            size="sm" 
            className="h-9 text-xs"
            onClick={handleAddDomain}
            disabled={addingDomain || !newDomain.trim()}
          >
            <Plus className="w-4 h-4 mr-1" />
            {addingDomain ? 'Adding...' : 'Add domain'}
          </Button>
        </div>
      </div>

      {/* Domains List */}
      <div className="border rounded-xl p-5">
        <h3 className="font-medium text-sm mb-4">Your domains</h3>
        
        {domains.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No custom domains yet</p>
            <p className="text-xs opacity-70 mt-1">Add a domain to use your own branded URLs</p>
          </div>
        ) : (
          <div className="space-y-3">
            {domains.map((domain) => (
              <div key={domain.id} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{domain.domain}</p>
                    {domain.status === 'verified' ? (
                      <>
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">
                          <CheckCircle className="w-3 h-3" weight="fill" />
                          Verified
                        </span>
                        {domain.sslReady !== false && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded">
                            <LockSimple className="w-3 h-3" weight="fill" />
                            SSL
                          </span>
                        )}
                      </>
                    ) : domain.status === 'failed' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded">
                        <XCircle className="w-3 h-3" weight="fill" />
                        Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded">
                        <ArrowsClockwise className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {domain.status === 'verified' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => setManageUrlsDomain({ id: domain.id, domain: domain.domain })}
                      >
                        <LinkIcon className="w-3.5 h-3.5 mr-1" />
                        URLs
                      </Button>
                    )}
                    {domain.status !== 'verified' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => handleVerifyDomain(domain.id)}
                        disabled={verifyingDomain === domain.id}
                      >
                        <ArrowsClockwise className={`w-3.5 h-3.5 mr-1 ${verifyingDomain === domain.id ? 'animate-spin' : ''}`} />
                        {verifyingDomain === domain.id ? 'Checking...' : 'Verify'}
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          disabled={deletingDomain === domain.id}
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-base">Remove domain?</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm">
                            Forms using this domain will no longer be accessible at {domain.domain}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="h-8 text-xs">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteDomain(domain.id)}
                            className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                {/* DNS Records for pending domains */}
                {domain.status !== 'verified' && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-[10px] text-muted-foreground mb-2">Add these DNS records:</p>
                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex items-center gap-2 font-mono bg-background rounded px-2 py-1.5">
                        <span className="text-muted-foreground w-12">CNAME</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="flex-1">cname.tyform.com</span>
                        <button 
                          onClick={() => { navigator.clipboard.writeText('cname.tyform.com'); toast.success('Copied') }} 
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 font-mono bg-background rounded px-2 py-1.5">
                        <span className="text-muted-foreground w-12">TXT</span>
                        <span className="text-muted-foreground w-16 truncate">_tyform</span>
                        <span className="flex-1 truncate">{domain.verification_token}</span>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(domain.verification_token); toast.success('Copied') }} 
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-[10px] text-muted-foreground mt-2">
                  Added {new Date(domain.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
        
        <p className="text-[10px] text-muted-foreground/70 border-t pt-3 mt-4">
          DNS changes can take up to 48 hours to propagate.
        </p>
      </div>

      {/* Manage URLs Dialog */}
      <Dialog open={!!manageUrlsDomain} onOpenChange={() => setManageUrlsDomain(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base">Manage URLs</DialogTitle>
            <DialogDescription className="text-sm">
              Create pretty URLs for your forms on <span className="font-medium text-foreground">{manageUrlsDomain?.domain}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {manageUrlsDomain && (
              <PrettyUrls 
                domain={{ id: manageUrlsDomain.id, domain: manageUrlsDomain.domain } as Domain} 
                forms={forms} 
              />
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
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
