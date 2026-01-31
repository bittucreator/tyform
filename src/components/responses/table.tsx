'use client'

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
import type { Form, Response } from '@/types/database'

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

  const questions = form.questions.filter(
    (q) => q.type !== 'welcome' && q.type !== 'thank_you'
  )

  const formatAnswer = (answer: unknown): string => {
    if (answer === undefined || answer === null) return '-'
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
              {questions.map((question) => (
                <TableHead key={question.id} className="min-w-48">
                  {question.title}
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
                {questions.map((question) => (
                  <TableCell key={question.id}>
                    {formatAnswer(response.answers[question.id])}
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
