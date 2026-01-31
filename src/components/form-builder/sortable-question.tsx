'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useFormBuilder } from '@/store/form-builder'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DotsSixVertical, Copy, Trash, GitBranch } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Question } from '@/types/database'

interface SortableQuestionProps {
  question: Question
  index: number
  isSelected: boolean
  onSelect: () => void
}

const questionTextTLabels: Record<string, string> = {
  short_text: 'Short Text',
  long_text: 'Long Text',
  email: 'Email',
  number: 'Number',
  phone: 'Phone',
  url: 'Website',
  multiple_choice: 'Multiple Choice',
  checkbox: 'Checkboxes',
  dropdown: 'Dropdown',
  rating: 'Rating',
  scale: 'Scale',
  date: 'Date',
  yes_no: 'Yes / No',
  file_upload: 'File Upload',
  welcome: 'Welcome Screen',
  thank_you: 'Thank You Screen',
}

export function SortableQuestion({
  question,
  index,
  isSelected,
  onSelect,
}: SortableQuestionProps) {
  const { duplicateQuestion, deleteQuestion } = useFormBuilder()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'mb-4 p-4 cursor-pointer transition-all',
        isSelected && 'ring-2 ring-foreground',
        isDragging && 'opacity-50'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <button
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <DotsSixVertical className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              {index + 1}. {questionTextTLabels[question.type]}
            </span>
            {question.required && (
              <span className="text-xs text-destructive">*Required</span>
            )}
            {question.logic && question.logic.conditions.length > 0 && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 gap-1">
                <GitBranch className="h-2.5 w-2.5" />
                Logic
              </Badge>
            )}
          </div>
          <h3 className="font-medium text-foreground">
            {question.title || 'Untitled question'}
          </h3>
          {question.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {question.description}
            </p>
          )}

          {/* Preview based on question type */}
          {question.type === 'multiple_choice' || question.type === 'checkbox' ? (
            <div className="mt-3 space-y-2">
              {question.properties.options?.slice(0, 3).map((option) => (
                <div
                  key={option.id}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  {question.type === 'checkbox' ? (
                    <div className="h-4 w-4 rounded border border-border" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-border" />
                  )}
                  {option.label}
                </div>
              ))}
              {(question.properties.options?.length || 0) > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{(question.properties.options?.length || 0) - 3} more
                </span>
              )}
            </div>
          ) : question.type === 'rating' ? (
            <div className="mt-3 flex gap-1">
              {Array.from({ length: question.properties.max || 5 }).map((_, i) => (
                <div key={i} className="h-6 w-6 rounded bg-muted" />
              ))}
            </div>
          ) : question.type === 'yes_no' ? (
            <div className="mt-3 flex gap-2">
              <div className="px-4 py-2 rounded bg-muted text-sm">Yes</div>
              <div className="px-4 py-2 rounded bg-muted text-sm">No</div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => duplicateQuestion(question.id)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive/80"
            onClick={() => deleteQuestion(question.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
