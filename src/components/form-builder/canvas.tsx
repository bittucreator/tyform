'use client'

import { useFormBuilder } from '@/store/form-builder'
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
} from '@dnd-kit/sortable'
import { SortableQuestion } from './sortable-question'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText } from '@phosphor-icons/react'

export function FormBuilderCanvas() {
  const { form, reorderQuestions, selectQuestion, selectedQuestionId } = useFormBuilder()

  const sensors = useSensors(
    useSensor(PointerSensor),
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

  if (form.questions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" weight="duotone" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Start building your form
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Click on a question type from the sidebar to add it to your form
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-muted/30 p-8">
      <div className="max-w-2xl mx-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={form.questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence>
              {form.questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <SortableQuestion
                    question={question}
                    index={index}
                    isSelected={selectedQuestionId === question.id}
                    onSelect={() => selectQuestion(question.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
