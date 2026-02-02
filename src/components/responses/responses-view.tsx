'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  TextT, 
  At, 
  CaretLeft, 
  CaretRight,
  DownloadSimple,
  FileText,
  Lock,
  Crown
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Form, Response, Question } from '@/types/database'

interface ResponsesViewProps {
  form: Form
  responses: Response[]
  completedCount: number
  partialCount: number
  isPro?: boolean
}

const ITEMS_PER_PAGE = 20

export function ResponsesView({ form, responses, completedCount, partialCount, isPro = false }: ResponsesViewProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'completed' | 'partial'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // For free users, only show completed responses
  const availableResponses = useMemo(() => {
    if (isPro) return responses
    // Free users only see completed responses
    return responses.filter(r => r.metadata?.isComplete !== false)
  }, [responses, isPro])

  // Filter responses
  const filteredResponses = useMemo(() => {
    if (filter === 'completed') {
      return availableResponses.filter(r => r.metadata?.isComplete !== false)
    }
    if (filter === 'partial') {
      // Only Pro users can view partial (this is gated in UI)
      return availableResponses.filter(r => r.metadata?.isComplete === false)
    }
    return availableResponses
  }, [availableResponses, filter])

  // Pagination
  const totalPages = Math.ceil(filteredResponses.length / ITEMS_PER_PAGE)
  const paginatedResponses = filteredResponses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Get questions that should be shown (exclude welcome/thank_you)
  const displayQuestions = form.questions.filter(
    (q) => q.type !== 'welcome' && q.type !== 'thank_you'
  )

  // Determine columns - always use displayQuestions as the base
  const columns = useMemo(() => {
    return displayQuestions.map(q => ({
      id: q.id,
      title: q.title,
      type: q.type
    }))
  }, [displayQuestions])

  const getColumnIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <At className="h-3.5 w-3.5" />
      case 'date':
        return <Calendar className="h-3.5 w-3.5" />
      default:
        return <TextT className="h-3.5 w-3.5" />
    }
  }

  const formatAnswer = (answer: unknown): string => {
    if (answer === undefined || answer === null) return ''
    if (typeof answer === 'object' && !Array.isArray(answer)) {
      try {
        return JSON.stringify(answer)
      } catch {
        return '[Object]'
      }
    }
    if (Array.isArray(answer)) return answer.join(', ')
    return String(answer)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const handleDownloadCSV = () => {
    const headers = ['Submitted at', ...columns.map(c => c.title)]
    const rows = filteredResponses.map(r => [
      formatDate(r.submitted_at),
      ...columns.map(c => formatAnswer(r.answers?.[c.id]))
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${form.title.replace(/[^a-z0-9]/gi, '_')}_responses.csv`
    link.click()
  }

  if (responses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No responses yet
        </h3>
        <p className="text-muted-foreground text-center max-w-sm">
          Share your form to start collecting responses from your audience.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setFilter('all'); setCurrentPage(1) }}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              filter === 'all' 
                ? "bg-muted text-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            All <span className="ml-1 text-muted-foreground">{availableResponses.length}</span>
          </button>
          <button
            onClick={() => { setFilter('completed'); setCurrentPage(1) }}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              filter === 'completed' 
                ? "bg-muted text-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Completed <span className="ml-1 text-muted-foreground">{completedCount}</span>
          </button>
          {isPro ? (
            <button
              onClick={() => { setFilter('partial'); setCurrentPage(1) }}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                filter === 'partial' 
                  ? "bg-muted text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Partial <span className="ml-1 text-muted-foreground">{partialCount}</span>
            </button>
          ) : partialCount > 0 ? (
            <button
              onClick={() => router.push('/billing')}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center gap-1.5"
            >
              <Lock className="h-3.5 w-3.5" weight="bold" />
              Partial <span className="ml-1 text-muted-foreground">{partialCount}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-100 text-pink-600 font-medium">PRO</span>
            </button>
          ) : null}
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDownloadCSV}
          className="text-muted-foreground hover:text-foreground"
        >
          <DownloadSimple className="h-4 w-4 mr-1.5" />
          Download CSV
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-44 font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Submitted at
                  </div>
                </TableHead>
                {columns.map((col) => (
                  <TableHead key={col.id} className="min-w-48 font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {getColumnIcon(col.type)}
                      {col.title}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResponses.map((response) => (
                <TableRow key={response.id} className="hover:bg-muted/20">
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(response.submitted_at)}
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.id} className="text-sm">
                      {formatAnswer(response.answers?.[col.id]) || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <CaretLeft className="h-4 w-4" />
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </Button>
            )
          })}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <CaretRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
