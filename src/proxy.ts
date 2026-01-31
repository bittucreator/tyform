import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@supabase/supabase-js'

// Main app domains - requests to these go through normal routing
const APP_DOMAINS = [
  'tyform.com',
  'www.tyform.com',
  'localhost:3000',
  'localhost',
]

// Check if the request is from a custom domain
function isCustomDomain(host: string): boolean {
  const cleanHost = host.replace(/:\d+$/, '') // Remove port
  return !APP_DOMAINS.some(domain => 
    cleanHost === domain || cleanHost.endsWith(`.${domain}`)
  )
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') || ''
  
  // If it's a custom domain, handle it specially
  if (isCustomDomain(host)) {
    return handleCustomDomain(request, host)
  }
  
  // Otherwise, normal session handling
  return await updateSession(request)
}

async function handleCustomDomain(request: NextRequest, host: string): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname
  const cleanHost = host.replace(/:\d+$/, '')
  
  // Skip static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }
  
  try {
    // Create admin client for DB queries
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    
    // Find the verified domain
    const { data: domain } = await supabase
      .from('domains')
      .select('id, domain, verified, favicon, meta_title, meta_description, meta_image')
      .eq('domain', cleanHost)
      .eq('verified', true)
      .single()
    
    if (!domain) {
      // Domain not found or not verified - show error page
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Domain Not Configured</title>
            <style>
              body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fafafa; }
              .container { text-align: center; padding: 2rem; }
              h1 { color: #18181b; font-size: 1.5rem; margin-bottom: 0.5rem; }
              p { color: #71717a; font-size: 0.875rem; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Domain Not Configured</h1>
              <p>This domain is not connected to a Tyform account or DNS is still propagating.</p>
            </div>
          </body>
        </html>
        `,
        { status: 404, headers: { 'Content-Type': 'text/html' } }
      )
    }
    
    // Root path - check for default form or show domain landing
    if (pathname === '/' || pathname === '') {
      const { data: defaultUrl } = await supabase
        .from('domain_urls')
        .select('form_id, slug')
        .eq('domain_id', domain.id)
        .eq('is_default', true)
        .single()
      
      if (defaultUrl) {
        // Rewrite to the form page
        const url = request.nextUrl.clone()
        url.pathname = `/f/${defaultUrl.form_id}`
        url.host = process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '').replace('http://', '') || 'tyform.com'
        return NextResponse.rewrite(url)
      }
      
      // No default form - show domain landing or 404
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${domain.meta_title || cleanHost}</title>
            ${domain.favicon ? `<link rel="icon" href="${domain.favicon}">` : ''}
          </head>
          <body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0;">
            <div style="text-align: center;">
              <h1>${domain.meta_title || cleanHost}</h1>
              <p>${domain.meta_description || 'Welcome'}</p>
            </div>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }
    
    // Check for pretty URL slug
    const slug = pathname.replace(/^\//, '').replace(/\/$/, '')
    
    const { data: domainUrl } = await supabase
      .from('domain_urls')
      .select('form_id, meta_title, meta_description, meta_image')
      .eq('domain_id', domain.id)
      .eq('slug', slug)
      .single()
    
    if (domainUrl) {
      // Rewrite to the form page
      const url = request.nextUrl.clone()
      url.pathname = `/f/${domainUrl.form_id}`
      url.host = process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '').replace('http://', '') || 'tyform.com'
      return NextResponse.rewrite(url)
    }
    
    // Slug not found
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Page Not Found</title>
        </head>
        <body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0;">
          <div style="text-align: center;">
            <h1>Page Not Found</h1>
            <p>The form you're looking for doesn't exist at this URL.</p>
          </div>
        </body>
      </html>
      `,
      { status: 404, headers: { 'Content-Type': 'text/html' } }
    )
    
  } catch (error) {
    console.error('Custom domain error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
