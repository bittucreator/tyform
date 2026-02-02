'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Link as LinkIcon, PencilSimple, DotsThree } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Form } from '@/types/database'

interface FormTabsLayoutProps {
  form: Form
  children: React.ReactNode
}

const tabs = [
  { id: 'responses', label: 'Submissions', path: '/responses' },
  { id: 'share', label: 'Share', path: '/share' },
  { id: 'integrations', label: 'Integrations', path: '/integrations' },
  { id: 'insights', label: 'Insights', path: '/insights' },
  { id: 'settings', label: 'Settings', path: '/settings' },
]

export function FormTabsLayout({ form, children }: FormTabsLayoutProps) {
  const pathname = usePathname()
  const baseUrl = `/forms/${form.id}`

  const copyLink = async () => {
    const formUrl = `${window.location.origin}/f/${form.short_id || form.id}`
    await navigator.clipboard.writeText(formUrl)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-xl font-semibold hover:opacity-80">
                {form.title}
              </Link>
              <button className="text-muted-foreground hover:text-foreground">
                <DotsThree className="h-5 w-5" weight="bold" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9"
                onClick={copyLink}
                title="Copy form link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Link href={`${baseUrl}/edit`}>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <PencilSimple className="h-4 w-4 mr-1.5" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 mt-6 -mb-px">
            {tabs.map((tab) => {
              const href = `${baseUrl}${tab.path}`
              const isActive = pathname === href || 
                (tab.id === 'responses' && pathname === baseUrl)
              
              return (
                <Link
                  key={tab.id}
                  href={href}
                  className={cn(
                    "text-sm font-medium pb-3 border-b-2 transition-colors",
                    isActive 
                      ? "text-foreground border-foreground" 
                      : "text-muted-foreground hover:text-foreground border-transparent"
                  )}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  )
}
