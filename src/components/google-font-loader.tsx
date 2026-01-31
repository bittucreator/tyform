'use client'

import { useEffect } from 'react'

// List of system fonts that don't need to be loaded from Google
const systemFonts = ['system-ui', 'Georgia', 'Arial', 'Verdana', 'Helvetica']

interface GoogleFontLoaderProps {
  font: string
}

export function GoogleFontLoader({ font }: GoogleFontLoaderProps) {
  useEffect(() => {
    // Skip system fonts
    if (systemFonts.includes(font)) return

    // Check if font is already loaded
    const existingLink = document.querySelector(`link[data-font="${font}"]`)
    if (existingLink) return

    // Create the font link
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font).replace(/%20/g, '+')}:wght@300;400;500;600;700&display=swap`
    link.setAttribute('data-font', font)
    document.head.appendChild(link)

    // Cleanup is optional - we keep loaded fonts for performance
  }, [font])

  return null
}

// Component that preloads common fonts for faster switching
export function PreloadCommonFonts() {
  useEffect(() => {
    const commonFonts = [
      'Inter',
      'Roboto',
      'Open Sans',
      'Poppins',
      'Montserrat',
      'Lato',
    ]

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?${commonFonts.map(f => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700`).join('&')}&display=swap`
    document.head.appendChild(link)
  }, [])

  return null
}
