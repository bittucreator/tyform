import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import dns from 'dns'
import { promisify } from 'util'

const resolveCname = promisify(dns.resolveCname)
const resolveTxt = promisify(dns.resolveTxt)

const EXPECTED_CNAME = 'cname.tyform.com'
const TXT_RECORD_NAME = '_tyform'

interface VerificationResult {
  success: boolean
  cnameValid: boolean
  txtValid: boolean
  cnameRecords: string[]
  txtRecords: string[]
  errors: string[]
}

async function checkCnameRecord(domain: string): Promise<{ valid: boolean; records: string[]; error?: string }> {
  try {
    const records = await resolveCname(domain)
    const valid = records.some(record => 
      record.toLowerCase() === EXPECTED_CNAME || 
      record.toLowerCase().endsWith('.' + EXPECTED_CNAME)
    )
    return { valid, records }
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'ENODATA' || err.code === 'ENOTFOUND') {
      return { valid: false, records: [], error: 'No CNAME record found' }
    }
    return { valid: false, records: [], error: `DNS lookup failed: ${err.code || 'unknown'}` }
  }
}

async function checkTxtRecord(domain: string, expectedToken: string): Promise<{ valid: boolean; records: string[]; error?: string }> {
  try {
    // Check for TXT record at _tyform.domain
    const txtDomain = `${TXT_RECORD_NAME}.${domain}`
    const records = await resolveTxt(txtDomain)
    // TXT records come as arrays of strings, flatten them
    const flatRecords = records.map(r => r.join(''))
    const valid = flatRecords.some(record => record === expectedToken)
    return { valid, records: flatRecords }
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'ENODATA' || err.code === 'ENOTFOUND') {
      return { valid: false, records: [], error: 'No TXT record found' }
    }
    return { valid: false, records: [], error: `DNS lookup failed: ${err.code || 'unknown'}` }
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { domainId } = await request.json()
    
    if (!domainId) {
      return NextResponse.json({ error: 'Domain ID is required' }, { status: 400 })
    }

    // Fetch the domain
    const { data: domainData, error: fetchError } = await supabase
      .from('domains')
      .select('*')
      .eq('id', domainId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !domainData) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    // Type assertion for the domain
    const domain = domainData as {
      id: string
      domain: string
      verification_token: string
      verified: boolean
      user_id: string
      created_at: string
    }

    if (domain.verified) {
      return NextResponse.json({ 
        success: true, 
        message: 'Domain is already verified',
        verified: true 
      })
    }

    const result: VerificationResult = {
      success: false,
      cnameValid: false,
      txtValid: false,
      cnameRecords: [],
      txtRecords: [],
      errors: []
    }

    // Check CNAME record
    const cnameResult = await checkCnameRecord(domain.domain)
    result.cnameValid = cnameResult.valid
    result.cnameRecords = cnameResult.records
    if (cnameResult.error) {
      result.errors.push(`CNAME: ${cnameResult.error}`)
    }

    // Check TXT record
    const txtResult = await checkTxtRecord(domain.domain, domain.verification_token)
    result.txtValid = txtResult.valid
    result.txtRecords = txtResult.records
    if (txtResult.error) {
      result.errors.push(`TXT: ${txtResult.error}`)
    }

    // Domain is verified if TXT record is valid (CNAME can be optional for some setups)
    // But for full verification, we require both
    result.success = result.txtValid

    if (result.success) {
      // Update the domain as verified
      const { error: updateError } = await supabase
        .from('domains')
        .update({ verified: true })
        .eq('id', domainId)

      if (updateError) {
        return NextResponse.json({ 
          error: 'Failed to update domain status',
          details: result 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Domain verified successfully!',
        verified: true,
        details: result
      })
    }

    // Return detailed info about what's missing
    return NextResponse.json({
      success: false,
      message: 'DNS records not found or invalid',
      verified: false,
      details: result,
      instructions: {
        cname: {
          status: result.cnameValid ? 'valid' : 'missing',
          expected: EXPECTED_CNAME,
          found: result.cnameRecords
        },
        txt: {
          status: result.txtValid ? 'valid' : 'missing',
          recordName: `${TXT_RECORD_NAME}.${domain.domain}`,
          expected: domain.verification_token,
          found: result.txtRecords
        }
      }
    })

  } catch (error) {
    console.error('DNS verification error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
