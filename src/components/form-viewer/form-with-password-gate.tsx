'use client'

import { useState, useCallback } from 'react'
import { FormViewer } from '@/components/form-viewer'
import { FormPasswordGate } from '@/components/form-viewer/form-password-gate'
import type { Form } from '@/types/database'

interface FormWithPasswordGateProps {
  form: Form
}

export function FormWithPasswordGate({ form }: FormWithPasswordGateProps) {
  const [isVerified, setIsVerified] = useState(false)

  const handleVerify = useCallback(async (password: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/forms/${form.id}/verify-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()
      
      if (data.valid) {
        setIsVerified(true)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to verify password:', error)
      return false
    }
  }, [form.id])

  if (!isVerified) {
    return (
      <FormPasswordGate 
        formTitle={form.title} 
        onVerify={handleVerify} 
      />
    )
  }

  return <FormViewer form={form} />
}
