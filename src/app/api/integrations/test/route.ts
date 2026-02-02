import { NextRequest, NextResponse } from 'next/server'

interface TestConfig {
  type: 'google-sheets' | 'notion' | 'slack' | 'discord'
  config: Record<string, string>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TestConfig
    const { type, config } = body

    switch (type) {
      case 'slack':
        return await testSlackWebhook(config.webhookUrl)
      
      case 'discord':
        return await testDiscordWebhook(config.webhookUrl)
      
      case 'google-sheets':
        // For Google Sheets, we'd need OAuth - just validate URL format for now
        if (!config.spreadsheetUrl?.includes('docs.google.com/spreadsheets')) {
          return NextResponse.json({ error: 'Invalid Google Sheets URL' }, { status: 400 })
        }
        return NextResponse.json({ success: true, message: 'URL format is valid. Full OAuth integration coming soon.' })
      
      case 'notion':
        return await testNotionConnection(config.databaseUrl, config.integrationToken)
      
      default:
        return NextResponse.json({ error: 'Unknown integration type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Integration test error:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}

async function testSlackWebhook(webhookUrl: string) {
  if (!webhookUrl?.startsWith('https://hooks.slack.com/')) {
    return NextResponse.json({ error: 'Invalid Slack webhook URL' }, { status: 400 })
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: '✅ Tyform connection test successful! Your form submissions will appear here.',
      }),
    })

    if (response.ok || response.status === 200) {
      return NextResponse.json({ success: true, message: 'Test message sent to Slack!' })
    } else {
      return NextResponse.json({ error: 'Slack webhook returned an error' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Could not connect to Slack' }, { status: 400 })
  }
}

async function testDiscordWebhook(webhookUrl: string) {
  if (!webhookUrl?.includes('discord.com/api/webhooks/')) {
    return NextResponse.json({ error: 'Invalid Discord webhook URL' }, { status: 400 })
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '✅ **Tyform connection test successful!** Your form submissions will appear here.',
        username: 'Tyform',
      }),
    })

    if (response.ok || response.status === 204) {
      return NextResponse.json({ success: true, message: 'Test message sent to Discord!' })
    } else {
      const text = await response.text()
      return NextResponse.json({ error: `Discord error: ${text}` }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Could not connect to Discord' }, { status: 400 })
  }
}

async function testNotionConnection(databaseUrl: string, token: string) {
  if (!token?.startsWith('secret_')) {
    return NextResponse.json({ error: 'Invalid Notion integration token' }, { status: 400 })
  }

  // Extract database ID from URL
  const dbIdMatch = databaseUrl?.match(/([a-f0-9]{32})/i)
  if (!dbIdMatch) {
    return NextResponse.json({ error: 'Could not find database ID in URL' }, { status: 400 })
  }

  const databaseId = dbIdMatch[1]

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
      },
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ 
        success: true, 
        message: `Connected to database: ${data.title?.[0]?.plain_text || 'Untitled'}` 
      })
    } else {
      const error = await response.json()
      return NextResponse.json({ 
        error: error.message || 'Could not access Notion database. Make sure the integration has access.' 
      }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Could not connect to Notion' }, { status: 400 })
  }
}
