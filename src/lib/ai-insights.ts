import { generateText, streamText } from 'ai'
import { getDefaultModel } from './ai'
import type { Response, Question } from '@/types/database'

export interface ResponseInsight {
  summary: string
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
  keyThemes: string[]
  actionItems: string[]
  highlights: {
    positive: string[]
    negative: string[]
  }
}

/**
 * Generate insights from form responses
 */
export async function generateResponseInsights(
  questions: Question[],
  responses: Response[]
): Promise<ResponseInsight> {
  const model = getDefaultModel()
  
  // Format responses for analysis
  const formattedResponses = responses.map((r, i) => {
    const answerStrings = Object.entries(r.answers).map(([qId, answer]) => {
      const question = questions.find(q => q.id === qId)
      const qTitle = question?.title || qId
      return `${qTitle}: ${JSON.stringify(answer)}`
    })
    return `Response ${i + 1}:\n${answerStrings.join('\n')}`
  }).join('\n\n')
  
  const { text } = await generateText({
    model,
    system: `You are an expert data analyst. Analyze form responses and provide actionable insights.
Return your analysis as a valid JSON object with this exact structure:
{
  "summary": "Brief overall summary",
  "sentiment": "positive" | "neutral" | "negative" | "mixed",
  "keyThemes": ["theme1", "theme2"],
  "actionItems": ["action1", "action2"],
  "highlights": {
    "positive": ["positive feedback 1"],
    "negative": ["negative feedback 1"]
  }
}`,
    prompt: `Analyze these ${responses.length} form responses and provide insights:

${formattedResponses}`,
  })
  
  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ResponseInsight
    }
  } catch {
    // Fallback if parsing fails
  }
  
  return {
    summary: text,
    sentiment: 'neutral',
    keyThemes: [],
    actionItems: [],
    highlights: { positive: [], negative: [] },
  }
}

/**
 * Stream a summary of responses (for real-time display)
 */
export async function streamResponseSummary(
  questions: Question[],
  responses: Response[],
  onChunk: (text: string) => void
): Promise<string> {
  const model = getDefaultModel()
  
  const formattedResponses = responses.slice(0, 50).map((r, i) => {
    const answerStrings = Object.entries(r.answers).map(([qId, answer]) => {
      const question = questions.find(q => q.id === qId)
      const qTitle = question?.title || qId
      return `${qTitle}: ${JSON.stringify(answer)}`
    })
    return `Response ${i + 1}:\n${answerStrings.join('\n')}`
  }).join('\n\n')
  
  const { textStream, text } = streamText({
    model,
    system: `You are a helpful analyst. Provide a clear, concise summary of form responses.
Focus on key patterns, notable responses, and actionable insights.
Use bullet points for clarity.`,
    prompt: `Summarize these ${responses.length} form responses:

${formattedResponses}${responses.length > 50 ? `\n\n(Showing first 50 of ${responses.length} responses)` : ''}`,
  })
  
  for await (const chunk of textStream) {
    onChunk(chunk)
  }
  
  return text
}

/**
 * Answer questions about responses using AI
 */
export async function askAboutResponses(
  questions: Question[],
  responses: Response[],
  userQuestion: string
): Promise<string> {
  const model = getDefaultModel()
  
  const formattedResponses = responses.slice(0, 30).map((r, i) => {
    const answerStrings = Object.entries(r.answers).map(([qId, answer]) => {
      const question = questions.find(q => q.id === qId)
      const qTitle = question?.title || qId
      return `${qTitle}: ${JSON.stringify(answer)}`
    })
    return `Response ${i + 1}:\n${answerStrings.join('\n')}`
  }).join('\n\n')
  
  const { text } = await generateText({
    model,
    system: `You are a helpful analyst assistant. Answer questions about form responses accurately and concisely.
If you don't have enough data to answer, say so.`,
    prompt: `Form responses data:

${formattedResponses}${responses.length > 30 ? `\n\n(Showing first 30 of ${responses.length} responses)` : ''}

User question: ${userQuestion}`,
  })
  
  return text
}

/**
 * Generate a personalized thank you message based on responses
 */
export async function generateThankYouMessage(
  questions: Question[],
  answers: Record<string, unknown>
): Promise<string> {
  const model = getDefaultModel()
  
  const answerStrings = Object.entries(answers).map(([qId, answer]) => {
    const question = questions.find(q => q.id === qId)
    const qTitle = question?.title || qId
    return `${qTitle}: ${JSON.stringify(answer)}`
  })
  
  const { text } = await generateText({
    model,
    system: `You are a friendly assistant. Generate a brief, personalized thank you message based on the form responses.
Keep it warm, professional, and under 2 sentences.`,
    prompt: `Generate a thank you message for someone who submitted:

${answerStrings.join('\n')}`,
  })
  
  return text
}
