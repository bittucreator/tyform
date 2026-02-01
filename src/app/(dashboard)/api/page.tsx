'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Code, Plus, Copy, Trash, Eye, EyeSlash } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ApiKey {
  id: string
  name: string
  key: string
  created_at: string
  last_used: string | null
}

export default function ApiPage() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loadingApiKeys, setLoadingApiKeys] = useState(true)
  const [newKeyName, setNewKeyName] = useState('')
  const [creatingApiKey, setCreatingApiKey] = useState(false)
  const [deletingApiKey, setDeletingApiKey] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const wsRes = await fetch('/api/workspaces')
        if (wsRes.ok) {
          const wsData = await wsRes.json()
          if (wsData.workspaces?.length > 0) {
            const ws = wsData.workspaces[0]
            setWorkspaceId(ws.id)
            
            // Fetch API keys
            const keysRes = await fetch(`/api/workspaces/${ws.id}/api-keys`)
            if (keysRes.ok) {
              const keysData = await keysRes.json()
              setApiKeys(keysData.apiKeys || [])
            }
          }
        }
      } catch (error) {
        console.error('Failed to load API keys:', error)
      } finally {
        setLoadingApiKeys(false)
      }
    }
    loadData()
  }, [])

  const handleCreateApiKey = async () => {
    if (!workspaceId || !newKeyName.trim()) return

    setCreatingApiKey(true)
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setApiKeys([...apiKeys, data.apiKey])
        setNewKeyName('')
        setShowApiKey(data.apiKey.id)
        toast.success('API key created! Copy it now, it won\'t be shown again.')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to create API key')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setCreatingApiKey(false)
    }
  }

  const handleDeleteApiKey = async (keyId: string) => {
    if (!workspaceId) return

    setDeletingApiKey(keyId)
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/api-keys/${keyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setApiKeys(apiKeys.filter(k => k.id !== keyId))
        toast.success('API key deleted')
      } else {
        toast.error('Failed to delete API key')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setDeletingApiKey(null)
    }
  }

  if (loadingApiKeys) {
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
        <h1 className="text-2xl font-bold tracking-tight">API</h1>
        <p className="text-muted-foreground mt-1">
          Manage API keys for programmatic access
        </p>
      </div>

      {/* Create Key Section */}
      <div className="border rounded-xl p-5 space-y-4">
        <div>
          <h3 className="font-medium text-sm mb-1">Create API key</h3>
          <p className="text-xs text-muted-foreground">
            Generate keys to access the Tyform API programmatically
          </p>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="API key name (e.g., Production)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="h-9 text-sm flex-1"
          />
          <Button 
            size="sm" 
            className="h-9 text-xs"
            onClick={handleCreateApiKey}
            disabled={creatingApiKey || !newKeyName.trim()}
          >
            <Plus className="w-4 h-4 mr-1" />
            {creatingApiKey ? 'Creating...' : 'Create key'}
          </Button>
        </div>
      </div>

      {/* API Keys List */}
      <div className="border rounded-xl p-5">
        <h3 className="font-medium text-sm mb-4">Your API keys</h3>
        
        {apiKeys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Code className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No API keys yet</p>
            <p className="text-xs opacity-70 mt-1">Create your first API key to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{apiKey.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs font-mono bg-background px-2 py-0.5 rounded border">
                      {showApiKey === apiKey.id ? apiKey.key : `${apiKey.key.slice(0, 12)}${'•'.repeat(20)}`}
                    </code>
                    <button
                      onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey === apiKey.id ? (
                        <EyeSlash className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey.key)
                        toast.success('API key copied')
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Created {new Date(apiKey.created_at).toLocaleDateString()}
                    {apiKey.last_used && ` • Last used ${new Date(apiKey.last_used).toLocaleDateString()}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteApiKey(apiKey.id)}
                  disabled={deletingApiKey === apiKey.id}
                >
                  <Trash className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Documentation */}
      <div className="border rounded-xl p-5">
        <h3 className="font-medium text-sm mb-4">API Documentation</h3>
        <div className="bg-muted/50 rounded-lg p-4 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Base URL</p>
            <code className="text-xs font-mono bg-background px-2 py-1 rounded border block">
              {typeof window !== 'undefined' ? window.location.origin : ''}/api/v1
            </code>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Authentication</p>
            <code className="text-xs font-mono bg-background px-2 py-1 rounded border block">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Available Endpoints</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">GET</span>
                <code className="text-xs font-mono">/forms</code>
                <span className="text-[10px] text-muted-foreground">List all forms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">GET</span>
                <code className="text-xs font-mono">/forms/:id</code>
                <span className="text-[10px] text-muted-foreground">Get form details</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">GET</span>
                <code className="text-xs font-mono">/forms/:id/responses</code>
                <span className="text-[10px] text-muted-foreground">Get form responses</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded">POST</span>
                <code className="text-xs font-mono">/forms</code>
                <span className="text-[10px] text-muted-foreground">Create a form</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded">PATCH</span>
                <code className="text-xs font-mono">/forms/:id</code>
                <span className="text-[10px] text-muted-foreground">Update a form</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded">DELETE</span>
                <code className="text-xs font-mono">/forms/:id</code>
                <span className="text-[10px] text-muted-foreground">Delete a form</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
