'use client'

import { useState } from 'react'
import { Check, Palette, TextAlignLeft, TextAlignCenter, TextAlignRight, Trash, Upload, Spinner } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useFormBuilder } from '@/store/form-builder'
import {
  themePresets,
  fontOptions,
  buttonStyles,
  type FormTheme,
} from '@/lib/themes'

const colorPresets = [
  '#635BFF', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#2563eb', '#1d4ed8', '#171717',
]

export function ThemeEditor() {
  const { form, updateSettings } = useFormBuilder()
  const theme = (form.settings.theme || {}) as FormTheme
  const [isUploading, setIsUploading] = useState(false)

  const updateTheme = (updates: Partial<FormTheme>) => {
    updateSettings({
      theme: {
        ...theme,
        ...updates,
      },
    })
  }

  const applyPreset = (preset: typeof themePresets[0]) => {
    updateSettings({
      theme: preset.theme,
    })
  }

  const updateFormSettings = (updates: Record<string, unknown>) => {
    updateSettings(updates)
  }

  return (
    <aside className="w-72 bg-background border-l border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Palette className="w-4 h-4 text-muted-foreground" />
        <h2 className="font-semibold text-sm text-foreground">Design</h2>
      </div>

      <Tabs defaultValue="customize" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-3 grid grid-cols-3">
          <TabsTrigger value="customize" className="text-xs">Customize</TabsTrigger>
          <TabsTrigger value="themes" className="text-xs">Themes</TabsTrigger>
          <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="themes" className="p-4 pt-2 mt-0">
            <div className="grid grid-cols-2 gap-2">
              {themePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    'relative p-3 rounded-lg border-2 transition-all hover:border-foreground/30',
                    theme.primaryColor === preset.theme.primaryColor &&
                    theme.backgroundColor === preset.theme.backgroundColor
                      ? 'border-foreground'
                      : 'border-border'
                  )}
                  style={{ backgroundColor: preset.preview.bg }}
                >
                  <div className="space-y-2">
                    <div
                      className="w-full h-2 rounded"
                      style={{ backgroundColor: preset.preview.primary }}
                    />
                    <div
                      className="w-3/4 h-1.5 rounded opacity-60"
                      style={{ backgroundColor: preset.preview.text }}
                    />
                    <div
                      className="w-1/2 h-1.5 rounded opacity-40"
                      style={{ backgroundColor: preset.preview.text }}
                    />
                  </div>
                  <p
                    className="text-[10px] font-medium mt-2 text-center"
                    style={{ color: preset.preview.text }}
                  >
                    {preset.name}
                  </p>
                  {theme.primaryColor === preset.theme.primaryColor &&
                    theme.backgroundColor === preset.theme.backgroundColor && (
                      <div className="absolute top-1 right-1">
                        <Check className="w-3 h-3" style={{ color: preset.preview.primary }} />
                      </div>
                    )}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="customize" className="p-4 pt-3 mt-0 space-y-4">
            {/* Colors Section */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Colors
              </h3>
              <div className="space-y-2">
                {/* Primary Color */}
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Primary Color</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-9"
                      >
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <span className="text-xs font-mono">{theme.primaryColor}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="start">
                      <div className="space-y-3">
                        <div className="grid grid-cols-5 gap-1.5">
                          {colorPresets.map((color) => (
                            <button
                              key={color}
                              className={cn(
                                'w-8 h-8 rounded-md border-2 transition-all hover:scale-110',
                                theme.primaryColor === color ? 'border-foreground' : 'border-transparent'
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => updateTheme({ primaryColor: color })}
                            >
                              {theme.primaryColor === color && (
                                <Check className="w-4 h-4 text-white mx-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={theme.primaryColor}
                            onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                            className="w-10 h-8 p-1 cursor-pointer rounded border"
                          />
                          <Input
                            value={theme.primaryColor}
                            onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                            placeholder="#635BFF"
                            className="h-8 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Background Color */}
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Background Color</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-9"
                      >
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: theme.backgroundColor }}
                        />
                        <span className="text-xs font-mono">{theme.backgroundColor}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="start">
                      <div className="space-y-3">
                        <div className="grid grid-cols-5 gap-1.5">
                          {colorPresets.map((color) => (
                            <button
                              key={color}
                              className={cn(
                                'w-8 h-8 rounded-md border-2 transition-all hover:scale-110',
                                theme.backgroundColor === color ? 'border-foreground' : 'border-transparent'
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => updateTheme({ backgroundColor: color })}
                            >
                              {theme.backgroundColor === color && (
                                <Check className="w-4 h-4 text-white mx-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={theme.backgroundColor}
                            onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                            className="w-10 h-8 p-1 cursor-pointer rounded border"
                          />
                          <Input
                            value={theme.backgroundColor}
                            onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                            placeholder="#ffffff"
                            className="h-8 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* Text Color */}
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Text Color</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-9"
                      >
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: theme.textColor }}
                        />
                        <span className="text-xs font-mono">{theme.textColor}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="start">
                      <div className="space-y-3">
                        <div className="grid grid-cols-5 gap-1.5">
                          {colorPresets.map((color) => (
                            <button
                              key={color}
                              className={cn(
                                'w-8 h-8 rounded-md border-2 transition-all hover:scale-110',
                                theme.textColor === color ? 'border-foreground' : 'border-transparent'
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => updateTheme({ textColor: color })}
                            >
                              {theme.textColor === color && (
                                <Check className="w-4 h-4 text-white mx-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={theme.textColor}
                            onChange={(e) => updateTheme({ textColor: e.target.value })}
                            className="w-10 h-8 p-1 cursor-pointer rounded border"
                          />
                          <Input
                            value={theme.textColor}
                            onChange={(e) => updateTheme({ textColor: e.target.value })}
                            placeholder="#1f2937"
                            className="h-8 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Button Color */}
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Button Color</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-9"
                      >
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: theme.buttonColor || theme.primaryColor }}
                        />
                        <span className="text-xs font-mono">{theme.buttonColor || theme.primaryColor}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="start">
                      <div className="space-y-3">
                        <div className="grid grid-cols-5 gap-1.5">
                          {colorPresets.map((color) => (
                            <button
                              key={color}
                              className={cn(
                                'w-8 h-8 rounded-md border-2 transition-all hover:scale-110',
                                (theme.buttonColor || theme.primaryColor) === color ? 'border-foreground' : 'border-transparent'
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => updateTheme({ buttonColor: color })}
                            >
                              {(theme.buttonColor || theme.primaryColor) === color && (
                                <Check className="w-4 h-4 text-white mx-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={theme.buttonColor || theme.primaryColor}
                            onChange={(e) => updateTheme({ buttonColor: e.target.value })}
                            className="w-10 h-8 p-1 cursor-pointer rounded border"
                          />
                          <Input
                            value={theme.buttonColor || theme.primaryColor}
                            onChange={(e) => updateTheme({ buttonColor: e.target.value })}
                            placeholder="#635BFF"
                            className="h-8 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Button Text Color */}
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Button Text Color</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 h-9"
                      >
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: theme.buttonTextColor || '#ffffff' }}
                        />
                        <span className="text-xs font-mono">{theme.buttonTextColor || '#ffffff'}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" align="start">
                      <div className="space-y-3">
                        <div className="grid grid-cols-5 gap-1.5">
                          {colorPresets.map((color) => (
                            <button
                              key={color}
                              className={cn(
                                'w-8 h-8 rounded-md border-2 transition-all hover:scale-110',
                                (theme.buttonTextColor || '#ffffff') === color ? 'border-foreground' : 'border-transparent'
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => updateTheme({ buttonTextColor: color })}
                            >
                              {(theme.buttonTextColor || '#ffffff') === color && (
                                <Check className="w-4 h-4 text-white mx-auto" />
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={theme.buttonTextColor || '#ffffff'}
                            onChange={(e) => updateTheme({ buttonTextColor: e.target.value })}
                            className="w-10 h-8 p-1 cursor-pointer rounded border"
                          />
                          <Input
                            value={theme.buttonTextColor || '#ffffff'}
                            onChange={(e) => updateTheme({ buttonTextColor: e.target.value })}
                            placeholder="#ffffff"
                            className="h-8 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <Separator />

            {/* Typography & Buttons Row */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Typography & Buttons
              </h3>
              <div className="space-y-3">
                {/* Font and Alignment in one row */}
                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Font</Label>
                    <Select
                      value={theme.fontFamily}
                      onValueChange={(value) => updateTheme({ fontFamily: value })}
                    >
                      <SelectTrigger className="h-8 text-xs w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem
                            key={font.value}
                            value={font.value}
                            style={{ fontFamily: font.value }}
                          >
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateTheme({ questionAlignment: 'left' })}
                      className={cn(
                        'p-2 transition-all',
                        (theme.questionAlignment || 'left') === 'left'
                          ? 'bg-foreground/10'
                          : 'hover:bg-muted'
                      )}
                      title="Left"
                    >
                      <TextAlignLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateTheme({ questionAlignment: 'center' })}
                      className={cn(
                        'p-2 transition-all border-x border-border',
                        theme.questionAlignment === 'center'
                          ? 'bg-foreground/10'
                          : 'hover:bg-muted'
                      )}
                      title="Center"
                    >
                      <TextAlignCenter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateTheme({ questionAlignment: 'right' })}
                      className={cn(
                        'p-2 transition-all',
                        theme.questionAlignment === 'right'
                          ? 'bg-foreground/10'
                          : 'hover:bg-muted'
                      )}
                      title="Right"
                    >
                      <TextAlignRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Button Style */}
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Button Style</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {buttonStyles.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => updateTheme({ buttonStyle: style.value as FormTheme['buttonStyle'] })}
                        className={cn(
                          'p-3 rounded-lg transition-all flex flex-col items-center gap-1.5',
                          theme.buttonStyle === style.value
                            ? 'bg-muted'
                            : 'hover:bg-muted/50'
                        )}
                      >
                        <div
                          className={cn(
                            'w-full h-5',
                            style.value === 'square' ? 'rounded-sm' :
                              style.value === 'pill' ? 'rounded-full' : 'rounded-md'
                          )}
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <span className="text-[10px] text-muted-foreground">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Background Image Section */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Background Image
              </h3>
              
              <div className="space-y-3">
                {theme.backgroundImage ? (
                  <>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Cover Image</Label>
                      <div className="relative">
                        <div 
                          className="w-full h-24 rounded-lg bg-cover bg-center border border-border"
                          style={{ backgroundImage: `url(${theme.backgroundImage})` }}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => updateTheme({ backgroundImage: undefined, backgroundType: 'solid', backgroundLayout: undefined })}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Layout</Label>
                      <Select
                        value={theme.backgroundLayout || 'wallpaper'}
                        onValueChange={(value: 'stack' | 'split' | 'wallpaper') => updateTheme({ backgroundLayout: value })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stack">Stack</SelectItem>
                          <SelectItem value="split">Split</SelectItem>
                          <SelectItem value="wallpaper">Wallpaper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <label className={cn(
                    "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg transition-colors",
                    isUploading ? "opacity-50 cursor-wait" : "cursor-pointer hover:border-foreground/30"
                  )}>
                    {isUploading ? (
                      <>
                        <Spinner className="w-6 h-6 text-muted-foreground mb-1 animate-spin" />
                        <p className="text-xs text-muted-foreground">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">Click to upload</p>
                        <p className="text-[10px] text-muted-foreground">PNG, JPG up to 5MB</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      disabled={isUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('Image must be less than 5MB')
                          return
                        }
                        
                        setIsUploading(true)
                        try {
                          const formData = new FormData()
                          formData.append('file', file)
                          formData.append('formId', form.id)
                          
                          const response = await fetch('/api/upload/background', {
                            method: 'POST',
                            body: formData,
                          })
                          
                          if (!response.ok) {
                            const error = await response.json()
                            throw new Error(error.error || 'Upload failed')
                          }
                          
                          const data = await response.json()
                          updateTheme({ 
                            backgroundImage: data.url,
                            backgroundType: 'image'
                          })
                          toast.success('Background image uploaded')
                        } catch (error) {
                          console.error('Upload error:', error)
                          toast.error(error instanceof Error ? error.message : 'Failed to upload image')
                        } finally {
                          setIsUploading(false)
                          e.target.value = ''
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            <Separator />

            {/* Form Options Section */}
            <div className="space-y-2.5">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Form Options
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1">
                  <div>
                    <Label className="text-xs">Progress Bar</Label>
                  </div>
                  <Switch
                    checked={form.settings.showProgressBar !== false}
                    onCheckedChange={(checked) => updateFormSettings({ showProgressBar: checked })}
                    className="scale-90"
                  />
                </div>
                
                <div className="flex items-center justify-between py-1">
                  <div>
                    <Label className="text-xs">Question Numbers</Label>
                  </div>
                  <Switch
                    checked={form.settings.showQuestionNumbers !== false}
                    onCheckedChange={(checked) => updateFormSettings({ showQuestionNumbers: checked })}
                    className="scale-90"
                  />
                </div>
                
                <div className="flex items-center justify-between py-1">
                  <div>
                    <Label className="text-xs">Animations</Label>
                  </div>
                  <Switch
                    checked={form.settings.enableAnimations !== false}
                    onCheckedChange={(checked) => updateFormSettings({ enableAnimations: checked })}
                    className="scale-90"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="p-4 pt-3 mt-0 space-y-4">
            {/* Full Theme Preview */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Theme Preview
              </h3>
              <div
                className="rounded-xl border shadow-sm overflow-hidden"
                style={{
                  backgroundColor: theme.backgroundColor,
                  background: theme.backgroundType === 'image' && theme.backgroundImage
                    ? `url(${theme.backgroundImage})`
                    : theme.backgroundType === 'gradient' 
                      ? theme.backgroundGradient 
                      : theme.backgroundColor,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div 
                  className="p-5 space-y-6"
                  style={{
                    fontFamily: theme.fontFamily,
                    textAlign: theme.questionAlignment || 'left',
                  }}
                >
                  {/* Question 1 */}
                  <div>
                    <p
                      className="text-sm font-medium mb-1.5"
                      style={{ color: theme.textColor }}
                    >
                      {form.settings.showQuestionNumbers !== false && '1. '}How satisfied are you?
                    </p>
                    <p
                      className="text-xs mb-3 opacity-60"
                      style={{ color: theme.textColor }}
                    >
                      Please rate your experience
                    </p>
                    <button
                      className="px-5 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor: theme.primaryColor,
                        borderRadius: theme.buttonStyle === 'pill' ? '9999px' :
                          theme.buttonStyle === 'square' ? '4px' : '8px',
                      }}
                    >
                      Continue
                    </button>
                  </div>

                  {/* Question 2 - Rating */}
                  <div>
                    <p
                      className="text-sm font-medium mb-3"
                      style={{ color: theme.textColor }}
                    >
                      {form.settings.showQuestionNumbers !== false && '2. '}Rate our service
                    </p>
                    <div className={cn(
                      "flex gap-1.5",
                      theme.questionAlignment === 'center' && "justify-center",
                      theme.questionAlignment === 'right' && "justify-end"
                    )}>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          className="w-8 h-8 border-2 text-xs font-medium transition-colors"
                          style={{
                            borderColor: theme.primaryColor,
                            color: num === 4 ? 'white' : theme.primaryColor,
                            backgroundColor: num === 4 ? theme.primaryColor : 'transparent',
                            borderRadius: theme.buttonStyle === 'pill' ? '9999px' :
                              theme.buttonStyle === 'square' ? '4px' : '6px',
                          }}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question 3 - Input */}
                  <div>
                    <p
                      className="text-sm font-medium mb-3"
                      style={{ color: theme.textColor }}
                    >
                      {form.settings.showQuestionNumbers !== false && '3. '}What is your email?
                    </p>
                    <input
                      type="text"
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 text-xs bg-transparent border-b-2 focus:outline-none"
                      style={{
                        borderColor: `${theme.textColor}30`,
                        color: theme.textColor,
                      }}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </aside>
  )
}
