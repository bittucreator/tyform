import type { Question, LogicRule, LogicCondition, LogicOperator, Json } from '@/types/database'

/**
 * Evaluate a single condition against the current answers
 */
export function evaluateCondition(
  condition: LogicCondition,
  answers: Record<string, Json>,
  questions: Question[]
): boolean {
  const answer = answers[condition.questionId]
  const question = questions.find(q => q.id === condition.questionId)
  
  if (!question) return true // If question doesn't exist, skip condition
  
  const answerValue = answer !== undefined ? answer : null
  const conditionValue = condition.value

  switch (condition.operator) {
    case 'equals':
      if (Array.isArray(answerValue)) {
        return answerValue.includes(conditionValue as string)
      }
      return String(answerValue) === String(conditionValue)
    
    case 'not_equals':
      if (Array.isArray(answerValue)) {
        return !answerValue.includes(conditionValue as string)
      }
      return String(answerValue) !== String(conditionValue)
    
    case 'contains':
      if (Array.isArray(answerValue)) {
        return answerValue.some(v => 
          String(v).toLowerCase().includes(String(conditionValue).toLowerCase())
        )
      }
      return String(answerValue || '').toLowerCase().includes(String(conditionValue).toLowerCase())
    
    case 'not_contains':
      if (Array.isArray(answerValue)) {
        return !answerValue.some(v => 
          String(v).toLowerCase().includes(String(conditionValue).toLowerCase())
        )
      }
      return !String(answerValue || '').toLowerCase().includes(String(conditionValue).toLowerCase())
    
    case 'greater_than':
      return Number(answerValue) > Number(conditionValue)
    
    case 'less_than':
      return Number(answerValue) < Number(conditionValue)
    
    case 'is_empty':
      if (answerValue === null || answerValue === undefined) return true
      if (Array.isArray(answerValue)) return answerValue.length === 0
      return String(answerValue).trim() === ''
    
    case 'is_not_empty':
      if (answerValue === null || answerValue === undefined) return false
      if (Array.isArray(answerValue)) return answerValue.length > 0
      return String(answerValue).trim() !== ''
    
    default:
      return true
  }
}

/**
 * Evaluate a logic rule against the current answers
 */
export function evaluateLogicRule(
  rule: LogicRule,
  answers: Record<string, Json>,
  questions: Question[]
): boolean {
  if (!rule.conditions || rule.conditions.length === 0) return true
  
  const results = rule.conditions.map(condition => 
    evaluateCondition(condition, answers, questions)
  )
  
  if (rule.conditionLogic === 'and') {
    return results.every(Boolean)
  } else {
    return results.some(Boolean)
  }
}

/**
 * Determine if a question should be shown based on its logic rules
 */
export function shouldShowQuestion(
  question: Question,
  answers: Record<string, Json>,
  questions: Question[]
): boolean {
  // If no logic, always show
  if (!question.logic) return true
  
  const rule = question.logic
  const conditionsMet = evaluateLogicRule(rule, answers, questions)
  
  // If action is 'show', show when conditions are met
  // If action is 'skip', show when conditions are NOT met
  return rule.action === 'show' ? conditionsMet : !conditionsMet
}

/**
 * Get the next question index considering logic rules
 */
export function getNextQuestionIndex(
  currentIndex: number,
  questions: Question[],
  answers: Record<string, Json>
): number {
  // Check if current question has a jump target
  const currentQuestion = questions[currentIndex]
  if (currentQuestion?.logic?.jumpToQuestionId && 
      evaluateLogicRule(currentQuestion.logic, answers, questions)) {
    const jumpIndex = questions.findIndex(q => q.id === currentQuestion.logic!.jumpToQuestionId)
    if (jumpIndex !== -1) return jumpIndex
  }
  
  // Find next visible question
  for (let i = currentIndex + 1; i < questions.length; i++) {
    if (shouldShowQuestion(questions[i], answers, questions)) {
      return i
    }
  }
  
  // If no more questions, return length (will trigger submit)
  return questions.length
}

/**
 * Get the previous question index considering logic rules
 */
export function getPreviousQuestionIndex(
  currentIndex: number,
  questions: Question[],
  answers: Record<string, Json>
): number {
  // Find previous visible question
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (shouldShowQuestion(questions[i], answers, questions)) {
      return i
    }
  }
  
  return 0
}

/**
 * Get visible questions for progress calculation
 */
export function getVisibleQuestions(
  questions: Question[],
  answers: Record<string, Json>
): Question[] {
  return questions.filter(q => shouldShowQuestion(q, answers, questions))
}

/**
 * Get available operators for a question type
 */
export function getOperatorsForQuestionType(type: Question['type']): { value: LogicOperator; label: string }[] {
  const textOperators: { value: LogicOperator; label: string }[] = [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'does not equal' },
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
  ]
  
  const numberOperators: { value: LogicOperator; label: string }[] = [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'does not equal' },
    { value: 'greater_than', label: 'is greater than' },
    { value: 'less_than', label: 'is less than' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' },
  ]
  
  const choiceOperators: { value: LogicOperator; label: string }[] = [
    { value: 'equals', label: 'is' },
    { value: 'not_equals', label: 'is not' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is answered' },
  ]
  
  const yesNoOperators: { value: LogicOperator; label: string }[] = [
    { value: 'equals', label: 'is' },
    { value: 'not_equals', label: 'is not' },
  ]
  
  switch (type) {
    case 'short_text':
    case 'long_text':
    case 'email':
    case 'phone':
    case 'url':
      return textOperators
    
    case 'number':
    case 'rating':
    case 'scale':
      return numberOperators
    
    case 'multiple_choice':
    case 'checkbox':
    case 'dropdown':
      return choiceOperators
    
    case 'yes_no':
      return yesNoOperators
    
    case 'date':
      return [
        { value: 'equals', label: 'is' },
        { value: 'not_equals', label: 'is not' },
        { value: 'is_empty', label: 'is empty' },
        { value: 'is_not_empty', label: 'is answered' },
      ]
    
    default:
      return textOperators
  }
}

/**
 * Check if an operator requires a value
 */
export function operatorRequiresValue(operator: LogicOperator): boolean {
  return !['is_empty', 'is_not_empty'].includes(operator)
}
