'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Plus, 
  TextT, 
  EnvelopeSimple, 
  Phone, 
  Link as LinkIcon,
  ListBullets,
  CheckSquare,
  CaretDown,
  Star,
  Sliders,
  Calendar,
  ThumbsUp,
  Upload,
  Signature,
  GridFour,
  SortAscending,
  Gauge,
  CreditCard,
  MapPin,
  Calculator,
  Hand,
  CheckCircle,
  ChatCircle,
  ChartBar,
  Envelope,
  Ticket,
  ShoppingCart,
  Brain,
  Briefcase,
  UserCircle,
} from '@phosphor-icons/react'
import type { FormTemplate } from '@/lib/templates'
import type { QuestionType } from '@/types/database'

interface TemplatePreviewModalProps {
  template: FormTemplate | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUseTemplate: (template: FormTemplate) => void
  isCreating?: boolean
}

const templateIconMap: Record<FormTemplate['icon'], React.ComponentType<{ className?: string; weight?: 'regular' | 'bold' | 'light' | 'thin' | 'fill' | 'duotone' }>> = {
  ChatCircle,
  ChartBar,
  Envelope,
  Ticket,
  ShoppingCart,
  Brain,
  Briefcase,
  UserCircle,
}

const questionTypeIcons: Record<QuestionType, React.ComponentType<{ className?: string; weight?: 'regular' | 'bold' | 'light' | 'thin' | 'fill' | 'duotone' }>> = {
  short_text: TextT,
  long_text: TextT,
  email: EnvelopeSimple,
  number: Calculator,
  phone: Phone,
  url: LinkIcon,
  multiple_choice: ListBullets,
  checkbox: CheckSquare,
  dropdown: CaretDown,
  rating: Star,
  scale: Sliders,
  date: Calendar,
  yes_no: ThumbsUp,
  file_upload: Upload,
  signature: Signature,
  matrix: GridFour,
  ranking: SortAscending,
  slider: Gauge,
  nps: ChartBar,
  payment: CreditCard,
  address: MapPin,
  calculator: Calculator,
  welcome: Hand,
  thank_you: CheckCircle,
}

const questionTypeLabels: Record<QuestionType, string> = {
  short_text: 'Short Text',
  long_text: 'Long Text',
  email: 'Email',
  number: 'Number',
  phone: 'Phone',
  url: 'URL',
  multiple_choice: 'Multiple Choice',
  checkbox: 'Checkboxes',
  dropdown: 'Dropdown',
  rating: 'Rating',
  scale: 'Scale',
  date: 'Date',
  yes_no: 'Yes/No',
  file_upload: 'File Upload',
  signature: 'Signature',
  matrix: 'Matrix',
  ranking: 'Ranking',
  slider: 'Slider',
  nps: 'NPS',
  payment: 'Payment',
  address: 'Address',
  calculator: 'Calculator',
  welcome: 'Welcome Screen',
  thank_you: 'Thank You Screen',
}

export function TemplatePreviewModal({ 
  template, 
  open, 
  onOpenChange, 
  onUseTemplate,
  isCreating 
}: TemplatePreviewModalProps) {
  if (!template) return null

  const TemplateIcon = templateIconMap[template.icon]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${template.color} flex items-center justify-center shrink-0`}>
              <TemplateIcon className="w-6 h-6 text-white" weight="duotone" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold">{template.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50">
                  {template.questions.length} questions
                </span>
                <span className="capitalize">{template.category}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Questions Preview
            </h3>
            
            {template.questions.map((question, index) => {
              const QuestionIcon = questionTypeIcons[question.type] || TextT
              const isWelcome = question.type === 'welcome'
              const isThankYou = question.type === 'thank_you'
              
              return (
                <div 
                  key={question.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    isWelcome || isThankYou 
                      ? 'bg-muted/30 border-border/50' 
                      : 'bg-background border-border/30 hover:border-border/50'
                  }`}
                >
                  {/* Question Number / Icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isWelcome 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : isThankYou 
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-muted'
                  }`}>
                    {isWelcome || isThankYou ? (
                      <QuestionIcon className={`w-4 h-4 ${
                        isWelcome 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`} weight="duotone" />
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        {index}
                      </span>
                    )}
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {question.title}
                      </span>
                      {question.required && (
                        <span className="text-destructive text-xs">*</span>
                      )}
                    </div>
                    {question.description && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">
                        {question.description}
                      </p>
                    )}
                  </div>

                  {/* Question Type Badge */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 shrink-0">
                    <QuestionIcon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {questionTypeLabels[question.type]}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 bg-muted/30 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            size="sm" 
            className="gap-1.5"
            onClick={() => onUseTemplate(template)}
            disabled={isCreating}
          >
            {isCreating ? (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Use Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
