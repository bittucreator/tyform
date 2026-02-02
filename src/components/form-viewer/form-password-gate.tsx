'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface FormPasswordGateProps {
  formTitle?: string
  onVerify: (password: string) => Promise<boolean>
}

export function FormPasswordGate({ formTitle, onVerify }: FormPasswordGateProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Please enter a password')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const isValid = await onVerify(password)
      if (!isValid) {
        setError('Incorrect password. Please try again.')
        setPassword('')
      }
    } catch {
      setError('Failed to verify password. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
          {/* Lock Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Password Protected
            </h1>
            {formTitle && (
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {formTitle}
              </p>
            )}
            <p className="text-slate-500 dark:text-slate-400">
              This form is password protected. Enter the password to continue.
            </p>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(null)
                }}
                placeholder="Enter password"
                className="pr-10 h-12 text-lg"
                autoFocus
                disabled={isVerifying}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 dark:text-red-400 text-center">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-lg font-medium"
              disabled={isVerifying || !password.trim()}
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have the password? Contact the form owner.
        </p>
      </div>
    </div>
  )
}
