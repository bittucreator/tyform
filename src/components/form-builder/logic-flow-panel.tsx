'use client'

import { useState, useRef } from 'react'
import { useFormBuilder } from '@/store/form-builder'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowCounterClockwise,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsOut,
  Plus,
  GitBranch,
  X,
  HandWaving,
  TextT,
  TextAlignLeft,
  Envelope,
  Hash,
  Phone,
  Link,
  ListBullets,
  CheckSquare,
  CaretDown,
  Star,
  ChartBar,
  Calendar,
  CheckCircle,
  Upload,
  Confetti,
  Question as QuestionIcon,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Question, LogicRule, LogicCondition, LogicOperator } from '@/types/database'
import { nanoid } from 'nanoid'

interface LogicFlowPanelProps {
  open: boolean
  onClose: () => void
}

type NavigationMode = 'mouse' | 'trackpad'

interface LogicRuleUI {
  id: string
  conditions: LogicCondition[]
  conditionLogic: 'and' | 'or'
  action: 'goto'
  targetQuestionId: string
}

// Colors for different question types
const getNodeColor = (type: string): string => {
  const colors: Record<string, string> = {
    welcome: 'bg-blue-100 border-blue-300 text-blue-800',
    short_text: 'bg-blue-100 border-blue-300 text-blue-800',
    long_text: 'bg-blue-100 border-blue-300 text-blue-800',
    email: 'bg-blue-100 border-blue-300 text-blue-800',
    number: 'bg-blue-100 border-blue-300 text-blue-800',
    phone: 'bg-blue-100 border-blue-300 text-blue-800',
    url: 'bg-blue-100 border-blue-300 text-blue-800',
    multiple_choice: 'bg-green-100 border-green-300 text-green-800',
    checkbox: 'bg-green-100 border-green-300 text-green-800',
    dropdown: 'bg-green-100 border-green-300 text-green-800',
    rating: 'bg-purple-100 border-purple-300 text-purple-800',
    scale: 'bg-purple-100 border-purple-300 text-purple-800',
    date: 'bg-pink-100 border-pink-300 text-pink-800',
    yes_no: 'bg-amber-100 border-amber-300 text-amber-800',
    file_upload: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    thank_you: 'bg-red-100 border-red-300 text-red-800',
  }
  return colors[type] || 'bg-gray-100 border-gray-300 text-gray-800'
}

const getQuestionIcon = (type: string): React.ReactNode => {
  const iconClass = "h-4 w-4"
  const icons: Record<string, React.ReactNode> = {
    welcome: <HandWaving className={iconClass} weight="duotone" />,
    short_text: <TextT className={iconClass} weight="duotone" />,
    long_text: <TextAlignLeft className={iconClass} weight="duotone" />,
    email: <Envelope className={iconClass} weight="duotone" />,
    number: <Hash className={iconClass} weight="duotone" />,
    phone: <Phone className={iconClass} weight="duotone" />,
    url: <Link className={iconClass} weight="duotone" />,
    multiple_choice: <ListBullets className={iconClass} weight="duotone" />,
    checkbox: <CheckSquare className={iconClass} weight="duotone" />,
    dropdown: <CaretDown className={iconClass} weight="duotone" />,
    rating: <Star className={iconClass} weight="duotone" />,
    scale: <ChartBar className={iconClass} weight="duotone" />,
    date: <Calendar className={iconClass} weight="duotone" />,
    yes_no: <CheckCircle className={iconClass} weight="duotone" />,
    file_upload: <Upload className={iconClass} weight="duotone" />,
    thank_you: <Confetti className={iconClass} weight="duotone" />,
  }
  return icons[type] || <QuestionIcon className={iconClass} weight="duotone" />
}

export function LogicFlowPanel({ open, onClose }: LogicFlowPanelProps) {
  const { form, updateQuestion } = useFormBuilder()
  const [navMode, setNavMode] = useState<NavigationMode>('mouse')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showLogicDialog, setShowLogicDialog] = useState(false)
  const [logicRules, setLogicRules] = useState<LogicRuleUI[]>([])
  const [defaultTarget, setDefaultTarget] = useState<string>('next')
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const questions = form.questions.filter(q => q.type !== 'welcome' || true) // Include all

  const handleMagnifyingGlassPlus = () => setZoom(z => Math.min(z + 0.2, 2))
  const handleMagnifyingGlassMinus = () => setZoom(z => Math.max(z - 0.2, 0.4))
  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }
  const handleFitToScreen = () => {
    setZoom(0.8)
    setPan({ x: 50, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (navMode === 'mouse') {
      isDragging.current = true
      lastPos.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current && navMode === 'mouse') {
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      setPan(p => ({ x: p.x + dx, y: p.y + dy }))
      lastPos.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (navMode === 'trackpad') {
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoom(z => Math.min(Math.max(z + delta, 0.4), 2))
      } else {
        // Pan
        setPan(p => ({
          x: p.x - e.deltaX,
          y: p.y - e.deltaY,
        }))
      }
    }
  }

  const handleNodeClick = (question: Question) => {
    setSelectedQuestion(question)
    
    // Parse existing logic from question
    if (question.logic) {
      const rule = question.logic
      setLogicRules([{
        id: rule.id,
        conditions: rule.conditions,
        conditionLogic: rule.conditionLogic,
        action: 'goto',
        targetQuestionId: rule.jumpToQuestionId || 'next',
      }])
      setDefaultTarget(rule.jumpToQuestionId || 'next')
    } else {
      setLogicRules([])
      setDefaultTarget('next')
    }
    
    setShowLogicDialog(true)
  }

  const handleAddLogic = () => {
    const newRule: LogicRuleUI = {
      id: nanoid(),
      conditions: [{
        id: nanoid(),
        questionId: selectedQuestion?.id || '',
        operator: 'equals',
        value: '',
      }],
      conditionLogic: 'and',
      action: 'goto',
      targetQuestionId: 'next',
    }
    setLogicRules([...logicRules, newRule])
  }

  const handleAddCondition = (ruleId: string) => {
    setLogicRules(rules => rules.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          conditions: [...rule.conditions, {
            id: nanoid(),
            questionId: selectedQuestion?.id || '',
            operator: 'equals' as LogicOperator,
            value: '',
          }],
        }
      }
      return rule
    }))
  }

  const handleRemoveRule = (ruleId: string) => {
    setLogicRules(rules => rules.filter(r => r.id !== ruleId))
  }

  const handleUpdateCondition = (
    ruleId: string,
    conditionId: string,
    field: keyof LogicCondition,
    value: string
  ) => {
    setLogicRules(rules => rules.map(rule => {
      if (rule.id === ruleId) {
        return {
          ...rule,
          conditions: rule.conditions.map(cond => {
            if (cond.id === conditionId) {
              return { ...cond, [field]: value }
            }
            return cond
          }),
        }
      }
      return rule
    }))
  }

  const handleUpdateRuleTarget = (ruleId: string, targetId: string) => {
    setLogicRules(rules => rules.map(rule => {
      if (rule.id === ruleId) {
        return { ...rule, targetQuestionId: targetId }
      }
      return rule
    }))
  }

  const handleSaveLogic = () => {
    if (!selectedQuestion) return

    // Convert UI rules to database format
    const logic: LogicRule | undefined = logicRules.length > 0 ? {
      id: logicRules[0].id,
      conditions: logicRules[0].conditions,
      conditionLogic: logicRules[0].conditionLogic,
      action: 'skip',
      jumpToQuestionId: logicRules[0].targetQuestionId === 'next' ? undefined : logicRules[0].targetQuestionId,
    } : undefined

    updateQuestion(selectedQuestion.id, {
      ...selectedQuestion,
      logic,
    })

    setShowLogicDialog(false)
    setSelectedQuestion(null)
    toast.success('Logic saved')
  }

  const getQuestionIndex = (questionId: string): number => {
    return questions.findIndex(q => q.id === questionId) + 1
  }

  const getShortLabel = (question: Question, index: number): string => {
    return `${index + 1}.`
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="w-full sm:max-w-full p-0" side="bottom" style={{ height: '100vh' }} showCloseButton={false}>
          {/* Header */}
          <div className="h-14 border-b flex items-center justify-between px-4 bg-background">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
              <span className="font-medium">Logic Flow</span>
            </div>

            <div className="flex items-center gap-4">
              <Tabs value={navMode} onValueChange={(v) => setNavMode(v as NavigationMode)}>
                <TabsList className="h-8">
                  <TabsTrigger value="mouse" className="text-xs px-3 h-6">Mouse</TabsTrigger>
                  <TabsTrigger value="trackpad" className="text-xs px-3 h-6">Trackpad</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleReset}>
                  <ArrowCounterClockwise className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleMagnifyingGlassPlus}>
                  <MagnifyingGlassPlus className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleMagnifyingGlassMinus}>
                  <MagnifyingGlassMinus className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleFitToScreen}>
                  <ArrowsOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div
            ref={containerRef}
            className="flex-1 overflow-hidden bg-muted/30 cursor-grab active:cursor-grabbing"
            style={{ height: 'calc(100vh - 56px - 48px)' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <div
              className="w-full h-full flex items-center"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.1s ease-out',
              }}
            >
              {/* Flow Diagram */}
              <div className="flex items-center gap-2 px-8 py-4 min-w-max">
                {questions.map((question, index) => (
                  <div key={question.id} className="flex items-center">
                    {/* Node */}
                    <button
                      onClick={() => handleNodeClick(question)}
                      className={cn(
                        'px-4 py-2 rounded-lg border-2 transition-all hover:scale-105 hover:shadow-md min-w-30 max-w-50',
                        getNodeColor(question.type),
                        selectedQuestion?.id === question.id && 'ring-2 ring-primary ring-offset-2'
                      )}
                    >
                      <span className="text-sm font-medium truncate flex items-center gap-1.5">
                        <span className="shrink-0">{getQuestionIcon(question.type)}</span>
                        <span className="truncate">
                          {question.title 
                            ? `${index + 1}. ${question.title.substring(0, 18)}${question.title.length > 18 ? '...' : ''}`
                            : getShortLabel(question, index)
                          }
                        </span>
                      </span>
                    </button>

                    {/* Arrow */}
                    {index < questions.length - 1 && (
                      <div className="flex items-center mx-1">
                        <div className="w-8 h-0.5 bg-amber-400" />
                        <div className="w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-l-8 border-l-amber-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="h-12 border-t px-4 flex items-center bg-background">
            <p className="text-sm text-muted-foreground">
              This diagram shows the flow of your form based on the logic conditions. Click on a node to edit the logic.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logic Editor Dialog */}
      <Dialog open={showLogicDialog} onOpenChange={setShowLogicDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Add Logic for
              {selectedQuestion && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  {getQuestionIcon(selectedQuestion.type)} {selectedQuestion.title || selectedQuestion.type}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {/* Conditional Logic Rules */}
            {logicRules.map((rule) => (
              <div key={rule.id} className="space-y-4 p-4 bg-muted/30 rounded-lg relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => handleRemoveRule(rule.id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Conditions */}
                {rule.conditions.map((condition) => (
                  <div key={condition.id} className="flex items-center gap-2 flex-wrap">
                    <Select
                      value="if"
                      onValueChange={() => {}}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue placeholder="If" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="if">If</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={condition.questionId || ''}
                      onValueChange={(v) => handleUpdateCondition(rule.id, condition.id, 'questionId', v)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="-- Please select --" />
                      </SelectTrigger>
                      <SelectContent>
                        {questions.filter(q => q.type !== 'welcome' && q.type !== 'thank_you').map((q, i) => (
                          <SelectItem key={q.id} value={q.id}>
                            {i + 1}. {q.title || q.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={condition.operator}
                      onValueChange={(v) => handleUpdateCondition(rule.id, condition.id, 'operator', v)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">equals</SelectItem>
                        <SelectItem value="not_equals">not equals</SelectItem>
                        <SelectItem value="contains">contains</SelectItem>
                        <SelectItem value="not_contains">not contains</SelectItem>
                        <SelectItem value="greater_than">greater than</SelectItem>
                        <SelectItem value="less_than">less than</SelectItem>
                        <SelectItem value="is_empty">is empty</SelectItem>
                        <SelectItem value="is_not_empty">is not empty</SelectItem>
                      </SelectContent>
                    </Select>

                    {condition.operator !== 'is_empty' && condition.operator !== 'is_not_empty' && (
                      <input
                        type="text"
                        placeholder="Value"
                        value={String(condition.value || '')}
                        onChange={(e) => handleUpdateCondition(rule.id, condition.id, 'value', e.target.value)}
                        className="flex h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm"
                      />
                    )}
                  </div>
                ))}

                <button
                  onClick={() => handleAddCondition(rule.id)}
                  className="text-sm text-primary hover:underline"
                >
                  + Add condition
                </button>

                {/* Then action */}
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-sm font-medium">Then</p>
                  <div className="flex items-center gap-2">
                    <Select value="goto">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="goto">Go to</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={rule.targetQuestionId}
                      onValueChange={(v) => handleUpdateRuleTarget(rule.id, v)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="-- Please select --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="next">the next block</SelectItem>
                        <SelectItem value="end">End form</SelectItem>
                        {questions.map((q, i) => (
                          <SelectItem key={q.id} value={q.id}>
                            {i + 1}. {q.title || q.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Logic Button */}
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={handleAddLogic}>
                <Plus className="h-4 w-4 mr-1" />
                Add Logic
              </Button>
            </div>

            {/* Default / Fallback */}
            <div className="p-4 bg-muted/30 rounded-lg space-y-3">
              <p className="text-sm">
                {logicRules.length > 0 ? 'In all other cases go to' : (
                  <>
                    From{' '}
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      {selectedQuestion && getQuestionIcon(selectedQuestion.type)} {selectedQuestion?.title || selectedQuestion?.type}
                    </Badge>
                    {' '}always go to
                  </>
                )}
              </p>
              <Select value={defaultTarget} onValueChange={setDefaultTarget}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next">the next block</SelectItem>
                  <SelectItem value="end">End form</SelectItem>
                  {questions
                    .filter(q => q.id !== selectedQuestion?.id)
                    .map((q) => (
                      <SelectItem key={q.id} value={q.id}>
                        {getQuestionIndex(q.id)}. {q.title || q.type}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveLogic}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
