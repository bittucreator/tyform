'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
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
import {
  Check,
  X,
  Clock,
  ArrowClockwise,
  Trash,
  CaretDown,
  CaretUp,
  SpinnerGap,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import type { WebhookLog } from '@/types/database'

interface WebhookLogsDialogProps {
  open: boolean
  onClose: () => void
  formId: string
}

interface WebhookLogsResponse {
  logs: WebhookLog[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  stats: {
    total: number
    success: number
    failed: number
    pending: number
    successRate: number
  }
}

export function WebhookLogsDialog({ open, onClose, formId }: WebhookLogsDialogProps) {
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [stats, setStats] = useState<WebhookLogsResponse['stats'] | null>(null)
  const [pagination, setPagination] = useState<WebhookLogsResponse['pagination'] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchLogs = useCallback(async (offset = 0, status?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '20',
        offset: String(offset),
      })
      if (status && status !== 'all') {
        params.set('status', status)
      }

      const response = await fetch(`/api/forms/${formId}/webhook-logs?${params}`)
      if (!response.ok) throw new Error('Failed to fetch logs')

      const data: WebhookLogsResponse = await response.json()
      
      if (offset === 0) {
        setLogs(data.logs)
      } else {
        setLogs(prev => [...prev, ...data.logs])
      }
      setStats(data.stats)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Failed to load webhook logs')
    } finally {
      setIsLoading(false)
    }
  }, [formId])

  useEffect(() => {
    if (open && formId) {
      fetchLogs(0, statusFilter)
    }
  }, [open, formId, statusFilter, fetchLogs])

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setLogs([])
    fetchLogs(0, value)
  }

  const loadMore = () => {
    if (pagination?.hasMore) {
      fetchLogs(pagination.offset + pagination.limit, statusFilter)
    }
  }

  const clearLogs = async (options?: { olderThanDays?: number; status?: string }) => {
    if (!confirm('Are you sure you want to delete these logs? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const params = new URLSearchParams()
      if (options?.olderThanDays) {
        params.set('olderThanDays', String(options.olderThanDays))
      }
      if (options?.status) {
        params.set('status', options.status)
      }

      const response = await fetch(`/api/forms/${formId}/webhook-logs?${params}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete logs')

      toast.success('Logs deleted successfully')
      fetchLogs(0, statusFilter)
    } catch (error) {
      console.error('Error deleting logs:', error)
      toast.error('Failed to delete logs')
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />
      case 'failed':
        return <X className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Success</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Failed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Webhook Delivery Logs</DialogTitle>
        </DialogHeader>

        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.success}</div>
              <div className="text-xs text-muted-foreground">Success</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
          </div>
        )}

        {/* Filters & Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => fetchLogs(0, statusFilter)} disabled={isLoading}>
              <ArrowClockwise className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearLogs({ olderThanDays: 7 })}
              disabled={isDeleting}
            >
              <Trash className="h-4 w-4 mr-1" />
              Clear 7+ days
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => clearLogs()}
              disabled={isDeleting}
            >
              <Trash className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          </div>
        </div>

        {/* Logs List */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-2">
            {isLoading && logs.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No webhook logs found
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Log Header */}
                  <button
                    className="w-full p-3 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  >
                    {getStatusIcon(log.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm truncate">{log.webhook_url}</span>
                        {log.status_code && (
                          <Badge variant="outline" className="font-mono">
                            {log.status_code}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{log.event_type}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                        {log.duration_ms && (
                          <>
                            <span>•</span>
                            <span>{log.duration_ms}ms</span>
                          </>
                        )}
                      </div>
                    </div>
                    {expandedLog === log.id ? (
                      <CaretUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <CaretDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Expanded Details */}
                  {expandedLog === log.id && (
                    <div className="border-t bg-muted/30 p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Status</div>
                          {getStatusBadge(log.status)}
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Webhook ID</div>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{log.webhook_id}</code>
                        </div>
                      </div>

                      {log.error_message && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Error</div>
                          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2 rounded font-mono">
                            {log.error_message}
                          </div>
                        </div>
                      )}

                      {log.request_body && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Request Payload</div>
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-40">
                            {JSON.stringify(log.request_body, null, 2)}
                          </pre>
                        </div>
                      )}

                      {log.response_body && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Response</div>
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-40">
                            {log.response_body}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Load More */}
          {pagination?.hasMore && (
            <div className="py-4 flex justify-center">
              <Button variant="outline" onClick={loadMore} disabled={isLoading}>
                {isLoading ? (
                  <SpinnerGap className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Load more
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
