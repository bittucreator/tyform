'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface PoweredByBadgeProps {
  theme?: {
    primaryColor?: string
    textColor?: string
  }
}

export function PoweredByBadge({ theme }: PoweredByBadgeProps) {
  const primaryColor = theme?.primaryColor || '#635BFF'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-6 left-6 z-50"
    >
      <Link
        href="https://tyform.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all hover:scale-105 hover:shadow-lg"
        style={{
          borderColor: primaryColor,
          color: primaryColor,
          backgroundColor: `${primaryColor}08`,
        }}
      >
        <span className="opacity-80">Powered by</span>
        <span className="font-bold">tyform</span>
      </Link>
    </motion.div>
  )
}
