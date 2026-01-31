// Environment variable validation
// This file should be imported in the root layout to validate env vars at startup

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

const optionalEnvVars = [
  'NEXT_PUBLIC_APP_URL',
  'UNOSEND_API_KEY',
  'UNOSEND_FROM_EMAIL',
] as const

export function validateEnv() {
  const missing: string[] = []
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\nPlease check your .env.local file.`
    )
  }

  // Warn about optional but recommended vars
  if (typeof window === 'undefined') {
    for (const envVar of optionalEnvVars) {
      if (!process.env[envVar]) {
        console.warn(`⚠️  Optional env var ${envVar} is not set`)
      }
    }
  }
}

export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key]
  if (!value && !fallback) {
    throw new Error(`Environment variable ${key} is required but not set`)
  }
  return value || fallback!
}

export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  email: {
    apiKey: process.env.UNOSEND_API_KEY,
    fromEmail: process.env.UNOSEND_FROM_EMAIL || 'noreply@tyform.com',
  },
}
