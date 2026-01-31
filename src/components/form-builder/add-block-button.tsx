'use client'

import { useState } from 'react'
import { useFormBuilder } from '@/store/form-builder'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
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
  Pen,
  GridNine,
  ArrowsDownUp,
  CreditCard,
  MapPin,
  Gauge,
  Calculator,
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
  { type: 'address', label: 'Address', icon: <MapPin className="h-4 w-4" />, category: 'Text' },
  // Choice
  { type: 'multiple_choice', label: 'Multiple Choice', icon: <List className="h-4 w-4" />, category: 'Choice' },
  { type: 'checkbox', label: 'Checkboxes', icon: <CheckSquare className="h-4 w-4" />, category: 'Choice' },
  { type: 'dropdown', label: 'Dropdown', icon: <CaretDown className="h-4 w-4" />, category: 'Choice' },
  { type: 'yes_no', label: 'Yes / No', icon: <ThumbsUp className="h-4 w-4" />, category: 'Choice' },
  { type: 'ranking', label: 'Ranking', icon: <ArrowsDownUp className="h-4 w-4" />, category: 'Choice' },
  { type: 'matrix', label: 'Matrix / Grid', icon: <GridNine className="h-4 w-4" />, category: 'Choice' },
  // Rating
  { type: 'rating', label: 'Rating', icon: <Star className="h-4 w-4" />, category: 'Rating' },
  { type: 'scale', label: 'Scale', icon: <Sliders className="h-4 w-4" />, category: 'Rating' },
  { type: 'slider', label: 'Slider', icon: <Gauge className="h-4 w-4" />, category: 'Rating' },
  { type: 'nps', label: 'NPS Score', icon: <Gauge className="h-4 w-4" />, category: 'Rating' },
  // Other
  { type: 'date', label: 'Date', icon: <Calendar className="h-4 w-4" />, category: 'Other' },
  { type: 'file_upload', label: 'File Upload', icon: <Upload className="h-4 w-4" />, category: 'Other' },
  { type: 'signature', label: 'Signature', icon: <Pen className="h-4 w-4" />, category: 'Other' },
  { type: 'payment', label: 'Payment', icon: <CreditCard className="h-4 w-4" />, category: 'Other' },
  { type: 'calculator', label: 'Calculator', icon: <Calculator className="h-4 w-4" />, category: 'Other' },
  // Screens
  { type: 'welcome', label: 'Welcome Screen', icon: <Smiley className="h-4 w-4" />, category: 'Screens' },
  { type: 'thank_you', label: 'Thank You', icon: <ChatCircle className="h-4 w-4" />, category: 'Screens' },
]

const categories = ['Text', 'Choice', 'Rating', 'Other', 'Screens']

interface AddBlockButtonProps {
  variant?: 'full' | 'icon'
}

export function AddBlockButton({ variant = 'full' }: AddBlockButtonProps) {
  const { addQuestion } = useFormBuilder()
  const [open, setOpen] = useState(false)

  const handleAddQuestion = (type: QuestionType) => {
    addQuestion(type)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === 'icon' ? (
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Block
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="max-h-100 overflow-y-auto">
          {categories.map((category, categoryIndex) => (
            <div key={category}>
              <div className="px-3 py-2 sticky top-0 bg-popover">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {category}
                </span>
              </div>
              <div className="px-1 pb-1">
                {questionTextTs
                  .filter((q) => q.category === category)
                  .map((questionTextT) => (
                    <button
                      key={questionTextT.type}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors text-left"
                      onClick={() => handleAddQuestion(questionTextT.type)}
                    >
                      <span className="text-muted-foreground">{questionTextT.icon}</span>
                      <span>{questionTextT.label}</span>
                    </button>
                  ))}
              </div>
              {categoryIndex !== categories.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
