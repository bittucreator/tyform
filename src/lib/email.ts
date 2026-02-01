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
    const response = await fetch('https://api.unosend.co/v1/emails', {
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
}
