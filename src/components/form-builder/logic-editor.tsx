'use client'

import { useFormBuilder } from '@/store/form-builder'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash, GitBranch } from '@phosphor-icons/react'
import { nanoid } from 'nanoid'
import { 
  getOperatorsForQuestionType, 
  operatorRequiresValue 
} from '@/lib/logic'
import type { Question, LogicCondition, LogicRule, LogicOperator } from '@/types/database'

interface LogicEditorProps {
  question: Question
  open: boolean
  onClose: () => void
}

export function LogicEditor({ question, open, onClose }: LogicEditorProps) {
  const { form, updateQuestion } = useFormBuilder()
  
  // Get questions that can be used in conditions (questions before this one)
  const questionIndex = form.questions.findIndex(q => q.id === question.id)
  const availableQuestions = form.questions.filter((q, idx) => 
    idx < questionIndex && 
    !['welcome', 'thank_you'].includes(q.type)
  )
  
  // Get questions that can be jumped to (questions after this one)
  const jumpableQuestions = form.questions.filter((q, idx) => 
    idx > questionIndex && q.type !== 'welcome'
  )
  
  const logic = question.logic
  
  const createDefaultRule = (): LogicRule => ({
    id: nanoid(),
    conditions: [],
    conditionLogic: 'and',
    action: 'show',
  })
  
  const handleEnableLogic = () => {
    updateQuestion(question.id, {
      logic: createDefaultRule(),
    })
  }
  
  const handleDisableLogic = () => {
    updateQuestion(question.id, {
      logic: undefined,
    })
  }
  
  const handleAddCondition = () => {
    if (!logic) return
    
    const firstQuestion = availableQuestions[0]
    if (!firstQuestion) return
    
    const newCondition: LogicCondition = {
      id: nanoid(),
      questionId: firstQuestion.id,
      operator: 'equals',
      value: '',
    }
    
    updateQuestion(question.id, {
      logic: {
        ...logic,
        conditions: [...logic.conditions, newCondition],
      },
    })
  }
  
  const handleUpdateCondition = (conditionId: string, updates: Partial<LogicCondition>) => {
    if (!logic) return
    
    updateQuestion(question.id, {
      logic: {
        ...logic,
        conditions: logic.conditions.map(c => 
          c.id === conditionId ? { ...c, ...updates } : c
        ),
      },
    })
  }
  
  const handleDeleteCondition = (conditionId: string) => {
    if (!logic) return
    
    updateQuestion(question.id, {
      logic: {
        ...logic,
        conditions: logic.conditions.filter(c => c.id !== conditionId),
      },
    })
  }
  
  const handleUpdateLogic = (updates: Partial<LogicRule>) => {
    if (!logic) return
    
    updateQuestion(question.id, {
      logic: {
        ...logic,
        ...updates,
      },
    })
  }
  
  const getQuestionOptions = (qId: string) => {
    const q = form.questions.find(q => q.id === qId)
    if (!q) return []
    
    if (q.type === 'yes_no') {
      return [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ]
    }
    
    return q.properties.options || []
  }
  
  const getQuestionType = (qId: string) => {
    const q = form.questions.find(q => q.id === qId)
    return q?.type || 'short_text'
  }
  
  if (availableQuestions.length === 0) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-100 sm:w-135">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Logic & Branching
            </SheetTitle>
            <SheetDescription>
              Add conditional logic to control when this question appears.
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-8 text-center py-8 border border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground">
              Add questions before this one to create logic rules.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Logic can only be based on answers to previous questions.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-100 sm:w-135 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Logic & Branching
          </SheetTitle>
          <SheetDescription>
            Show or skip this question based on previous answers.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {!logic ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <GitBranch className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No logic configured for this question.
              </p>
              <Button onClick={handleEnableLogic}>
                <Plus className="h-4 w-4 mr-2" />
                Add Logic
              </Button>
            </div>
          ) : (
            <>
              {/* Action selector */}
              <div className="space-y-3">
                <Label>Action</Label>
                <Select 
                  value={logic.action} 
                  onValueChange={(value: 'show' | 'skip') => handleUpdateLogic({ action: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="show">Show this question</SelectItem>
                    <SelectItem value="skip">Skip this question</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {logic.action === 'show' 
                    ? 'This question will only appear when conditions are met.'
                    : 'This question will be skipped when conditions are met.'}
                </p>
              </div>
              
              {/* Conditions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Conditions</Label>
                  {logic.conditions.length > 1 && (
                    <Select 
                      value={logic.conditionLogic} 
                      onValueChange={(value: 'and' | 'or') => handleUpdateLogic({ conditionLogic: value })}
                    >
                      <SelectTrigger className="w-24 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="and">AND</SelectItem>
                        <SelectItem value="or">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                {logic.conditions.length === 0 ? (
                  <div className="p-4 border border-dashed rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      No conditions added yet.
                    </p>
                    <Button variant="outline" size="sm" onClick={handleAddCondition}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logic.conditions.map((condition, idx) => {
                      const conditionQuestion = form.questions.find(q => q.id === condition.questionId)
                      const operators = conditionQuestion 
                        ? getOperatorsForQuestionType(conditionQuestion.type)
                        : []
                      const showValueInput = operatorRequiresValue(condition.operator)
                      const hasOptions = ['multiple_choice', 'checkbox', 'dropdown', 'yes_no'].includes(
                        conditionQuestion?.type || ''
                      )
                      
                      return (
                        <div 
                          key={condition.id} 
                          className="p-3 bg-muted/50 rounded-lg space-y-3"
                        >
                          {idx > 0 && (
                            <Badge variant="outline" className="mb-2">
                              {logic.conditionLogic.toUpperCase()}
                            </Badge>
                          )}
                          
                          {/* Question selector */}
                          <div className="space-y-1">
                            <Label className="text-xs">If answer to</Label>
                            <Select 
                              value={condition.questionId}
                              onValueChange={(value) => handleUpdateCondition(condition.id, { 
                                questionId: value,
                                operator: 'equals',
                                value: '',
                              })}
                            >
                              <SelectTrigger className="text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableQuestions.map(q => (
                                  <SelectItem key={q.id} value={q.id} className="text-xs">
                                    {q.title.length > 40 ? q.title.slice(0, 40) + '...' : q.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Operator selector */}
                          <div className="space-y-1">
                            <Label className="text-xs">Condition</Label>
                            <Select 
                              value={condition.operator}
                              onValueChange={(value: LogicOperator) => handleUpdateCondition(condition.id, { 
                                operator: value 
                              })}
                            >
                              <SelectTrigger className="text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {operators.map(op => (
                                  <SelectItem key={op.value} value={op.value} className="text-xs">
                                    {op.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Value input */}
                          {showValueInput && (
                            <div className="space-y-1">
                              <Label className="text-xs">Value</Label>
                              {hasOptions ? (
                                <Select 
                                  value={String(condition.value || '')}
                                  onValueChange={(value) => handleUpdateCondition(condition.id, { value })}
                                >
                                  <SelectTrigger className="text-xs">
                                    <SelectValue placeholder="Select an option" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getQuestionOptions(condition.questionId).map(opt => (
                                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  type={['number', 'rating', 'scale'].includes(getQuestionType(condition.questionId)) ? 'number' : 'text'}
                                  value={String(condition.value || '')}
                                  onChange={(e) => handleUpdateCondition(condition.id, { 
                                    value: e.target.type === 'number' ? Number(e.target.value) : e.target.value 
                                  })}
                                  placeholder="Enter value..."
                                  className="text-xs"
                                />
                              )}
                            </div>
                          )}
                          
                          {/* Delete condition */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive h-7 w-full"
                            onClick={() => handleDeleteCondition(condition.id)}
                          >
                            <Trash className="h-3 w-3 mr-2" />
                            Remove condition
                          </Button>
                        </div>
                      )
                    })}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddCondition}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Jump to question (optional) */}
              {jumpableQuestions.length > 0 && (
                <div className="space-y-3">
                  <Label>Jump to question (optional)</Label>
                  <Select 
                    value={logic.jumpToQuestionId || 'none'}
                    onValueChange={(value) => handleUpdateLogic({ 
                      jumpToQuestionId: value === 'none' ? undefined : value 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Continue normally" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Continue to next question</SelectItem>
                      {jumpableQuestions.map(q => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.type === 'thank_you' ? 'Thank you screen' : (
                            q.title.length > 35 ? q.title.slice(0, 35) + '...' : q.title
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    After this question, skip ahead to a specific question.
                  </p>
                </div>
              )}
              
              {/* Remove logic button */}
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full text-destructive hover:text-destructive"
                  onClick={handleDisableLogic}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Remove All Logic
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
