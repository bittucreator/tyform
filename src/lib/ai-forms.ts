import { generateObject } from 'ai'
import { z } from 'zod'
import { getDefaultModel } from './ai'
import type { Question, QuestionType } from '@/types/database'
import { nanoid } from 'nanoid'

// Schema for AI-generated questions
const questionSchema = z.object({
  type: z.enum([
    'short_text', 'long_text', 'email', 'phone', 'url', 'number',
    'multiple_choice', 'checkbox', 'dropdown', 'rating', 'scale',
    'date', 'yes_no', 'nps', 'slider'
  ]),
  title: z.string().describe('The question text'),
  description: z.string().optional().describe('Optional helper text'),
  required: z.boolean().describe('Whether the question is required'),
  properties: z.object({
    placeholder: z.string().optional(),
    options: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
})

const formSchema = z.object({
  title: z.string().describe('Form title'),
  description: z.string().describe('Form description'),
  questions: z.array(questionSchema).describe('List of questions'),
})

export interface GenerateFormOptions {
  prompt: string
  questionCount?: number
  includeWelcome?: boolean
  includeThankYou?: boolean
}

/**
 * Generate a complete form from a natural language description
 */
export async function generateFormFromPrompt(options: GenerateFormOptions): Promise<{
  title: string
  description: string
  questions: Question[]
}> {
  const { prompt, questionCount = 5, includeWelcome = true, includeThankYou = true } = options
  
  const model = getDefaultModel()
  
  const systemPrompt = `You are an expert form designer. Create professional, engaging forms based on user descriptions.

Guidelines:
- Create clear, concise questions
- Use appropriate question types for each field
- Make important fields required
- Add helpful descriptions where needed
- For multiple choice/checkbox/dropdown, provide 3-5 relevant options
- For rating questions, use 1-5 scale
- For NPS questions, use 0-10 scale
- Keep the form focused and not too long (${questionCount} questions max)

Question types available:
- short_text: Single line text input
- long_text: Multi-line text area
- email: Email with validation
- phone: Phone number
- url: Website URL
- number: Numeric input
- multiple_choice: Single select from options
- checkbox: Multi-select from options
- dropdown: Dropdown select
- rating: Star rating (1-5)
- scale: Numeric scale
- date: Date picker
- yes_no: Yes/No toggle
- nps: Net Promoter Score (0-10)
- slider: Slider with min/max`

  const { object } = await generateObject({
    model,
    schema: formSchema,
    system: systemPrompt,
    prompt: `Create a form for: ${prompt}\n\nGenerate approximately ${questionCount} relevant questions.`,
  })
  
  // Transform to proper Question format with IDs
  const questions: Question[] = []
  
  if (includeWelcome) {
    questions.push({
      id: nanoid(),
      type: 'welcome',
      title: `Welcome to ${object.title}`,
      description: object.description,
      required: false,
      properties: { buttonText: 'Start' },
    })
  }
  
  for (const q of object.questions) {
    const question: Question = {
      id: nanoid(),
      type: q.type as QuestionType,
      title: q.title,
      description: q.description,
      required: q.required,
      properties: {
        ...q.properties,
        options: q.properties?.options?.map(opt => ({
          id: nanoid(),
          label: opt.label,
          value: opt.value,
        })),
      },
    }
    questions.push(question)
  }
  
  if (includeThankYou) {
    questions.push({
      id: nanoid(),
      type: 'thank_you',
      title: 'Thank you!',
      description: 'Your response has been recorded.',
      required: false,
      properties: {},
    })
  }
  
  return {
    title: object.title,
    description: object.description,
    questions,
  }
}

/**
 * Suggest additional questions based on existing form
 */
export async function suggestQuestions(
  formTitle: string,
  existingQuestions: Question[],
  count: number = 3
): Promise<Question[]> {
  const model = getDefaultModel()
  
  const existingTitles = existingQuestions.map(q => q.title).join(', ')
  
  const { object } = await generateObject({
    model,
    schema: z.object({
      questions: z.array(questionSchema),
    }),
    system: `You are a form design expert. Suggest additional questions that would complement an existing form.
Do not repeat existing questions. Make suggestions relevant and useful.`,
    prompt: `Form title: ${formTitle}
Existing questions: ${existingTitles}

Suggest ${count} additional relevant questions that would improve this form.`,
  })
  
  return object.questions.map(q => ({
    id: nanoid(),
    type: q.type as QuestionType,
    title: q.title,
    description: q.description,
    required: q.required,
    properties: {
      ...q.properties,
      options: q.properties?.options?.map(opt => ({
        id: nanoid(),
        label: opt.label,
        value: opt.value,
      })),
    },
  }))
}

/**
 * Improve a question's wording
 */
export async function improveQuestion(question: Question): Promise<{
  title: string
  description?: string
}> {
  const model = getDefaultModel()
  
  const { object } = await generateObject({
    model,
    schema: z.object({
      title: z.string().describe('Improved question text'),
      description: z.string().optional().describe('Improved helper text'),
    }),
    system: `You are a form design expert. Improve question wording to be clearer, more engaging, and professional.
Keep the same intent but make it better.`,
    prompt: `Improve this ${question.type} question:
Title: ${question.title}
Description: ${question.description || 'None'}`,
  })
  
  return object
}
