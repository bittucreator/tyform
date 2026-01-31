'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, File, Image, FileText, SpinnerGap } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { FormTheme } from '@/lib/themes'

interface UploadedFile {
  name: string
  size: number
  type: string
  url: string
  path: string
}

interface FileUploadProps {
  formId: string
  questionId: string
  value: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  acceptedFileTypes?: string[]
  maxFileSize?: number // in MB
  maxFiles?: number
  theme: FormTheme
}


function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image
  if (type.includes('pdf') || type.includes('document')) return FileText
  return File
}

export function FileUpload({
  formId,
  questionId,
  value = [],
  onChange,
  acceptedFileTypes = ['*'],
  maxFileSize = 20,
  maxFiles = 5,
  theme,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptString = acceptedFileTypes.join(',')

  const validateFile = useCallback((file: File): string | null => {
    // Check size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File "${file.name}" exceeds ${maxFileSize}MB limit`
    }

    // Check type if not accepting all
    if (!acceptedFileTypes.includes('*')) {
      const fileTextT = file.type
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
      
      const isValid = acceptedFileTypes.some((accepted) => {
        if (accepted.endsWith('/*')) {
          return fileTextT.startsWith(accepted.replace('/*', '/'))
        }
        if (accepted.startsWith('.')) {
          return fileExt === accepted.toLowerCase()
        }
        return fileTextT === accepted
      })

      if (!isValid) {
        return `File type "${file.type || fileExt}" is not allowed`
      }
    }

    return null
  }, [maxFileSize, acceptedFileTypes])

  const uploadFile = useCallback(async (file: File): Promise<UploadedFile | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('formId', formId)
    formData.append('questionId', questionId)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      return data.file
    } catch (err) {
      console.error('Upload error:', err)
      throw err
    }
  }, [formId, questionId])

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError(null)
    const fileArray = Array.from(files)

    // Check max files limit
    if (value.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Validate all files first
    for (const file of fileArray) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setIsUploading(true)

    try {
      const uploadedFiles: UploadedFile[] = []
      
      for (const file of fileArray) {
        const uploaded = await uploadFile(file)
        if (uploaded) {
          uploadedFiles.push(uploaded)
        }
      }

      onChange([...value, ...uploadedFiles])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [value, maxFiles, onChange, validateFile, uploadFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleRemove = async (fileToRemove: UploadedFile) => {
    // Delete from storage
    try {
      await fetch(`/api/upload?path=${encodeURIComponent(fileToRemove.path)}`, {
        method: 'DELETE',
      })
    } catch (err) {
      console.error('Failed to delete file:', err)
    }

    // Remove from list
    onChange(value.filter((f) => f.path !== fileToRemove.path))
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer',
          isDragging && 'scale-[1.02]'
        )}
        style={{
          borderColor: isDragging ? theme.primaryColor : `${theme.textColor}30`,
          backgroundColor: isDragging ? `${theme.primaryColor}10` : 'transparent',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          multiple={maxFiles > 1}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <SpinnerGap className="h-8 w-8 animate-spin" style={{ color: theme.primaryColor }} />
            <p style={{ color: theme.textColor }}>Uploading...</p>
          </div>
        ) : (
          <>
            <Upload 
              className="h-8 w-8 mx-auto mb-3" 
              style={{ color: `${theme.textColor}60` }} 
            />
            <p className="font-medium" style={{ color: theme.textColor }}>
              Drop files here or click to upload
            </p>
            <p className="text-sm mt-1" style={{ color: `${theme.textColor}60` }}>
              Max {maxFileSize}MB per file • {maxFiles} file{maxFiles > 1 ? 's' : ''} max
            </p>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Uploaded files list */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file) => {
            const FileIcon = getFileIcon(file.type)
            return (
              <div
                key={file.path}
                className="flex items-center gap-3 p-3 rounded-lg border"
                style={{ borderColor: `${theme.textColor}20` }}
              >
                <div 
                  className="h-10 w-10 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${theme.primaryColor}15` }}
                >
                  <FileIcon className="h-5 w-5" style={{ color: theme.primaryColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="font-medium truncate text-sm"
                    style={{ color: theme.textColor }}
                  >
                    {file.name}
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: `${theme.textColor}60` }}
                  >
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(file)
                  }}
                  className="p-1 rounded hover:bg-red-100 transition-colors"
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
