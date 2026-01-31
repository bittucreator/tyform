'use client'

import { useFormBuilder } from '@/store/form-builder'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
} from '@phosphor-icons/react'
import type { QuestionType } from '@/types/database'

const questionTextTs: { type: QuestionType; label: string; icon: React.ReactNode; category: string }[] = [
  // Text inputs
  { type: 'short_text', label: 'Short Text', icon: <TextT className="h-4 w-4" />, category: 'Text' },
  { type: 'long_text', label: 'Long Text', icon: <AlignLeft className="h-4 w-4" />, category: 'Text' },
  { type: 'email', label: 'Email', icon: <Envelope className="h-4 w-4" />, category: 'Text' },
  { type: 'number', label: 'Number', icon: <Hash className="h-4 w-4" />, category: 'Text' },
  { type: 'phone', label: 'Phone', icon: <Phone className="h-4 w-4" />, category: 'Text' },
  { type: 'url', label: 'Website', icon: <Link className="h-4 w-4" />, category: 'Text' },
  // Choice
  { type: 'multiple_choice', label: 'Multiple Choice', icon: <List className="h-4 w-4" />, category: 'Choice' },
  { type: 'checkbox', label: 'Checkboxes', icon: <CheckSquare className="h-4 w-4" />, category: 'Choice' },
  { type: 'dropdown', label: 'Dropdown', icon: <CaretDown className="h-4 w-4" />, category: 'Choice' },
  { type: 'yes_no', label: 'Yes / No', icon: <ThumbsUp className="h-4 w-4" />, category: 'Choice' },
  // Rating
  { type: 'rating', label: 'Rating', icon: <Star className="h-4 w-4" />, category: 'Rating' },
  { type: 'scale', label: 'Scale', icon: <Sliders className="h-4 w-4" />, category: 'Rating' },
  // Other
  { type: 'date', label: 'Date', icon: <Calendar className="h-4 w-4" />, category: 'Other' },
  { type: 'file_upload', label: 'File Upload', icon: <Upload className="h-4 w-4" />, category: 'Other' },
  // Screens
  { type: 'welcome', label: 'Welcome Screen', icon: <Smiley className="h-4 w-4" />, category: 'Screens' },
  { type: 'thank_you', label: 'Thank You', icon: <ChatCircle className="h-4 w-4" />, category: 'Screens' },
]

const categories = ['Text', 'Choice', 'Rating', 'Other', 'Screens']

export function FormBuilderSidebar() {
  const { addQuestion } = useFormBuilder()

  return (
    <aside className="w-64 bg-background border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-sm text-foreground">
          Add Question
        </h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {category}
              </h3>
              <div className="space-y-1">
                {questionTextTs
                  .filter((q) => q.category === category)
                  .map((questionTextT) => (
                    <Button
                      key={questionTextT.type}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => addQuestion(questionTextT.type)}
                    >
                      {questionTextT.icon}
                      <span className="ml-2">{questionTextT.label}</span>
                    </Button>
                  ))}
              </div>
              {category !== 'Screens' && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
