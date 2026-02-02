import { sendEmail, emailTemplates } from './email'
import type { Form, Response } from '@/types/database'

/**
 * Process custom email body with placeholders
 * Supported placeholders:
 * - @Form Name - replaced with form title
 * - @All Answers - replaced with formatted answers
 */
function processCustomBody(
  body: string, 
  formTitle: string, 
  formattedAnswers: Array<{ question: string; answer: string }>
): string {
  let processed = body
  
  // Replace @Form Name
  processed = processed.replace(/@Form Name/gi, formTitle)
  
  // Replace @All Answers with formatted answers
  const answersText = formattedAnswers
    .map(a => `${a.question}: ${a.answer}`)
    .join('\n')
  processed = processed.replace(/@All Answers/gi, answersText)
  
  return processed
}

/**
 * Send email notifications for a form submission
 * - Owner notification if enabled
 * - Respondent confirmation if enabled
 */
export async function sendFormNotifications(form: Form, response: Response): Promise<void> {
  const settings = form.settings
  const answers = response.answers as Record<string, unknown>
  const questions = form.questions || []
  
  const submittedAt = new Date(response.submitted_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  
  // Prepare answers array for email template
  const formattedAnswers = questions
    .filter(q => q.type !== 'welcome' && q.type !== 'thank_you')
    .map(q => ({
      question: q.title,
      answer: formatAnswer(answers[q.id]),
    }))
    .filter(a => a.answer)
  
  // Send owner notification
  if (settings.emailNotifications?.enabled && settings.emailNotifications.to) {
    // Check if custom body is configured
    const customBody = settings.emailNotifications.body
    
    const template = emailTemplates.formSubmissionNotification({
      formTitle: form.title,
      formId: form.id,
      answers: formattedAnswers,
      submittedAt,
      customBody: customBody 
        ? processCustomBody(customBody, form.title, formattedAnswers) 
        : undefined,
    })
    
    const result = await sendEmail({
      to: settings.emailNotifications.to,
      subject: settings.emailNotifications.subject || template.subject,
      html: template.html,
      text: template.text,
      replyTo: settings.emailNotifications.replyTo,
    })
    
    if (!result.success) {
      console.error('Failed to send owner notification:', result.error)
    }
  }
  
  // Send respondent confirmation
  if (settings.responderEmail?.enabled && settings.responderEmail.emailField) {
    const respondentEmail = answers[settings.responderEmail.emailField]
    
    if (respondentEmail && typeof respondentEmail === 'string' && respondentEmail.includes('@')) {
      const template = emailTemplates.formSubmissionConfirmation({
        formTitle: form.title,
        customMessage: settings.responderEmail.body,
        submittedAt,
      })
      
      const result = await sendEmail({
        to: respondentEmail,
        subject: settings.responderEmail.subject || template.subject,
        html: template.html,
        text: template.text,
      })
      
      if (!result.success) {
        console.error('Failed to send respondent confirmation:', result.error)
      }
    }
  }
}

function formatAnswer(answer: unknown): string {
  if (answer === null || answer === undefined) return ''
  if (typeof answer === 'string') return answer
  if (typeof answer === 'number') return String(answer)
  if (typeof answer === 'boolean') return answer ? 'Yes' : 'No'
  if (Array.isArray(answer)) return answer.map(String).join(', ')
  if (typeof answer === 'object') return JSON.stringify(answer)
  return String(answer)
}
