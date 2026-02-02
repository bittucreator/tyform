/**
 * Test script to verify webhook save/load flow
 * Run with: npx ts-node --esm scripts/test-webhook-flow.ts
 * 
 * This test:
 * 1. Creates a test form with webhooks in settings
 * 2. Verifies the webhooks are stored correctly
 * 3. Updates the webhooks
 * 4. Verifies the update was saved
 * 5. Cleans up by deleting the test form
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Make sure .env.local has:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface Webhook {
  id: string
  url: string
  enabled: boolean
  events: ('response.created' | 'response.updated')[]
  secret?: string
}

interface FormSettings {
  showProgressBar: boolean
  showQuestionNumbers: boolean
  shuffleQuestions: boolean
  theme: {
    primaryColor: string
    backgroundColor: string
    textColor: string
    fontFamily: string
  }
  webhooks?: Webhook[]
}

async function runTests() {
  console.log('🚀 Starting webhook flow tests...\n')
  
  let testFormId: string | null = null
  
  try {
    // Get a test user (first user in profiles)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (profileError || !profiles || profiles.length === 0) {
      console.error('❌ No users found in database. Please create a user first.')
      process.exit(1)
    }
    
    const testUserId = profiles[0].id
    console.log(`📋 Using test user: ${testUserId}\n`)
    
    // Test 1: Create a form with webhooks
    console.log('TEST 1: Create form with webhooks')
    console.log('─'.repeat(40))
    
    const testWebhooks: Webhook[] = [
      {
        id: 'webhook-1',
        url: 'https://example.com/webhook1',
        enabled: true,
        events: ['response.created'],
        secret: 'whsec_test123'
      },
      {
        id: 'webhook-2',
        url: 'https://example.com/webhook2',
        enabled: false,
        events: ['response.created', 'response.updated'],
      }
    ]
    
    const formSettings: FormSettings = {
      showProgressBar: true,
      showQuestionNumbers: true,
      shuffleQuestions: false,
      theme: {
        primaryColor: '#635BFF',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontFamily: 'Inter'
      },
      webhooks: testWebhooks
    }
    
    const { data: createdForm, error: createError } = await supabase
      .from('forms')
      .insert({
        user_id: testUserId,
        title: 'Webhook Test Form',
        settings: formSettings,
        questions: []
      })
      .select()
      .single()
    
    if (createError || !createdForm) {
      console.error('❌ Failed to create form:', createError)
      process.exit(1)
    }
    
    testFormId = createdForm.id
    console.log(`✅ Created form: ${testFormId}`)
    
    // Verify webhooks were saved
    const savedWebhooks = (createdForm.settings as FormSettings).webhooks
    if (!savedWebhooks || savedWebhooks.length !== 2) {
      console.error('❌ Webhooks not saved correctly')
      console.log('   Expected: 2 webhooks')
      console.log('   Got:', savedWebhooks?.length || 0)
      process.exit(1)
    }
    
    console.log(`✅ Webhooks saved: ${savedWebhooks.length} webhooks`)
    console.log(`   - Webhook 1: ${savedWebhooks[0].url} (enabled: ${savedWebhooks[0].enabled})`)
    console.log(`   - Webhook 2: ${savedWebhooks[1].url} (enabled: ${savedWebhooks[1].enabled})`)
    
    // Test 2: Read form and verify webhooks
    console.log('\nTEST 2: Read form and verify webhooks')
    console.log('─'.repeat(40))
    
    const { data: readForm, error: readError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', testFormId)
      .single()
    
    if (readError || !readForm) {
      console.error('❌ Failed to read form:', readError)
      process.exit(1)
    }
    
    const readWebhooks = (readForm.settings as FormSettings).webhooks
    if (!readWebhooks || readWebhooks.length !== 2) {
      console.error('❌ Webhooks not read correctly')
      process.exit(1)
    }
    
    // Verify webhook structure
    const webhook1 = readWebhooks.find(w => w.id === 'webhook-1')
    if (!webhook1) {
      console.error('❌ Webhook 1 not found')
      process.exit(1)
    }
    
    if (webhook1.url !== 'https://example.com/webhook1') {
      console.error('❌ Webhook URL mismatch')
      console.log('   Expected:', 'https://example.com/webhook1')
      console.log('   Got:', webhook1.url)
      process.exit(1)
    }
    
    if (webhook1.secret !== 'whsec_test123') {
      console.error('❌ Webhook secret mismatch')
      process.exit(1)
    }
    
    if (!webhook1.events.includes('response.created')) {
      console.error('❌ Webhook events mismatch')
      process.exit(1)
    }
    
    console.log('✅ Form read successfully with correct webhook data')
    console.log('   - URL: ✓')
    console.log('   - Secret: ✓')
    console.log('   - Events: ✓')
    console.log('   - Enabled: ✓')
    
    // Test 3: Update webhooks
    console.log('\nTEST 3: Update webhooks')
    console.log('─'.repeat(40))
    
    const updatedWebhooks: Webhook[] = [
      {
        id: 'webhook-1',
        url: 'https://example.com/webhook1-updated',
        enabled: false,
        events: ['response.created', 'response.updated'],
        secret: 'whsec_updated123'
      },
      // Remove webhook-2, add webhook-3
      {
        id: 'webhook-3',
        url: 'https://example.com/webhook3',
        enabled: true,
        events: ['response.created'],
      }
    ]
    
    const updatedSettings: FormSettings = {
      ...(readForm.settings as FormSettings),
      webhooks: updatedWebhooks
    }
    
    const { data: updatedForm, error: updateError } = await supabase
      .from('forms')
      .update({ settings: updatedSettings })
      .eq('id', testFormId)
      .select()
      .single()
    
    if (updateError || !updatedForm) {
      console.error('❌ Failed to update form:', updateError)
      process.exit(1)
    }
    
    const afterUpdateWebhooks = (updatedForm.settings as FormSettings).webhooks
    if (!afterUpdateWebhooks || afterUpdateWebhooks.length !== 2) {
      console.error('❌ Updated webhooks count incorrect')
      console.log('   Expected: 2')
      console.log('   Got:', afterUpdateWebhooks?.length || 0)
      process.exit(1)
    }
    
    // Verify webhook-1 was updated
    const updatedWebhook1 = afterUpdateWebhooks.find(w => w.id === 'webhook-1')
    if (!updatedWebhook1 || updatedWebhook1.url !== 'https://example.com/webhook1-updated') {
      console.error('❌ Webhook 1 not updated correctly')
      process.exit(1)
    }
    
    // Verify webhook-2 was removed
    const removedWebhook2 = afterUpdateWebhooks.find(w => w.id === 'webhook-2')
    if (removedWebhook2) {
      console.error('❌ Webhook 2 should have been removed')
      process.exit(1)
    }
    
    // Verify webhook-3 was added
    const newWebhook3 = afterUpdateWebhooks.find(w => w.id === 'webhook-3')
    if (!newWebhook3) {
      console.error('❌ Webhook 3 was not added')
      process.exit(1)
    }
    
    console.log('✅ Webhooks updated successfully')
    console.log('   - Webhook 1 URL updated: ✓')
    console.log('   - Webhook 2 removed: ✓')
    console.log('   - Webhook 3 added: ✓')
    
    // Test 4: Toggle webhook enabled status
    console.log('\nTEST 4: Toggle webhook enabled status')
    console.log('─'.repeat(40))
    
    const toggledWebhooks = afterUpdateWebhooks.map(w => 
      w.id === 'webhook-3' ? { ...w, enabled: false } : w
    )
    
    const { data: toggledForm, error: toggleError } = await supabase
      .from('forms')
      .update({ 
        settings: { 
          ...(updatedForm.settings as FormSettings),
          webhooks: toggledWebhooks 
        } 
      })
      .eq('id', testFormId)
      .select()
      .single()
    
    if (toggleError || !toggledForm) {
      console.error('❌ Failed to toggle webhook:', toggleError)
      process.exit(1)
    }
    
    const afterToggleWebhooks = (toggledForm.settings as FormSettings).webhooks
    const toggledWebhook3 = afterToggleWebhooks?.find(w => w.id === 'webhook-3')
    
    if (!toggledWebhook3 || toggledWebhook3.enabled !== false) {
      console.error('❌ Webhook toggle failed')
      process.exit(1)
    }
    
    console.log('✅ Webhook toggle successful')
    console.log('   - Webhook 3 enabled: false ✓')
    
    console.log('\n' + '═'.repeat(40))
    console.log('🎉 All webhook flow tests passed!')
    console.log('═'.repeat(40))
    
  } catch (error) {
    console.error('❌ Test error:', error)
    process.exit(1)
  } finally {
    // Cleanup: Delete test form
    if (testFormId) {
      console.log('\n🧹 Cleaning up test data...')
      const { error: deleteError } = await supabase
        .from('forms')
        .delete()
        .eq('id', testFormId)
      
      if (deleteError) {
        console.error('⚠️  Failed to delete test form:', deleteError)
      } else {
        console.log('✅ Test form deleted')
      }
    }
  }
}

runTests()
