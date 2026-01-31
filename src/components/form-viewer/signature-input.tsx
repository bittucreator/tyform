'use client'

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eraser } from '@phosphor-icons/react'
import type { FormTheme } from '@/lib/themes'

interface SignatureInputProps {
  value: string
  onChange: (value: string) => void
  theme: FormTheme
}

export function SignatureInput({ value, onChange, theme }: SignatureInputProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(!!value)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Set drawing style
    ctx.strokeStyle = theme.textColor
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Load existing signature if any
    if (value) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
      }
      img.src = value
    }
  }, [theme.textColor, value])

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setHasSignature(true)
    
    const { x, y } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    
    setIsDrawing(false)
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Save signature as data URL
    const dataUrl = canvas.toDataURL('image/png')
    onChange(dataUrl)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    onChange('')
  }

  return (
    <div className="space-y-3">
      <div 
        className="relative border-2 border-dashed rounded-lg overflow-hidden"
        style={{ borderColor: `${theme.textColor}30` }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-40 cursor-crosshair touch-none"
          style={{ backgroundColor: `${theme.backgroundColor}` }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ color: theme.textColor, opacity: 0.4 }}
          >
            <p className="text-sm">Draw your signature here</p>
          </div>
        )}
      </div>
      {hasSignature && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearSignature}
          className="gap-2"
          style={{ 
            borderColor: `${theme.textColor}30`,
            color: theme.textColor,
          }}
        >
          <Eraser className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
