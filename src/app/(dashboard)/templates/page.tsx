'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MagnifyingGlass, 
  Plus, 
  Sparkle, 
  ChatCircle, 
  ChartBar, 
  Envelope, 
  Ticket, 
  ShoppingCart, 
  Brain, 
  Briefcase,
  SquaresFour,
  UserCircle,
  Eye,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formTemplates, templateCategories, type FormTemplate, type TemplateIconName } from '@/lib/templates'
import { TemplatePreviewModal } from '@/components/templates/template-preview-modal'
import { createClient } from '@/lib/supabase/client'
import { useWorkspace } from '@/store/workspace'
import { toast } from 'sonner'

// Icon mapping for dynamic rendering
const iconMap: Record<TemplateIconName, React.ComponentType<{ className?: string; weight?: 'regular' | 'bold' | 'light' | 'thin' | 'fill' | 'duotone' }>> = {
  SquaresFour,
  ChatCircle,
  ChartBar,
  Envelope,
  Ticket,
  ShoppingCart,
  Brain,
  Briefcase,
}

const templateIconMap: Record<FormTemplate['icon'], React.ComponentType<{ className?: string; weight?: 'regular' | 'bold' | 'light' | 'thin' | 'fill' | 'duotone' }>> = {
  ChatCircle,
  ChartBar,
  Envelope,
  Ticket,
  ShoppingCart,
  Brain,
  Briefcase,
  UserCircle,
}

// Convert bg-color to border and text color classes
const getOutlineColors = (bgColor: string): string => {
  const colorMap: Record<string, string> = {
    'bg-blue-500': 'border-blue-500 text-blue-500',
    'bg-purple-500': 'border-purple-500 text-purple-500',
    'bg-green-500': 'border-green-500 text-green-500',
    'bg-orange-500': 'border-orange-500 text-orange-500',
    'bg-indigo-500': 'border-indigo-500 text-indigo-500',
    'bg-pink-500': 'border-pink-500 text-pink-500',
    'bg-teal-500': 'border-teal-500 text-teal-500',
    'bg-red-500': 'border-red-500 text-red-500',
    'bg-cyan-500': 'border-cyan-500 text-cyan-500',
    'bg-violet-500': 'border-violet-500 text-violet-500',
    'bg-sky-500': 'border-sky-500 text-sky-500',
    'bg-slate-500': 'border-slate-500 text-slate-500',
    'bg-fuchsia-500': 'border-fuchsia-500 text-fuchsia-500',
    'bg-rose-500': 'border-rose-500 text-rose-500',
    'bg-amber-500': 'border-amber-500 text-amber-500',
    'bg-emerald-500': 'border-emerald-500 text-emerald-500',
    'bg-lime-500': 'border-lime-500 text-lime-500',
    'bg-yellow-600': 'border-yellow-600 text-yellow-600',
    'bg-sky-600': 'border-sky-600 text-sky-600',
    'bg-cyan-600': 'border-cyan-600 text-cyan-600',
    'bg-cyan-700': 'border-cyan-700 text-cyan-700',
    'bg-blue-600': 'border-blue-600 text-blue-600',
    'bg-blue-700': 'border-blue-700 text-blue-700',
    'bg-purple-600': 'border-purple-600 text-purple-600',
    'bg-violet-600': 'border-violet-600 text-violet-600',
    'bg-indigo-600': 'border-indigo-600 text-indigo-600',
    'bg-fuchsia-600': 'border-fuchsia-600 text-fuchsia-600',
    'bg-pink-600': 'border-pink-600 text-pink-600',
    'bg-rose-600': 'border-rose-600 text-rose-600',
    'bg-red-600': 'border-red-600 text-red-600',
    'bg-orange-600': 'border-orange-600 text-orange-600',
    'bg-amber-600': 'border-amber-600 text-amber-600',
    'bg-lime-600': 'border-lime-600 text-lime-600',
    'bg-green-600': 'border-green-600 text-green-600',
    'bg-emerald-600': 'border-emerald-600 text-emerald-600',
    'bg-teal-600': 'border-teal-600 text-teal-600',
    'bg-slate-600': 'border-slate-600 text-slate-600',
    'bg-slate-700': 'border-slate-700 text-slate-700',
  }
  return colorMap[bgColor] || 'border-primary text-primary'
}

export default function TemplatesPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [creatingId, setCreatingId] = useState<string | null>(null)
  const [isCreatingBlank, setIsCreatingBlank] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<FormTemplate | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { activeWorkspace } = useWorkspace()

  const filteredTemplates = formTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleUseTemplate = async (template: FormTemplate) => {
    if (!activeWorkspace) {
      toast.error('Please select a workspace first')
      return
    }

    setCreatingId(template.id)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please log in to create a form')
        return
      }

      const { data, error } = await supabase
        .from('forms')
        .insert({
          user_id: user.id,
          workspace_id: activeWorkspace.id,
          title: template.name,
          description: template.description,
          questions: template.questions,
          is_published: false,
        })
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('No data returned')

      toast.success('Form created from template')
      router.push(`/forms/${(data as { id: string }).id}/edit`)
    } catch (error) {
      console.error('Error creating form:', error)
      toast.error('Failed to create form')
    } finally {
      setCreatingId(null)
    }
  }

  const handleStartFromScratch = async () => {
    if (!activeWorkspace) {
      toast.error('Please select a workspace first')
      return
    }

    setIsCreatingBlank(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please log in to create a form')
        return
      }

      const { data, error } = await supabase
        .from('forms')
        .insert({
          user_id: user.id,
          workspace_id: activeWorkspace.id,
          title: 'Untitled Form',
          description: '',
          questions: [
            {
              id: 'welcome',
              type: 'welcome',
              title: 'Welcome',
              description: 'This is the start of your form',
              required: false,
              properties: { buttonText: 'Start' }
            }
          ],
          is_published: false,
        })
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('No data returned')

      toast.success('Form created')
      router.push(`/forms/${(data as { id: string }).id}/edit`)
    } catch (error) {
      console.error('Error creating form:', error)
      toast.error('Failed to create form')
    } finally {
      setIsCreatingBlank(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Start with a pre-built template and customize it to your needs
          </p>
        </div>
        <Button onClick={handleStartFromScratch} size="sm" className="gap-2" disabled={isCreatingBlank}>
          {isCreatingBlank ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Start from scratch
        </Button>
      </div>

      {/* Search and Categories */}
      <div className="border border-border/50 rounded-xl bg-card overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 p-4 border-b border-border/50">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <Input 
              placeholder="Search templates..." 
              className="pl-10 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {templateCategories.map(category => {
              const IconComponent = iconMap[category.icon]
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{category.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Sparkle className="w-7 h-7 text-muted-foreground/40" weight="duotone" />
            </div>
            <p className="font-medium text-sm mb-1">No templates found</p>
            <p className="text-muted-foreground/70 text-xs">
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredTemplates.map((template) => {
              const TemplateIcon = templateIconMap[template.icon]
              return (
                <div
                  key={template.id}
                  className="group border border-border/50 rounded-xl p-4 hover:border-border hover:shadow-sm transition-all bg-background"
                >
                  {/* Template Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0 ${getOutlineColors(template.color)}`}>
                      <TemplateIcon className="w-5 h-5" weight="duotone" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm truncate">{template.name}</h3>
                      <p className="text-xs text-muted-foreground/70 line-clamp-2 mt-0.5">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  {/* Template Stats */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50">
                      {template.questions.length} questions
                    </span>
                    <span className="capitalize">{template.category}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-xs gap-1.5"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-8 text-xs gap-1.5"
                      onClick={() => handleUseTemplate(template)}
                      disabled={creatingId === template.id}
                    >
                      {creatingId === template.id ? (
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      Use Template
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <TemplatePreviewModal 
        template={previewTemplate}
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
        onUseTemplate={(template) => {
          setPreviewTemplate(null)
          handleUseTemplate(template)
        }}
        isCreating={!!creatingId}
      />
    </div>
  )
}
