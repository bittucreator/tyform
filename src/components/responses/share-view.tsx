'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Copy, 
  Check,
  Star,
  Code
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Form } from '@/types/database'

interface ShareViewProps {
  form: Form
  formUrl: string
}

type EmbedType = 'standard' | 'popup' | 'fullpage'

export function ShareView({ form, formUrl }: ShareViewProps) {
  const [copied, setCopied] = useState(false)
  const [selectedEmbed, setSelectedEmbed] = useState<EmbedType>('standard')
  const [embedCopied, setEmbedCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getEmbedCode = (type: EmbedType) => {
    switch (type) {
      case 'standard':
        return `<iframe 
  src="${formUrl}" 
  width="100%" 
  height="500" 
  frameborder="0" 
  marginheight="0" 
  marginwidth="0"
  title="${form.title}"
></iframe>`
      case 'popup':
        return `<script src="https://tyform.com/embed.js"></script>
<button onclick="Tyform.openPopup('${form.id}')">
  Open Form
</button>`
      case 'fullpage':
        return `<iframe 
  src="${formUrl}" 
  width="100%" 
  height="100%" 
  style="position:fixed;top:0;left:0;border:none;"
  title="${form.title}"
></iframe>`
    }
  }

  const handleCopyEmbed = async () => {
    await navigator.clipboard.writeText(getEmbedCode(selectedEmbed))
    setEmbedCopied(true)
    setTimeout(() => setEmbedCopied(false), 2000)
  }

  return (
    <div className="space-y-12">
      {/* Share Link & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Share Link */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Share Link</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your form is now published and ready to be shared with the world! Copy this link to share your form on social media, messaging apps or via email.
          </p>
          
          <div className="flex gap-2 mb-3">
            <Input
              value={formUrl}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={handleCopy} className="shrink-0">
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
          
          <a 
            href="/domains" 
            className="text-sm text-primary hover:underline"
          >
            Use custom domain
          </a>
        </div>

        {/* Link Preview */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Link Preview</h2>
          <p className="text-muted-foreground text-sm mb-6">
            When you share a link, it will embed with a preview similar to the one below on social media, messaging apps, and search engines.{' '}
            <span className="text-primary cursor-pointer hover:underline">Customize</span>{' '}
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Pro</span>
          </p>

          <div className="border border-border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4" weight="fill" />
              <span className="text-sm font-medium">Tyform</span>
            </div>
            <a 
              href={formUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium block mb-1"
            >
              {form.title}
            </a>
            <p className="text-sm text-muted-foreground mb-4">
              Made with Tyform, the simplest way to create forms.
            </p>
            <div className="flex items-center justify-center py-6 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="text-lg font-medium">✦</span>
                <span className="text-sm font-medium">Tyform</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embed Form */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Embed Form</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Use these options to embed your form into your own website.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Standard */}
          <button
            onClick={() => setSelectedEmbed('standard')}
            className={cn(
              "border-2 rounded-lg p-4 transition-colors text-left",
              selectedEmbed === 'standard' 
                ? "border-primary" 
                : "border-border hover:border-border/80"
            )}
          >
            <div className="aspect-4/3 bg-muted/50 rounded-lg mb-3 p-4 flex flex-col">
              <div className="flex gap-1 mb-3">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-2 bg-muted-foreground/20 rounded w-3/4" />
                <div className="h-2 bg-muted-foreground/20 rounded w-1/2" />
                <div className="flex-1 border-2 border-dashed border-primary/40 rounded-lg mt-2 flex items-center justify-center">
                  <div className="w-8 h-8 bg-primary/20 rounded" />
                </div>
              </div>
            </div>
            <div className="text-sm font-medium text-center">Standard</div>
          </button>

          {/* Popup */}
          <button
            onClick={() => setSelectedEmbed('popup')}
            className={cn(
              "border-2 rounded-lg p-4 transition-colors text-left",
              selectedEmbed === 'popup' 
                ? "border-primary" 
                : "border-border hover:border-border/80"
            )}
          >
            <div className="aspect-4/3 bg-muted/50 rounded-lg mb-3 p-4 flex flex-col">
              <div className="flex gap-1 mb-3">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="flex-1 flex flex-col gap-2 relative">
                <div className="h-2 bg-muted-foreground/20 rounded w-3/4" />
                <div className="h-2 bg-muted-foreground/20 rounded w-1/2" />
                <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary/20 rounded-lg border-2 border-primary/40 flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary/40 rounded" />
                </div>
              </div>
            </div>
            <div className="text-sm font-medium text-center">Popup</div>
          </button>

          {/* Full page */}
          <button
            onClick={() => setSelectedEmbed('fullpage')}
            className={cn(
              "border-2 rounded-lg p-4 transition-colors text-left",
              selectedEmbed === 'fullpage' 
                ? "border-primary" 
                : "border-border hover:border-border/80"
            )}
          >
            <div className="aspect-4/3 bg-primary/20 rounded-lg mb-3 p-4 flex flex-col">
              <div className="flex gap-1 mb-3">
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <div className="w-2 h-2 rounded-full bg-primary/40" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-12 h-12 bg-primary/30 rounded" />
              </div>
            </div>
            <div className="text-sm font-medium text-center">Full page</div>
          </button>
        </div>

        {/* Embed code */}
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Code className="h-4 w-4" />
              Embed code
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyEmbed}
            >
              {embedCopied ? (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1.5" />
                  Copy code
                </>
              )}
            </Button>
          </div>
          <pre className="text-xs font-mono bg-background rounded p-3 overflow-x-auto">
            {getEmbedCode(selectedEmbed)}
          </pre>
        </div>
      </div>
    </div>
  )
}
