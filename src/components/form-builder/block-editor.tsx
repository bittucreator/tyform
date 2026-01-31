'use client'

import { useState } from 'react'
import { useFormBuilder } from '@/store/form-builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, 
  Trash, 
  DotsSixVertical, 
  TextB,
  TextItalic,
  Link,
  Video,
  At,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  Image as ImageIcon,
  Upload,
  Spinner,
  X,
} from '@phosphor-icons/react'
import Image from 'next/image'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'
import { LogicEditor } from './logic-editor'

export function BlockEditor() {
  const { form, selectedQuestionId, updateQuestion } = useFormBuilder()
  const [showLogicEditor, setShowLogicEditor] = useState(false)
  const [isUploadingProductImage, setIsUploadingProductImage] = useState(false)
  const question = form.questions.find((q) => q.id === selectedQuestionId)

  if (!question) {
    return (
      <aside className="w-72 bg-background border-l border-border flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground text-center">
            Select a block to edit its properties
          </p>
        </div>
      </aside>
    )
  }

  const handleAddOption = () => {
    const options = question.properties.options || []
    updateQuestion(question.id, {
      properties: {
        ...question.properties,
        options: [
          ...options,
          { id: nanoid(), label: `Option ${options.length + 1}`, value: `option_${options.length + 1}` },
        ],
      },
    })
  }

  const handleUpdateOption = (optionId: string, label: string) => {
    const options = question.properties.options || []
    updateQuestion(question.id, {
      properties: {
        ...question.properties,
        options: options.map((opt) =>
          opt.id === optionId ? { ...opt, label, value: label.toLowerCase().replace(/\s+/g, '_') } : opt
        ),
      },
    })
  }

  const handleDeleteOption = (optionId: string) => {
    const options = question.properties.options || []
    updateQuestion(question.id, {
      properties: {
        ...question.properties,
        options: options.filter((opt) => opt.id !== optionId),
      },
    })
  }

  const hasOptions = ['multiple_choice', 'checkbox', 'dropdown'].includes(question.type)
  const hasRatingSettings = ['rating', 'scale'].includes(question.type)
  const isScreen = ['welcome', 'thank_you'].includes(question.type)

  return (
    <aside className="w-72 bg-background border-l border-border flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Title
            </Label>
            <Input
              value={question.title}
              onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
              placeholder="Your question here..."
              className="text-sm"
            />
          </div>

          {/* Description with formatting toolbar */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </Label>
            <div className="border border-border rounded-md overflow-hidden">
              {/* Formatting toolbar */}
              <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-muted/30">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <TextB className="h-3.5 w-3.5" weight="duotone" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <TextItalic className="h-3.5 w-3.5" weight="duotone" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Link className="h-3.5 w-3.5" weight="duotone" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Video className="h-3.5 w-3.5" weight="duotone" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <At className="h-3.5 w-3.5" weight="duotone" />
                </Button>
              </div>
              <Textarea
                value={question.description || ''}
                onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
                placeholder="Add a description..."
                rows={2}
                className="border-0 focus-visible:ring-0 resize-none text-sm"
              />
            </div>
          </div>

          {/* Embed URL (for screens) */}
          {isScreen && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Embed
              </Label>
              <Input
                placeholder="E.g https://loom.com/share/a8014a4f0e31431"
                className="text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                YouTube, Loom, Vimeo, PDF etc.
              </p>
            </div>
          )}

          {/* Alignment */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Alignment
            </Label>
            <p className="text-[11px] text-muted-foreground mb-2">
              Align the current block from here or set alignment for all blocks in the design panel.
            </p>
            <div className="flex gap-1">
              <Button 
                variant={question.properties.alignment === 'left' || !question.properties.alignment ? 'default' : 'outline'}
                size="sm" 
                className="flex-1 h-9"
                onClick={() => updateQuestion(question.id, {
                  properties: { ...question.properties, alignment: 'left' }
                })}
              >
                <TextAlignLeft className="h-4 w-4" weight="duotone" />
              </Button>
              <Button 
                variant={question.properties.alignment === 'center' ? 'default' : 'outline'}
                size="sm" 
                className="flex-1 h-9"
                onClick={() => updateQuestion(question.id, {
                  properties: { ...question.properties, alignment: 'center' }
                })}
              >
                <TextAlignCenter className="h-4 w-4" weight="duotone" />
              </Button>
              <Button 
                variant={question.properties.alignment === 'right' ? 'default' : 'outline'}
                size="sm" 
                className="flex-1 h-9"
                onClick={() => updateQuestion(question.id, {
                  properties: { ...question.properties, alignment: 'right' }
                })}
              >
                <TextAlignRight className="h-4 w-4" weight="duotone" />
              </Button>
            </div>
          </div>

          {/* Button text for welcome/thank you */}
          {question.type === 'welcome' && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Button Text
              </Label>
              <Input
                value={question.properties.buttonText || "Let's start"}
                onChange={(e) =>
                  updateQuestion(question.id, {
                    properties: { ...question.properties, buttonText: e.target.value },
                  })
                }
                className="text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                For submit button, set it from settings.
              </p>
            </div>
          )}

          {/* Cover Image - Landscape banner at top */}
          {isScreen && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cover Image
              </Label>
              {question.properties.coverImage ? (
                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border">
                  <Image
                    src={question.properties.coverImage}
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, coverImage: '' },
                      })
                    }
                    className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-lg transition-colors ${
                  isUploadingProductImage ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-foreground/30'
                }`}>
                  <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Upload cover image</span>
                  <span className="text-[10px] text-muted-foreground">Landscape recommended</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 2 * 1024 * 1024) {
                        toast.error('Image must be less than 2MB')
                        return
                      }
                      try {
                        const formData = new FormData()
                        formData.append('file', file)
                        formData.append('formId', form.id)
                        const response = await fetch('/api/upload/product', {
                          method: 'POST',
                          body: formData,
                        })
                        if (!response.ok) {
                          const error = await response.json()
                          throw new Error(error.error || 'Upload failed')
                        }
                        const data = await response.json()
                        updateQuestion(question.id, {
                          properties: { ...question.properties, coverImage: data.url },
                        })
                        toast.success('Cover image uploaded')
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : 'Failed to upload')
                      }
                      e.target.value = ''
                    }}
                  />
                </label>
              )}
              <p className="text-[10px] text-muted-foreground">
                Banner image at the top of the screen
              </p>
            </div>
          )}

          {/* Screen Image - Centered image/icon */}
          {isScreen && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Screen Image
              </Label>
              {question.properties.screenImage ? (
                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border flex items-center justify-center bg-muted/20">
                  <Image
                    src={question.properties.screenImage}
                    alt="Screen"
                    fill
                    className="object-contain"
                  />
                  <button
                    onClick={() =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, screenImage: '' },
                      })
                    }
                    className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-lg transition-colors cursor-pointer hover:border-foreground/30">
                  <ImageIcon className="w-5 h-5 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Upload image</span>
                  <span className="text-[10px] text-muted-foreground">Logo, icon, or illustration</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 2 * 1024 * 1024) {
                        toast.error('Image must be less than 2MB')
                        return
                      }
                      try {
                        const formData = new FormData()
                        formData.append('file', file)
                        formData.append('formId', form.id)
                        const response = await fetch('/api/upload/product', {
                          method: 'POST',
                          body: formData,
                        })
                        if (!response.ok) {
                          const error = await response.json()
                          throw new Error(error.error || 'Upload failed')
                        }
                        const data = await response.json()
                        updateQuestion(question.id, {
                          properties: { ...question.properties, screenImage: data.url },
                        })
                        toast.success('Image uploaded')
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : 'Failed to upload')
                      }
                      e.target.value = ''
                    }}
                  />
                </label>
              )}
              <p className="text-[10px] text-muted-foreground">
                Centered image above the title
              </p>
            </div>
          )}

          <Separator />

          {/* Options for choice questions */}
          {hasOptions && (
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Options
              </Label>
              <div className="space-y-2">
                {question.properties.options?.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <DotsSixVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                    <Input
                      value={option.label}
                      onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                      className="flex-1 text-sm h-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleDeleteOption(option.id)}
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddOption} 
                className="w-full text-sm"
              >
                <Plus className="h-3.5 w-3.5 mr-2" />
                Add option
              </Button>

              {question.type === 'checkbox' && (
                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="allowMultiple" className="text-sm">
                    Multiple selections
                  </Label>
                  <Switch
                    id="allowMultiple"
                    checked={question.properties.allowMultiple ?? true}
                    onCheckedChange={(checked) =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, allowMultiple: checked },
                      })
                    }
                  />
                </div>
              )}
              
              <Separator />
            </div>
          )}

          {/* Rating settings */}
          {hasRatingSettings && (
            <>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {question.type === 'rating' ? 'Number of Stars' : 'Maximum Value'}
                  </Label>
                  <Input
                    type="number"
                    min={2}
                    max={10}
                    value={question.properties.max || 5}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, max: parseInt(e.target.value) },
                      })
                    }
                    className="text-sm"
                  />
                </div>
                {question.type === 'scale' && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Minimum Value
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={1}
                      value={question.properties.min || 1}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          properties: { ...question.properties, min: parseInt(e.target.value) },
                        })
                      }
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Placeholder for text inputs */}
          {['short_text', 'long_text', 'email', 'number', 'phone', 'url'].includes(question.type) && (
            <>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Placeholder
                </Label>
                <Input
                  value={question.properties.placeholder || ''}
                  onChange={(e) =>
                    updateQuestion(question.id, {
                      properties: { ...question.properties, placeholder: e.target.value },
                    })
                  }
                  placeholder="TextT your placeholder..."
                  className="text-sm"
                />
              </div>
              <Separator />
            </>
          )}

          {/* File upload settings */}
          {question.type === 'file_upload' && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Maximum Files
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={question.properties.maxFiles || 5}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, maxFiles: parseInt(e.target.value) },
                      })
                    }
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Max File Size (MB)
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={question.properties.maxFileSize || 10}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, maxFileSize: parseInt(e.target.value) },
                      })
                    }
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Accepted File TextTs
                  </Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { value: '*', label: 'All files' },
                      { value: 'image/*', label: 'Images' },
                      { value: 'application/pdf', label: 'PDF' },
                      { value: '.doc,.docx', label: 'Word' },
                    ].map((type) => {
                      const currentTextTs = question.properties.acceptedFileTypes || ['*']
                      const isSelected = currentTextTs.includes(type.value) || 
                        (type.value === '*' && currentTextTs.includes('*'))
                      return (
                        <Button
                          key={type.value}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => {
                            let newTextTs: string[]
                            if (type.value === '*') {
                              newTextTs = ['*']
                            } else if (isSelected) {
                              newTextTs = currentTextTs.filter((t) => t !== type.value)
                              if (newTextTs.length === 0) newTextTs = ['*']
                            } else {
                              newTextTs = currentTextTs.filter((t) => t !== '*')
                              newTextTs.push(type.value)
                            }
                            updateQuestion(question.id, {
                              properties: { ...question.properties, acceptedFileTypes: newTextTs },
                            })
                          }}
                        >
                          {type.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Slider settings */}
          {question.type === 'slider' && (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Min Value
                    </Label>
                    <Input
                      type="number"
                      value={question.properties.min || 0}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          properties: { ...question.properties, min: parseInt(e.target.value) },
                        })
                      }
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Max Value
                    </Label>
                    <Input
                      type="number"
                      value={question.properties.max || 100}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          properties: { ...question.properties, max: parseInt(e.target.value) },
                        })
                      }
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Step
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={question.properties.step || 1}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, step: parseInt(e.target.value) },
                      })
                    }
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Min Label
                    </Label>
                    <Input
                      value={question.properties.minLabel || ''}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          properties: { ...question.properties, minLabel: e.target.value },
                        })
                      }
                      placeholder="e.g., Low"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Max Label
                    </Label>
                    <Input
                      value={question.properties.maxLabel || ''}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          properties: { ...question.properties, maxLabel: e.target.value },
                        })
                      }
                      placeholder="e.g., High"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* NPS settings */}
          {question.type === 'nps' && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Left Label (0)
                  </Label>
                  <Input
                    value={question.properties.leftLabel || ''}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, leftLabel: e.target.value },
                      })
                    }
                    placeholder="Not likely at all"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Right Label (10)
                  </Label>
                  <Input
                    value={question.properties.rightLabel || ''}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, rightLabel: e.target.value },
                      })
                    }
                    placeholder="Extremely likely"
                    className="text-sm"
                  />
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Matrix settings */}
          {question.type === 'matrix' && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Rows (Questions)
                  </Label>
                  <div className="space-y-2">
                    {(question.properties.rows || []).map((row) => (
                      <div key={row.id} className="flex items-center gap-2">
                        <Input
                          value={row.label}
                          onChange={(e) => {
                            const rows = question.properties.rows || []
                            updateQuestion(question.id, {
                              properties: {
                                ...question.properties,
                                rows: rows.map((r) =>
                                  r.id === row.id ? { ...r, label: e.target.value } : r
                                ),
                              },
                            })
                          }}
                          className="flex-1 text-sm h-8"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => {
                            const rows = question.properties.rows || []
                            updateQuestion(question.id, {
                              properties: {
                                ...question.properties,
                                rows: rows.filter((r) => r.id !== row.id),
                              },
                            })
                          }}
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const rows = question.properties.rows || []
                      updateQuestion(question.id, {
                        properties: {
                          ...question.properties,
                          rows: [...rows, { id: nanoid(), label: `Row ${rows.length + 1}` }],
                        },
                      })
                    }}
                    className="w-full text-sm"
                  >
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Add row
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Columns (Options)
                  </Label>
                  <div className="space-y-2">
                    {(question.properties.columns || []).map((col) => (
                      <div key={col.id} className="flex items-center gap-2">
                        <Input
                          value={col.label}
                          onChange={(e) => {
                            const columns = question.properties.columns || []
                            updateQuestion(question.id, {
                              properties: {
                                ...question.properties,
                                columns: columns.map((c) =>
                                  c.id === col.id ? { ...c, label: e.target.value } : c
                                ),
                              },
                            })
                          }}
                          className="flex-1 text-sm h-8"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => {
                            const columns = question.properties.columns || []
                            updateQuestion(question.id, {
                              properties: {
                                ...question.properties,
                                columns: columns.filter((c) => c.id !== col.id),
                              },
                            })
                          }}
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const columns = question.properties.columns || []
                      updateQuestion(question.id, {
                        properties: {
                          ...question.properties,
                          columns: [...columns, { id: nanoid(), label: `Column ${columns.length + 1}` }],
                        },
                      })
                    }}
                    className="w-full text-sm"
                  >
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Add column
                  </Button>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Ranking settings - uses options like multiple choice */}
          {question.type === 'ranking' && (
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Items to Rank
              </Label>
              <div className="space-y-2">
                {question.properties.options?.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <DotsSixVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                    <Input
                      value={option.label}
                      onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                      className="flex-1 text-sm h-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleDeleteOption(option.id)}
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddOption} 
                className="w-full text-sm"
              >
                <Plus className="h-3.5 w-3.5 mr-2" />
                Add item
              </Button>
              <Separator />
            </div>
          )}

          {/* Payment settings */}
          {question.type === 'payment' && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Payment Provider
                  </Label>
                  <Select
                    value={question.properties.paymentProvider || 'stripe'}
                    onValueChange={(value: 'stripe' | 'dodo' | 'polar') =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, paymentProvider: value },
                      })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="dodo">Dodo Payments</SelectItem>
                      <SelectItem value="polar">Polar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Product Image
                  </Label>
                  {question.properties.productImage ? (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border">
                      <Image
                        src={question.properties.productImage}
                        alt="Product"
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={() =>
                          updateQuestion(question.id, {
                            properties: { ...question.properties, productImage: '' },
                          })
                        }
                        className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg transition-colors ${
                      isUploadingProductImage ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:border-foreground/30'
                    }`}>
                      {isUploadingProductImage ? (
                        <>
                          <Spinner className="w-6 h-6 text-muted-foreground mb-1 animate-spin" />
                          <p className="text-xs text-muted-foreground">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground">Click to upload</p>
                          <p className="text-[10px] text-muted-foreground">PNG, JPG up to 2MB</p>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        disabled={isUploadingProductImage}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return

                          if (file.size > 2 * 1024 * 1024) {
                            toast.error('Image must be less than 2MB')
                            return
                          }

                          setIsUploadingProductImage(true)
                          try {
                            const formData = new FormData()
                            formData.append('file', file)
                            formData.append('formId', form.id)

                            const response = await fetch('/api/upload/product', {
                              method: 'POST',
                              body: formData,
                            })

                            if (!response.ok) {
                              const error = await response.json()
                              throw new Error(error.error || 'Upload failed')
                            }

                            const data = await response.json()
                            updateQuestion(question.id, {
                              properties: { ...question.properties, productImage: data.url },
                            })
                            toast.success('Product image uploaded')
                          } catch (error) {
                            console.error('Upload error:', error)
                            toast.error(error instanceof Error ? error.message : 'Failed to upload image')
                          } finally {
                            setIsUploadingProductImage(false)
                            e.target.value = ''
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Product Name
                  </Label>
                  <Input
                    value={question.properties.productName || ''}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, productName: e.target.value },
                      })
                    }
                    placeholder="e.g., Premium Plan"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Product Description
                  </Label>
                  <Input
                    value={question.properties.productDescription || ''}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, productDescription: e.target.value },
                      })
                    }
                    placeholder="e.g., Monthly subscription"
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Currency
                    </Label>
                    <Input
                      value={question.properties.currency || '$'}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          properties: { ...question.properties, currency: e.target.value },
                        })
                      }
                      placeholder="$"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Amount
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={question.properties.amount || 0}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          properties: { ...question.properties, amount: parseFloat(e.target.value) },
                        })
                      }
                      className="text-sm"
                    />
                  </div>
                </div>
                
                {/* Stripe settings */}
                {(question.properties.paymentProvider === 'stripe' || !question.properties.paymentProvider) && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Stripe Payment Link <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={question.properties.stripePaymentLink || ''}
                        onChange={(e) =>
                          updateQuestion(question.id, {
                            properties: { ...question.properties, stripePaymentLink: e.target.value },
                          })
                        }
                        placeholder="https://buy.stripe.com/xxxxx"
                        className="text-sm"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Create a Payment Link in your Stripe Dashboard → Payment Links. Copy the full URL (e.g., https://buy.stripe.com/xxxxx).
                    </p>
                  </div>
                )}

                {/* Dodo Payments settings */}
                {question.properties.paymentProvider === 'dodo' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Dodo Product ID
                      </Label>
                      <Input
                        value={question.properties.dodoProductId || ''}
                        onChange={(e) =>
                          updateQuestion(question.id, {
                            properties: { ...question.properties, dodoProductId: e.target.value },
                          })
                        }
                        placeholder="pdt_xxxxx"
                        className="text-sm"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Redirects to: checkout.dodopayments.com/buy/{'<product_id>'}
                      </p>
                    </div>
                    <div className="relative flex items-center">
                      <div className="grow border-t border-muted"></div>
                      <span className="mx-3 text-[10px] text-muted-foreground">or</span>
                      <div className="grow border-t border-muted"></div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Dodo Payment Link
                      </Label>
                      <Input
                        value={question.properties.dodoPaymentLink || ''}
                        onChange={(e) =>
                          updateQuestion(question.id, {
                            properties: { ...question.properties, dodoPaymentLink: e.target.value },
                          })
                        }
                        placeholder="https://checkout.dodopayments.com/buy/xxxxx"
                        className="text-sm"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Enter a Product ID (pdt_xxx) or a full Payment Link from Dodo Payments dashboard.
                    </p>
                  </div>
                )}

                {/* Polar settings */}
                {question.properties.paymentProvider === 'polar' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Polar Checkout Link <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={question.properties.polarPaymentLink || ''}
                        onChange={(e) =>
                          updateQuestion(question.id, {
                            properties: { ...question.properties, polarPaymentLink: e.target.value },
                          })
                        }
                        placeholder="https://polar.sh/username/checkout/..."
                        className="text-sm"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Create a checkout link from your Polar dashboard or product page. Copy the full checkout URL.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Button Text
                  </Label>
                  <Input
                    value={question.properties.paymentButtonText || ''}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, paymentButtonText: e.target.value },
                      })
                    }
                    placeholder="Pay Now"
                    className="text-sm"
                  />
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Address settings */}
          {question.type === 'address' && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autocomplete" className="text-sm font-medium">
                      Enable Autocomplete
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      Use Google Places API
                    </p>
                  </div>
                  <Switch
                    id="autocomplete"
                    checked={question.properties.enableAutocomplete ?? false}
                    onCheckedChange={(checked) =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, enableAutocomplete: checked },
                      })
                    }
                  />
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Calculator settings */}
          {question.type === 'calculator' && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Formula
                  </Label>
                  <Textarea
                    value={question.properties.formula || ''}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        properties: { ...question.properties, formula: e.target.value },
                      })
                    }
                    placeholder="e.g., {{q1}} * {{q2}} + 10"
                    rows={3}
                    className="text-sm font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Use {'{{question_id}}'} to reference other fields. Supports +, -, *, /, ()
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Prefix
                    </Label>
                    <Input
                      value={question.properties.prefix || ''}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          properties: { ...question.properties, prefix: e.target.value },
                        })
                      }
                      placeholder="$"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Decimals
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={6}
                      value={question.properties.decimalPlaces ?? 2}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          properties: { ...question.properties, decimalPlaces: parseInt(e.target.value) },
                        })
                      }
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Suffix
                    </Label>
                    <Input
                      value={question.properties.suffix || ''}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          properties: { ...question.properties, suffix: e.target.value },
                        })
                      }
                      placeholder="%"
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-xs font-medium mb-2">Available Fields:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {form.questions
                      .filter(q => ['number', 'rating', 'scale', 'slider', 'nps'].includes(q.type) && q.id !== question.id)
                      .map(q => (
                        <div key={q.id} className="text-[11px] text-muted-foreground font-mono">
                          {'{{'}{q.id}{'}}'}  — {q.title || 'Untitled'}
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Logic/Branching */}
          {/* Required toggle */}
          {!isScreen && (
            <div className="flex items-center justify-between py-1">
              <div>
                <Label htmlFor="required" className="text-sm font-medium">
                  Required
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Must answer this question
                </p>
              </div>
              <Switch
                id="required"
                checked={question.required}
                onCheckedChange={(checked) =>
                  updateQuestion(question.id, { required: checked })
                }
              />
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Logic Editor Sheet */}
      <LogicEditor 
        question={question}
        open={showLogicEditor}
        onClose={() => setShowLogicEditor(false)}
      />
    </aside>
  )
}
