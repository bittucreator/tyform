'use client'

import { useState } from 'react'
import { DotsSixVertical } from '@phosphor-icons/react'
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { FormTheme } from '@/lib/themes'

interface Option {
  id: string
  label: string
  value: string
}

interface RankingInputProps {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  theme: FormTheme
}

interface SortableItemProps {
  id: string
  label: string
  index: number
  theme: FormTheme
}

function SortableItem({ id, label, index, theme }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 rounded-lg border-2 bg-background cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <span 
        className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium"
        style={{ 
          backgroundColor: `${theme.primaryColor}20`,
          color: theme.primaryColor,
        }}
      >
        {index + 1}
      </span>
      <span className="flex-1" style={{ color: theme.textColor }}>{label}</span>
      <DotsSixVertical className="h-5 w-5" style={{ color: theme.textColor, opacity: 0.4 }} />
    </div>
  )
}

export function RankingInput({ options, value, onChange, theme }: RankingInputProps) {
  // Initialize with value from parent or option values
  const initialItems = value && value.length > 0 ? value : options.map(opt => opt.value)
  const [items, setItems] = useState<string[]>(initialItems)

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
      const oldIndex = items.indexOf(active.id as string)
      const newIndex = items.indexOf(over.id as string)
      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)
      onChange(newItems)
    }
  }

  const getLabel = (itemValue: string) => {
    const option = options.find(opt => opt.value === itemValue)
    return option?.label || itemValue
  }

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
            <SortableItem
              key={item}
              id={item}
              label={getLabel(item)}
              index={index}
              theme={theme}
            />
          ))}
        </SortableContext>
      </DndContext>
      <p className="text-xs text-center" style={{ color: theme.textColor, opacity: 0.5 }}>
        Drag items to reorder
      </p>
    </div>
  )
}
