'use client'

import { motion } from 'framer-motion'
import { Prohibit } from '@phosphor-icons/react'
import { getBackgroundStyle, type FormTheme } from '@/lib/themes'

interface FormClosedProps {
  message: string
  theme?: {
    primaryColor?: string
    backgroundColor?: string
    textColor?: string
    fontFamily?: string
  }
}

export function FormClosed({ message, theme }: FormClosedProps) {
  const themeSettings: FormTheme = {
    primaryColor: theme?.primaryColor || '#635BFF',
    backgroundColor: theme?.backgroundColor || '#ffffff',
    textColor: theme?.textColor || '#1f2937',
    fontFamily: theme?.fontFamily || 'Inter',
    buttonStyle: 'rounded',
    backgroundType: 'solid',
  }

  const themeStyles = {
    ...getBackgroundStyle(themeSettings),
    fontFamily: themeSettings.fontFamily,
    color: themeSettings.textColor,
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={themeStyles}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg"
      >
        <div 
          className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: `${themeSettings.primaryColor}20` }}
        >
          <Prohibit className="h-8 w-8" style={{ color: themeSettings.primaryColor }} />
        </div>
        <h1 
          className="text-2xl font-bold mb-4"
          style={{ color: themeSettings.textColor }}
        >
          Form Closed
        </h1>
        <p 
          className="text-base"
          style={{ color: themeSettings.textColor, opacity: 0.7 }}
        >
          {message}
        </p>
      </motion.div>
    </div>
  )
}
