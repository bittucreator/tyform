/**
 * Vercel Domains API Integration
 * 
 * Automatically provisions custom domains on Vercel when users verify them.
 * Requires VERCEL_TOKEN and VERCEL_PROJECT_ID environment variables.
 * 
 * Get your token from: https://vercel.com/account/tokens
 * Get project ID from: Vercel Dashboard → Project → Settings → General
 */

const VERCEL_API_URL = 'https://api.vercel.com'

interface VercelDomain {
  name: string
  apexName: string
  verified: boolean
  verification?: Array<{
    type: string
    domain: string
    value: string
    reason: string
  }>
  gitBranch?: string | null
  redirect?: string | null
  redirectStatusCode?: number | null
}

interface VercelDomainConfig {
  configuredBy?: 'A' | 'AAAA' | 'CNAME' | 'http' | null
  acceptedChallenges?: ('dns-01' | 'http-01')[]
  misconfigured: boolean
}

interface AddDomainResponse {
  success: boolean
  domain?: VercelDomain
  error?: string
  verificationRecords?: Array<{
    type: string
    name: string
    value: string
  }>
}

interface RemoveDomainResponse {
  success: boolean
  error?: string
}

interface DomainStatusResponse {
  configured: boolean
  verified: boolean
  misconfigured: boolean
  sslReady: boolean
  error?: string
}

function getVercelHeaders(): HeadersInit {
  const token = process.env.VERCEL_TOKEN
  if (!token) {
    throw new Error('VERCEL_TOKEN environment variable is not set')
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

function getProjectId(): string {
  const projectId = process.env.VERCEL_PROJECT_ID
  if (!projectId) {
    throw new Error('VERCEL_PROJECT_ID environment variable is not set')
  }
  return projectId
}

function getTeamId(): string | undefined {
  return process.env.VERCEL_TEAM_ID
}

function buildUrl(path: string): string {
  const teamId = getTeamId()
  const separator = path.includes('?') ? '&' : '?'
  return `${VERCEL_API_URL}${path}${teamId ? `${separator}teamId=${teamId}` : ''}`
}

/**
 * Add a custom domain to the Vercel project
 * Also adds the www. variant that redirects to the main domain
 */
export async function addDomainToVercel(domain: string): Promise<AddDomainResponse> {
  try {
    const projectId = getProjectId()
    const url = buildUrl(`/v10/projects/${projectId}/domains`)
    
    // Add the main domain
    const response = await fetch(url, {
      method: 'POST',
      headers: getVercelHeaders(),
      body: JSON.stringify({ name: domain }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      // Handle specific error cases
      if (data.error?.code === 'domain_already_in_use') {
        return {
          success: false,
          error: 'This domain is already in use by another Vercel project',
        }
      }
      if (data.error?.code === 'forbidden') {
        return {
          success: false,
          error: 'Domain verification required. Please verify domain ownership.',
          verificationRecords: data.error?.verification || [],
        }
      }
      return {
        success: false,
        error: data.error?.message || 'Failed to add domain to Vercel',
      }
    }
    
    // Also add www. variant if this is an apex domain (no subdomain)
    const isApexDomain = domain.split('.').length === 2
    if (isApexDomain) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: getVercelHeaders(),
          body: JSON.stringify({ 
            name: `www.${domain}`,
            redirect: domain, // Redirect www to apex
            redirectStatusCode: 308,
          }),
        })
      } catch {
        // Ignore www errors - main domain was added successfully
        console.log(`Note: Could not add www.${domain} variant`)
      }
    }
    
    return {
      success: true,
      domain: data,
      verificationRecords: data.verification?.map((v: { type: string; domain: string; value: string }) => ({
        type: v.type,
        name: v.domain,
        value: v.value,
      })),
    }
  } catch (error) {
    console.error('Error adding domain to Vercel:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Remove a custom domain from the Vercel project
 * Also removes the www. variant if it exists
 */
export async function removeDomainFromVercel(domain: string): Promise<RemoveDomainResponse> {
  try {
    const projectId = getProjectId()
    const url = buildUrl(`/v9/projects/${projectId}/domains/${domain}`)
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getVercelHeaders(),
    })
    
    if (!response.ok) {
      const data = await response.json()
      return {
        success: false,
        error: data.error?.message || 'Failed to remove domain from Vercel',
      }
    }
    
    // Also try to remove www. variant
    const isApexDomain = domain.split('.').length === 2
    if (isApexDomain) {
      try {
        const wwwUrl = buildUrl(`/v9/projects/${projectId}/domains/www.${domain}`)
        await fetch(wwwUrl, {
          method: 'DELETE',
          headers: getVercelHeaders(),
        })
      } catch {
        // Ignore - www variant might not exist
      }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error removing domain from Vercel:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Get domain configuration and SSL status from Vercel
 */
export async function getDomainStatus(domain: string): Promise<DomainStatusResponse> {
  try {
    const projectId = getProjectId()
    
    // Get domain info
    const domainUrl = buildUrl(`/v9/projects/${projectId}/domains/${domain}`)
    const domainResponse = await fetch(domainUrl, {
      headers: getVercelHeaders(),
    })
    
    if (!domainResponse.ok) {
      if (domainResponse.status === 404) {
        return {
          configured: false,
          verified: false,
          misconfigured: false,
          sslReady: false,
          error: 'Domain not found in Vercel project',
        }
      }
      return {
        configured: false,
        verified: false,
        misconfigured: false,
        sslReady: false,
        error: 'Failed to get domain status',
      }
    }
    
    const domainData: VercelDomain = await domainResponse.json()
    
    // Get domain config (DNS and SSL status)
    const configUrl = buildUrl(`/v6/domains/${domain}/config`)
    const configResponse = await fetch(configUrl, {
      headers: getVercelHeaders(),
    })
    
    let configData: VercelDomainConfig = { misconfigured: true }
    if (configResponse.ok) {
      configData = await configResponse.json()
    }
    
    return {
      configured: !!configData.configuredBy,
      verified: domainData.verified,
      misconfigured: configData.misconfigured,
      sslReady: !!configData.configuredBy && !configData.misconfigured,
    }
  } catch (error) {
    console.error('Error getting domain status:', error)
    return {
      configured: false,
      verified: false,
      misconfigured: false,
      sslReady: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Verify domain configuration on Vercel (triggers re-verification)
 */
export async function verifyDomainOnVercel(domain: string): Promise<{ success: boolean; verified: boolean; error?: string }> {
  try {
    const projectId = getProjectId()
    const url = buildUrl(`/v9/projects/${projectId}/domains/${domain}/verify`)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getVercelHeaders(),
    })
    
    if (!response.ok) {
      const data = await response.json()
      return {
        success: false,
        verified: false,
        error: data.error?.message || 'Failed to verify domain',
      }
    }
    
    const data = await response.json()
    return {
      success: true,
      verified: data.verified,
    }
  } catch (error) {
    console.error('Error verifying domain on Vercel:', error)
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Check if Vercel integration is configured
 */
export function isVercelConfigured(): boolean {
  return !!(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID)
}
