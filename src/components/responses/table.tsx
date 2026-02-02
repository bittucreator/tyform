'use client'

import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { FileText } from '@phosphor-icons/react'
import type { Form, Response, Question } from '@/types/database'

interface ResponsesTableProps {
  form: Form
  responses: Response[]
}

export function ResponsesTable({ form, responses }: ResponsesTableProps) {
  if (responses.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No responses yet
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Share your form to start collecting responses from your audience.
          </p>
        </div>
      </Card>
    )
  }

  // Get questions that should be shown (exclude welcome/thank_you)
  const displayQuestions = form.questions.filter(
    (q) => q.type !== 'welcome' && q.type !== 'thank_you'
  )

  // Build a map of question ID to question for quick lookup
  const questionMap = useMemo(() => {
    const map = new Map<string, Question>()
    form.questions.forEach(q => map.set(q.id, q))
    return map
  }, [form.questions])

  // Get all unique answer keys from all responses
  const allAnswerKeys = useMemo(() => {
    const keys = new Set<string>()
    responses.forEach(r => {
      Object.keys(r.answers || {}).forEach(k => keys.add(k))
    })
    return Array.from(keys)
  }, [responses])

  // Determine which columns to show:
  // - If current question IDs match answer keys, use current questions
  // - Otherwise, show columns for all answer keys we have
  const hasMatchingIds = displayQuestions.some(q => allAnswerKeys.includes(q.id))

  // Build column definitions
  const columns = useMemo(() => {
    if (hasMatchingIds) {
      // Normal case: current questions match answers
      return displayQuestions.map(q => ({
        id: q.id,
        title: q.title,
        type: q.type
      }))
    } else {
      // Fallback: show answer keys as columns (possibly from old form version)
      // Try to find matching questions by title or just show the key
      return allAnswerKeys.map(key => {
        const question = questionMap.get(key)
        return {
          id: key,
          title: question?.title || `Question ${key.slice(0, 8)}...`,
          type: question?.type || 'unknown'
        }
      })
    }
  }, [hasMatchingIds, displayQuestions, allAnswerKeys, questionMap])

  const formatAnswer = (answer: unknown): string => {
    if (answer === undefined || answer === null) return '-'
    if (typeof answer === 'object' && !Array.isArray(answer)) {
      // Handle object answers (like address, file upload, etc.)
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
    })
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Submitted</TableHead>
              {columns.map((col) => (
                <TableHead key={col.id} className="min-w-48">
                  {col.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((response) => (
              <TableRow key={response.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(response.submitted_at)}
                </TableCell>
                {columns.map((col) => (
                  <TableCell key={col.id}>
                    {formatAnswer(response.answers?.[col.id])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
