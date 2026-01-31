'use client'

import { useState } from 'react'
import { useFormBuilder } from '@/store/form-builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Trash, DotsSixVertical, GitBranch } from '@phosphor-icons/react'
import { nanoid } from 'nanoid'
import { LogicEditor } from './logic-editor'

export function QuestionEditor() {
  const { form, selectedQuestionId, selectQuestion, updateQuestion } = useFormBuilder()
  const [showLogicEditor, setShowLogicEditor] = useState(false)
  const question = form.questions.find((q) => q.id === selectedQuestionId)

  if (!question) return null

  const handleAddOption = () => {
    const options = question.properties.options || []
    updateQuestion(question.id, {
      properties: {
        ...question.properties,
        options: [
          ...options,
          { id: nanoid(), label: `Option ${options.length + 1}`, value: `option_${options.length + 1}` },
        ],
      },
    })
  }

  const handleUpdateOption = (optionId: string, label: string) => {
    const options = question.properties.options || []
    updateQuestion(question.id, {
      properties: {
        ...question.properties,
        options: options.map((opt) =>
          opt.id === optionId ? { ...opt, label, value: label.toLowerCase().replace(/\s+/g, '_') } : opt
        ),
      },
    })
  }

  const handleDeleteOption = (optionId: string) => {
    const options = question.properties.options || []
    updateQuestion(question.id, {
      properties: {
        ...question.properties,
        options: options.filter((opt) => opt.id !== optionId),
      },
    })
  }

  const hasOptions = ['multiple_choice', 'checkbox', 'dropdown'].includes(question.type)
  const hasRatingSettings = ['rating', 'scale'].includes(question.type)

  return (
    <aside className="w-80 bg-background border-l border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-sm text-foreground">
          PencilSimple Question
        </h2>
        <Button variant="ghost" size="icon" onClick={() => selectQuestion(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Question Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Question</Label>
            <Textarea
              id="title"
              value={question.title}
              onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
              placeholder="Your question here..."
              rows={2}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={question.description || ''}
              onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
              placeholder="Add a description..."
              rows={2}
            />
          </div>

          <Separator />

          {/* Options for choice questions */}
          {hasOptions && (
            <div className="space-y-3">
              <Label>Options</Label>
              <div className="space-y-2">
                {question.properties.options?.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <DotsSixVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <Input
                      value={option.label}
                      onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteOption(option.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={handleAddOption} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add option
              </Button>

              {question.type === 'checkbox' && (
                <div className="flex items-center justify-between mt-4">
                  <Label htmlFor="allowMultiple">Allow multiple selections</Label>
                  <Switch
                    id="allowMultiple"
                    checked={question.properties.allowMultiple ?? true}
                    onCheckedChange={(checked) =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, allowMultiple: checked },
                      })
                    }
                  />
                </div>
              )}
            </div>
          )}

          {/* Rating settings */}
          {hasRatingSettings && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxRating">
                  {question.type === 'rating' ? 'Stars' : 'Maximum value'}
                </Label>
                <Input
                  id="maxRating"
                  type="number"
                  min={2}
                  max={10}
                  value={question.properties.max || 5}
                  onChange={(e) =>
                    updateQuestion(question.id, {
                      properties: { ...question.properties, max: parseInt(e.target.value) },
                    })
                  }
                />
              </div>
              {question.type === 'scale' && (
                <div className="space-y-2">
                  <Label htmlFor="minValue">Minimum value</Label>
                  <Input
                    id="minValue"
                    type="number"
                    min={0}
                    max={1}
                    value={question.properties.min || 1}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, min: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
              )}
            </div>
          )}

          {/* Placeholder for text inputs */}
          {['short_text', 'long_text', 'email', 'number', 'phone', 'url'].includes(question.type) && (
            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder</Label>
              <Input
                id="placeholder"
                value={question.properties.placeholder || ''}
                onChange={(e) =>
                  updateQuestion(question.id, {
                    properties: { ...question.properties, placeholder: e.target.value },
                  })
                }
                placeholder="TextT your placeholder..."
              />
            </div>
          )}

          {/* Button text for welcome/thank you */}
          {question.type === 'welcome' && (
            <div className="space-y-2">
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                value={question.properties.buttonText || 'Start'}
                onChange={(e) =>
                  updateQuestion(question.id, {
                    properties: { ...question.properties, buttonText: e.target.value },
                  })
                }
              />
            </div>
          )}

          {/* File upload settings */}
          {question.type === 'file_upload' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxFiles">Maximum files</Label>
                <Input
                  id="maxFiles"
                  type="number"
                  min={1}
                  max={20}
                  value={question.properties.maxFiles || 5}
                  onChange={(e) =>
                    updateQuestion(question.id, {
                      properties: { ...question.properties, maxFiles: parseInt(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Max file size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  min={1}
                  max={50}
                  value={question.properties.maxFileSize || 10}
                  onChange={(e) =>
                    updateQuestion(question.id, {
                      properties: { ...question.properties, maxFileSize: parseInt(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Accepted file types</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: '*', label: 'All files' },
                    { value: 'image/*', label: 'Images' },
                    { value: 'application/pdf', label: 'PDF' },
                    { value: '.doc,.docx', label: 'Word' },
                    { value: '.xls,.xlsx', label: 'Excel' },
                  ].map((type) => {
                    const currentTextTs = question.properties.acceptedFileTypes || ['*']
                    const isSelected = currentTextTs.includes(type.value) || 
                      (type.value === '*' && currentTextTs.includes('*'))
                    return (
                      <Button
                        key={type.value}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          let newTextTs: string[]
                          if (type.value === '*') {
                            newTextTs = ['*']
                          } else if (isSelected) {
                            newTextTs = currentTextTs.filter((t) => t !== type.value)
                            if (newTextTs.length === 0) newTextTs = ['*']
                          } else {
                            newTextTs = currentTextTs.filter((t) => t !== '*')
                            newTextTs.push(type.value)
                          }
                          updateQuestion(question.id, {
                            properties: { ...question.properties, acceptedFileTypes: newTextTs },
                          })
                        }}
                      >
                        {type.label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Logic/Branching */}
          {!['welcome', 'thank_you'].includes(question.type) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Logic
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Show/hide based on answers
                  </p>
                </div>
                {question.logic && (
                  <Badge variant="secondary" className="text-xs">
                    {question.logic.conditions.length} condition{question.logic.conditions.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setShowLogicEditor(true)}
              >
                <GitBranch className="h-4 w-4 mr-2" />
                {question.logic ? 'PencilSimple Logic' : 'Add Logic'}
              </Button>
            </div>
          )}

          <Separator />

          {/* Required toggle */}
          {!['welcome', 'thank_you'].includes(question.type) && (
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="required">Required</Label>
                <p className="text-xs text-muted-foreground">
                  Respondents must answer this question
                </p>
              </div>
              <Switch
                id="required"
                checked={question.required}
                onCheckedChange={(checked) =>
                  updateQuestion(question.id, { required: checked })
                }
              />
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Logic Editor Sheet */}
      <LogicEditor 
        question={question}
        open={showLogicEditor}
        onClose={() => setShowLogicEditor(false)}
      />
    </aside>
  )
}
