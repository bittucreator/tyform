'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function FormError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error details for debugging
    console.error('Form Viewer Error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center">
            <span className="text-red-600 font-bold text-3xl">!</span>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
          <p className="text-muted-foreground text-sm">
            {error.message || 'An unexpected error occurred'}
          </p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-4 p-4 bg-gray-100 rounded text-xs text-left overflow-auto max-h-40">
              {error.stack}
            </pre>
          )}
        </div>
        <Button onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  )
}
