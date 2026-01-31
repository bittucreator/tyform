import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Send email via Unosend REST API
    const response = await fetch('https://www.unosend.co/api/v1/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UNOSEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Tyform Contact <noreply@tyform.com>',
        to: ['support@tyform.com'],
        subject: `[Contact Form] ${subject}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #111; margin-bottom: 24px;">New Contact Form Submission</h2>
            
            <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <p style="margin: 0 0 12px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 0 0 12px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p style="margin: 0;"><strong>Subject:</strong> ${subject}</p>
            </div>
            
            <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px;">
              <h3 style="color: #111; margin: 0 0 16px 0;">Message</h3>
              <p style="color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
              This message was sent from the Tyform contact form.
            </p>
          </div>
        `,
        reply_to: email,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Unosend API error:', errorData)
      throw new Error('Failed to send email')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}
