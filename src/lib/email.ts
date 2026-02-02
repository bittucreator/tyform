import { env } from './env'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
}

interface UnosendResponse {
  id?: string
  error?: string
  message?: string
}

/**
 * Send an email using Unosend API
 * @see https://docs.unosend.co/api-reference/emails
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string; id?: string }> {
  const apiKey = env.email.apiKey
  
  if (!apiKey) {
    console.warn('UNOSEND_API_KEY is not set, skipping email send')
    return { success: false, error: 'Email service not configured' }
  }

  const fromName = process.env.UNOSEND_FROM_EMAIL_NAME || 'Tyform'
  const fromEmail = env.email.fromEmail

  try {
    const response = await fetch('https://www.unosend.co/api/v1/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
      }),
    })

    const data: UnosendResponse = await response.json()

    if (!response.ok) {
      console.error('Unosend API error:', data)
      return { success: false, error: data.error || data.message || 'Failed to send email' }
    }

    return { success: true, id: data.id }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Email templates
export const emailTemplates = {
  workspaceInvitation: ({
    inviterName,
    workspaceName,
    inviteLink,
    role,
  }: {
    inviterName: string
    workspaceName: string
    inviteLink: string
    role: string
  }) => ({
    subject: `${inviterName} invited you to join ${workspaceName} on Tyform`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to ${workspaceName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <img src="${env.app.url}/logo.svg" alt="Tyform" width="48" height="48" style="border-radius: 12px;">
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b; text-align: center;">
                You're invited to join ${workspaceName}
              </h1>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #52525b; text-align: center;">
                <strong>${inviterName}</strong> has invited you to collaborate on <strong>${workspaceName}</strong> as a <strong>${role}</strong>.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 8px 0 32px;">
                    <a href="${inviteLink}" style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Link fallback -->
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #71717a; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <a href="${inviteLink}" style="color: #3b82f6; word-break: break-all;">${inviteLink}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #a1a1aa; text-align: center;">
                This invitation will expire in 7 days.<br>
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Branding -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px;">
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #a1a1aa;">
                Sent by <a href="${env.app.url}" style="color: #71717a; text-decoration: none;">Tyform</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    text: `
${inviterName} invited you to join ${workspaceName} on Tyform

You've been invited to collaborate on ${workspaceName} as a ${role}.

Accept the invitation by visiting:
${inviteLink}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

---
Sent by Tyform
${env.app.url}
    `.trim(),
  }),

  // Form submission notification for form owner
  formSubmissionNotification: ({
    formTitle,
    formId,
    answers,
    submittedAt,
  }: {
    formTitle: string
    formId: string
    answers: Array<{ question: string; answer: string }>
    submittedAt: string
  }) => ({
    subject: `New submission for ${formTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Form Submission</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #635BFF 0%, #8B5CF6 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">
                New Form Submission
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                ${escapeHtml(formTitle)}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 24px;">
              <p style="margin: 0 0 16px; color: #666; font-size: 14px;">
                Submitted on ${submittedAt}
              </p>
              
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #eee; border-radius: 8px;">
                ${answers.map(a => `
                  <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #eee; font-weight: 500; color: #333; width: 40%; vertical-align: top;">
                      ${escapeHtml(a.question)}
                    </td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #eee; color: #666;">
                      ${escapeHtml(a.answer)}
                    </td>
                  </tr>
                `).join('')}
              </table>
              
              <div style="margin-top: 24px; text-align: center;">
                <a href="${env.app.url}/forms/${formId}/responses" 
                   style="display: inline-block; padding: 12px 24px; background: #635BFF; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
                  View All Responses
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 24px; background: #f9fafb; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                Sent by <a href="${env.app.url}" style="color: #635BFF; text-decoration: none;">Tyform</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    text: `New submission for ${formTitle}\n\nSubmitted on ${submittedAt}\n\n${answers.map(a => `${a.question}: ${a.answer}`).join('\n')}\n\nView responses: ${env.app.url}/forms/${formId}/responses`,
  }),

  // Confirmation email for respondent
  formSubmissionConfirmation: ({
    formTitle,
    customMessage,
    submittedAt,
  }: {
    formTitle: string
    customMessage?: string
    submittedAt: string
  }) => ({
    subject: `Thank you for your submission`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #635BFF 0%, #8B5CF6 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 600;">
                Thank You!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px; text-align: center;">
              <p style="margin: 0 0 16px; color: #333; font-size: 16px; line-height: 1.6;">
                ${customMessage ? escapeHtml(customMessage) : `Thank you for completing <strong>${escapeHtml(formTitle)}</strong>. Your response has been recorded.`}
              </p>
              
              <p style="margin: 16px 0 0; color: #666; font-size: 14px;">
                Submitted on ${submittedAt}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 16px 24px; background: #f9fafb; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                Powered by <a href="${env.app.url}" style="color: #635BFF; text-decoration: none;">Tyform</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
    text: customMessage || `Thank you for completing ${formTitle}. Your response has been recorded.\n\nSubmitted on ${submittedAt}`,
  }),
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, m => map[m])
}
