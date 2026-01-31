// Unosend email client

const UNOSEND_API_URL = 'https://www.unosend.co/api/v1'

interface SendEmailOptions {
  from: string
  to: string | string[]
  subject: string
  html?: string
  text?: string
  reply_to?: string
}

interface SendEmailResponse {
  id: string
  from: string
  to: string[]
  created_at: string
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResponse> {
  const apiKey = process.env.UNOSEND_API_KEY

  if (!apiKey) {
    throw new Error('UNOSEND_API_KEY environment variable is not set')
  }

  const response = await fetch(`${UNOSEND_API_URL}/emails`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to send email' }))
    throw new Error(error.message || `Failed to send email: ${response.status}`)
  }

  return response.json()
}

export async function sendInvitationEmail({
  to,
  inviterName,
  workspaceName,
  inviteLink,
  role,
}: {
  to: string
  inviterName: string
  workspaceName: string
  inviteLink: string
  role: string
}): Promise<SendEmailResponse> {
  const fromEmail = process.env.UNOSEND_FROM_EMAIL || 'noreply@tyform.app'
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to join ${workspaceName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Tyform</h1>
  </div>
  
  <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #111827;">You've been invited!</h2>
    
    <p style="margin: 0 0 16px; color: #6b7280;">
      <strong style="color: #111827;">${inviterName}</strong> has invited you to join 
      <strong style="color: #111827;">${workspaceName}</strong> on Tyform as a <strong style="color: #111827;">${role}</strong>.
    </p>
    
    <p style="margin: 0 0 24px; color: #6b7280;">
      Click the button below to accept the invitation and join the team.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${inviteLink}" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Accept Invitation
      </a>
    </div>
    
    <p style="margin: 24px 0 0; font-size: 13px; color: #9ca3af;">
      This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    
    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
      If the button doesn't work, copy and paste this link into your browser:
      <br>
      <a href="${inviteLink}" style="color: #635BFF; word-break: break-all;">${inviteLink}</a>
    </p>
  </div>
  
  <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">© ${new Date().getFullYear()} Tyform. All rights reserved.</p>
  </div>
</body>
</html>
`

  const text = `
You've been invited to join ${workspaceName}!

${inviterName} has invited you to join ${workspaceName} on Tyform as a ${role}.

Click the link below to accept the invitation:
${inviteLink}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

© ${new Date().getFullYear()} Tyform. All rights reserved.
`

  return sendEmail({
    from: `Tyform <${fromEmail}>`,
    to,
    subject: `You're invited to join ${workspaceName} on Tyform`,
    html,
    text,
  })
}

// Send new response notification email
export async function sendNewResponseEmail({
  to,
  formName,
  responseCount,
  dashboardLink,
}: {
  to: string
  formName: string
  responseCount: number
  dashboardLink: string
}): Promise<SendEmailResponse> {
  const fromEmail = process.env.UNOSEND_FROM_EMAIL || 'noreply@tyform.app'
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New response on ${formName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Tyform</h1>
  </div>
  
  <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #111827;">🎉 New Response!</h2>
    
    <p style="margin: 0 0 16px; color: #6b7280;">
      You have a new response on <strong style="color: #111827;">${formName}</strong>.
    </p>
    
    <p style="margin: 0 0 24px; color: #6b7280;">
      Total responses: <strong style="color: #111827;">${responseCount}</strong>
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${dashboardLink}" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
        View Response
      </a>
    </div>
  </div>
  
  <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">© ${new Date().getFullYear()} Tyform. All rights reserved.</p>
  </div>
</body>
</html>
`

  const text = `New Response on ${formName}!

You have a new response on ${formName}.
Total responses: ${responseCount}

View your response: ${dashboardLink}

© ${new Date().getFullYear()} Tyform. All rights reserved.
`

  return sendEmail({
    from: `Tyform <${fromEmail}>`,
    to,
    subject: `🎉 New response on ${formName}`,
    html,
    text,
  })
}

// Send weekly digest email
export async function sendWeeklyDigestEmail({
  to,
  userName,
  stats,
  dashboardLink,
}: {
  to: string
  userName: string
  stats: {
    totalForms: number
    totalResponses: number
    newResponsesThisWeek: number
    topForm?: { name: string; responses: number }
  }
  dashboardLink: string
}): Promise<SendEmailResponse> {
  const fromEmail = process.env.UNOSEND_FROM_EMAIL || 'noreply@tyform.app'
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Tyform Digest</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Tyform</h1>
  </div>
  
  <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="margin: 0 0 16px; font-size: 20px; color: #111827;">📊 Weekly Digest</h2>
    
    <p style="margin: 0 0 24px; color: #6b7280;">
      Hi ${userName}, here's your weekly summary:
    </p>
    
    <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #6b7280;">Total Forms</span>
        <strong style="color: #111827;">${stats.totalForms}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #6b7280;">Total Responses</span>
        <strong style="color: #111827;">${stats.totalResponses}</strong>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: #6b7280;">New This Week</span>
        <strong style="color: #22c55e;">${stats.newResponsesThisWeek}</strong>
      </div>
    </div>
    
    ${stats.topForm ? `
    <p style="margin: 0 0 24px; color: #6b7280;">
      🏆 Your top form: <strong style="color: #111827;">${stats.topForm.name}</strong> with ${stats.topForm.responses} responses this week.
    </p>
    ` : ''}
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${dashboardLink}" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
        View Dashboard
      </a>
    </div>
  </div>
  
  <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">© ${new Date().getFullYear()} Tyform. All rights reserved.</p>
    <p style="margin: 8px 0 0;">
      <a href="${dashboardLink}/settings" style="color: #9ca3af;">Unsubscribe from weekly digest</a>
    </p>
  </div>
</body>
</html>
`

  const text = `Weekly Digest

Hi ${userName}, here's your weekly summary:

Total Forms: ${stats.totalForms}
Total Responses: ${stats.totalResponses}
New This Week: ${stats.newResponsesThisWeek}

${stats.topForm ? `Top form: ${stats.topForm.name} with ${stats.topForm.responses} responses this week.` : ''}

View your dashboard: ${dashboardLink}

© ${new Date().getFullYear()} Tyform. All rights reserved.
`

  return sendEmail({
    from: `Tyform <${fromEmail}>`,
    to,
    subject: `📊 Your Weekly Tyform Digest`,
    html,
    text,
  })
}

