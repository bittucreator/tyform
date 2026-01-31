import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { Question, QuestionType, FormSettings, Form } from '@/types/database'

interface FormBuilderState {
  form: {
    id: string
    title: string
    description: string
    questions: Question[]
    settings: FormSettings
    isPublished: boolean
  }
  selectedQuestionId: string | null
  isDirty: boolean
  
  // Actions
  setForm: (form: Partial<Form>) => void
  setTitle: (title: string) => void
  setDescription: (description: string) => void
  addQuestion: (type: QuestionType) => void
  updateQuestion: (id: string, updates: Partial<Question>) => void
  deleteQuestion: (id: string) => void
  duplicateQuestion: (id: string) => void
  reorderQuestions: (activeId: string, overId: string) => void
  selectQuestion: (id: string | null) => void
  updateSettings: (settings: Partial<FormSettings>) => void
  resetForm: () => void
  setDirty: (isDirty: boolean) => void
}

const defaultSettings: FormSettings = {
  showProgressBar: true,
  showQuestionNumbers: true,
  shuffleQuestions: false,
  theme: {
    primaryColor: '#635BFF',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'Inter',
  },
}

const createDefaultQuestion = (type: QuestionType): Question => {
  const base = {
    id: nanoid(),
    type,
    title: '',
    description: '',
    required: false,
    properties: {},
  }

  switch (type) {
    case 'multiple_choice':
    case 'checkbox':
    case 'dropdown':
      return {
        ...base,
        title: 'Your question here',
        properties: {
          options: [
            { id: nanoid(), label: 'Option 1', value: 'option_1' },
            { id: nanoid(), label: 'Option 2', value: 'option_2' },
          ],
        },
      }
    case 'rating':
      return {
        ...base,
        title: 'How would you rate this?',
        properties: { min: 1, max: 5 },
      }
    case 'scale':
      return {
        ...base,
        title: 'On a scale of 1-10',
        properties: { min: 1, max: 10, step: 1 },
      }
    case 'welcome':
      return {
        ...base,
        title: 'Welcome to our form',
        properties: { buttonText: 'Start' },
      }
    case 'thank_you':
      return {
        ...base,
        title: 'Thank you!',
        description: 'Your response has been recorded.',
        properties: {},
      }
    case 'short_text':
      return {
        ...base,
        title: 'Your question here',
        properties: { placeholder: 'Type your answer here...', maxLength: 100 },
      }
    case 'long_text':
      return {
        ...base,
        title: 'Your question here',
        properties: { placeholder: 'Type your answer here...', maxLength: 1000 },
      }
    case 'email':
      return {
        ...base,
        title: 'What is your email?',
        properties: { placeholder: 'name@example.com' },
      }
    case 'number':
      return {
        ...base,
        title: 'Enter a number',
        properties: { placeholder: '0' },
      }
    case 'yes_no':
      return {
        ...base,
        title: 'Yes or No?',
        properties: {},
      }
    case 'file_upload':
      return {
        ...base,
        title: 'Upload your files',
        properties: {
          acceptedFileTypes: ['*'],
          maxFileSize: 10,
          maxFiles: 5,
        },
      }
    case 'signature':
      return {
        ...base,
        title: 'Please sign below',
        properties: {},
      }
    case 'matrix':
      return {
        ...base,
        title: 'Rate each item',
        properties: {
          rows: [
            { id: nanoid(), label: 'Quality' },
            { id: nanoid(), label: 'Service' },
            { id: nanoid(), label: 'Value' },
          ],
          columns: [
            { id: nanoid(), label: 'Very Bad' },
            { id: nanoid(), label: 'Bad' },
            { id: nanoid(), label: 'Neutral' },
            { id: nanoid(), label: 'Good' },
            { id: nanoid(), label: 'Very Good' },
          ],
        },
      }
    case 'ranking':
      return {
        ...base,
        title: 'Rank the following items',
        properties: {
          options: [
            { id: nanoid(), label: 'Item 1', value: 'item_1' },
            { id: nanoid(), label: 'Item 2', value: 'item_2' },
            { id: nanoid(), label: 'Item 3', value: 'item_3' },
          ],
        },
      }
    case 'slider':
      return {
        ...base,
        title: 'Select a value',
        properties: {
          min: 0,
          max: 100,
          step: 1,
          minLabel: '',
          maxLabel: '',
        },
      }
    case 'nps':
      return {
        ...base,
        title: 'How likely are you to recommend us to a friend?',
        properties: {
          leftLabel: 'Not likely at all',
          rightLabel: 'Extremely likely',
        },
      }
    case 'payment':
      return {
        ...base,
        title: 'Complete your payment',
        properties: {
          productName: 'Product',
          productDescription: 'Product description',
          currency: '$',
          amount: 0,
          stripePriceId: '',
        },
      }
    case 'address':
      return {
        ...base,
        title: 'What is your address?',
        properties: {
          addressFields: ['street', 'city', 'state', 'zip', 'country'],
          enableAutocomplete: false,
        },
      }
    case 'calculator':
      return {
        ...base,
        title: 'Calculated Total',
        properties: {
          formula: '',
          decimalPlaces: 2,
          prefix: '',
          suffix: '',
        },
      }
    default:
      return {
        ...base,
        title: 'Your question here',
      }
  }
}

export const useFormBuilder = create<FormBuilderState>((set, get) => ({
  form: {
    id: '',
    title: 'Untitled Form',
    description: '',
    questions: [],
    settings: defaultSettings,
    isPublished: false,
  },
  selectedQuestionId: null,
  isDirty: false,

  setForm: (form) =>
    set((state) => ({
      form: { 
        ...state.form, 
        ...form, 
        description: form.description ?? state.form.description,
        questions: form.questions || state.form.questions 
      },
      isDirty: false,
    })),

  setTitle: (title) =>
    set((state) => ({
      form: { ...state.form, title },
      isDirty: true,
    })),

  setDescription: (description) =>
    set((state) => ({
      form: { ...state.form, description },
      isDirty: true,
    })),

  addQuestion: (type) => {
    const question = createDefaultQuestion(type)
    set((state) => ({
      form: {
        ...state.form,
        questions: [...state.form.questions, question],
      },
      selectedQuestionId: question.id,
      isDirty: true,
    }))
  },

  updateQuestion: (id, updates) =>
    set((state) => ({
      form: {
        ...state.form,
        questions: state.form.questions.map((q) =>
          q.id === id ? { ...q, ...updates } : q
        ),
      },
      isDirty: true,
    })),

  deleteQuestion: (id) =>
    set((state) => ({
      form: {
        ...state.form,
        questions: state.form.questions.filter((q) => q.id !== id),
      },
      selectedQuestionId:
        state.selectedQuestionId === id ? null : state.selectedQuestionId,
      isDirty: true,
    })),

  duplicateQuestion: (id) => {
    const state = get()
    const question = state.form.questions.find((q) => q.id === id)
    if (!question) return

    const newQuestion = {
      ...question,
      id: nanoid(),
      title: `${question.title} (copy)`,
    }

    const index = state.form.questions.findIndex((q) => q.id === id)
    const newQuestions = [...state.form.questions]
    newQuestions.splice(index + 1, 0, newQuestion)

    set({
      form: { ...state.form, questions: newQuestions },
      selectedQuestionId: newQuestion.id,
      isDirty: true,
    })
  },

  reorderQuestions: (activeId, overId) => {
    set((state) => {
      const oldIndex = state.form.questions.findIndex((q) => q.id === activeId)
      const newIndex = state.form.questions.findIndex((q) => q.id === overId)

      if (oldIndex === -1 || newIndex === -1) return state

      const newQuestions = [...state.form.questions]
      const [removed] = newQuestions.splice(oldIndex, 1)
      newQuestions.splice(newIndex, 0, removed)

      return {
        form: { ...state.form, questions: newQuestions },
        isDirty: true,
      }
    })
  },

  selectQuestion: (id) => set({ selectedQuestionId: id }),

  updateSettings: (settings) =>
    set((state) => ({
      form: {
        ...state.form,
        settings: { ...state.form.settings, ...settings },
      },
      isDirty: true,
    })),

  resetForm: () =>
    set({
      form: {
        id: '',
        title: 'Untitled Form',
        description: '',
        questions: [],
        settings: defaultSettings,
        isPublished: false,
      },
      selectedQuestionId: null,
      isDirty: false,
    }),

  setDirty: (isDirty) => set({ isDirty }),
}))
