'use client'

import { useFormBuilder } from '@/store/form-builder'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  TextT,
  AlignLeft,
  Envelope,
  Hash,
  Phone,
  Link,
  List,
  CheckSquare,
  CaretDown,
  Star,
  Sliders,
  Calendar,
  ThumbsUp,
  Smiley,
  ChatCircle,
  Upload,
  Plus,
  Pen,
  GridNine,
  ArrowsDownUp,
  Gauge,
  CreditCard,
  MapPin,
  Calculator,
  Trash,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Question, QuestionType } from '@/types/database'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { AddBlockButton } from './add-block-button'
import { CSS } from '@dnd-kit/utilities'

const questionIcons: Record<QuestionType, React.ReactNode> = {
  short_text: <TextT className="h-4 w-4" />,
  long_text: <AlignLeft className="h-4 w-4" />,
  email: <Envelope className="h-4 w-4" />,
  number: <Hash className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
  url: <Link className="h-4 w-4" />,
  multiple_choice: <List className="h-4 w-4" />,
  checkbox: <CheckSquare className="h-4 w-4" />,
  dropdown: <CaretDown className="h-4 w-4" />,
  rating: <Star className="h-4 w-4" />,
  scale: <Sliders className="h-4 w-4" />,
  date: <Calendar className="h-4 w-4" />,
  yes_no: <ThumbsUp className="h-4 w-4" />,
  file_upload: <Upload className="h-4 w-4" />,
  signature: <Pen className="h-4 w-4" />,
  matrix: <GridNine className="h-4 w-4" />,
  ranking: <ArrowsDownUp className="h-4 w-4" />,
  slider: <Gauge className="h-4 w-4" />,
  nps: <Gauge className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
  address: <MapPin className="h-4 w-4" />,
  calculator: <Calculator className="h-4 w-4" />,
  welcome: <Smiley className="h-4 w-4" />,
  thank_you: <ChatCircle className="h-4 w-4" />,
}

interface SortableBlockProps {
  question: Question
  index: number
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

function SortableBlock({ question, index, isSelected, onSelect, onDelete }: SortableBlockProps) {
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

  const displayTitle = question.title || 'Untitled'
  const truncatedTitle = displayTitle.length > 24 ? displayTitle.slice(0, 24) + '...' : displayTitle

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-all group',
        isSelected
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted',
        isDragging && 'opacity-50'
      )}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <span className={cn(
        'shrink-0',
        isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
      )}>
        {questionIcons[question.type]}
      </span>
      <span className="text-sm truncate flex-1 min-w-0">
        {index + 1}. {truncatedTitle}
      </span>
      {question.required && (
        <span className={cn(
          'text-xs',
          isSelected ? 'text-primary-foreground/70' : 'text-destructive'
        )}>*</span>
      )}
      <button
        className={cn(
          'shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10',
          isSelected && 'opacity-100',
          isSelected ? 'text-primary-foreground/70 hover:text-primary-foreground' : 'text-muted-foreground hover:text-destructive'
        )}
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        <Trash className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function BlockList() {
  const { form, reorderQuestions, selectQuestion, selectedQuestionId, deleteQuestion } = useFormBuilder()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderQuestions(active.id as string, over.id as string)
    }
  }

  // Separate questions into regular blocks and thank you pages
  const regularBlocks = form.questions.filter(q => q.type !== 'thank_you')
  const thankYouBlocks = form.questions.filter(q => q.type === 'thank_you')

  return (
    <aside className="w-70 min-w-70 bg-background border-r border-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border shrink-0 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Blocks</span>
        <AddBlockButton variant="icon" />
      </div>

      {/* Block List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={regularBlocks.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              {regularBlocks.map((question, index) => (
                <SortableBlock
                  key={question.id}
                  question={question}
                  index={index}
                  isSelected={selectedQuestionId === question.id}
                  onSelect={() => selectQuestion(question.id)}
                  onDelete={() => deleteQuestion(question.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {regularBlocks.length === 0 && (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-muted-foreground">
                No blocks yet
              </p>
            </div>
          )}
          
          {/* Add Block Button */}
          <div className="pt-2">
            <AddBlockButton />
          </div>
        </div>
      </ScrollArea>

      {/* Thank You Page Section */}
      <div className="border-t border-border shrink-0">
        <div className="p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Thank you page</span>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="px-2 pb-2 space-y-1">
          {thankYouBlocks.map((question) => (
            <div
              key={question.id}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all group',
                selectedQuestionId === question.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
              onClick={() => selectQuestion(question.id)}
            >
              <ChatCircle className={cn(
                'h-4 w-4 shrink-0',
                selectedQuestionId === question.id 
                  ? 'text-primary-foreground' 
                  : 'text-muted-foreground'
              )} />
              <span className="text-sm truncate flex-1">
                {question.title || 'Thank you!'}
              </span>
              <button
                className={cn(
                  'shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10',
                  selectedQuestionId === question.id && 'opacity-100',
                  selectedQuestionId === question.id 
                    ? 'text-primary-foreground/70 hover:text-primary-foreground' 
                    : 'text-muted-foreground hover:text-destructive'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  deleteQuestion(question.id)
                }}
              >
                <Trash className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {thankYouBlocks.length === 0 && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-muted text-muted-foreground"
              onClick={() => {
                // This will be handled by add block
              }}
            >
              <ChatCircle className="h-4 w-4" />
              <span className="text-sm">Add thank you page</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
