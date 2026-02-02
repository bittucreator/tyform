'use client'

import { useState } from 'react'
import { useFormBuilder } from '@/store/form-builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Copy,
  Check,
  ArrowSquareOut,
  FacebookLogo,
  LinkedinLogo,
  QrCode,
  Plus,
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SharePanelProps {
  open: boolean
  onClose: () => void
}

type EmbedTextT = 'inline' | 'popup' | 'slider' | 'popover' | 'side-tab'
type EmbedFormat = 'js' | 'html' | 'react'

export function SharePanel({ open, onClose }: SharePanelProps) {
  const { form } = useFormBuilder()
  const [copied, setCopied] = useState(false)
  const [embedTextT, setEmbedTextT] = useState<EmbedTextT>('inline')
  const [embedFormat, setEmbedFormat] = useState<EmbedFormat>('js')
  const [showQRCode, setShowQRCode] = useState(false)
  const [embedWidth, setEmbedWidth] = useState('100%')
  const [embedHeight, setEmbedHeight] = useState('700')
  const [showConfigureDialog, setShowConfigureDialog] = useState(false)

  // Use short_id if available, otherwise fall back to id
  const formIdentifier = form.short_id || form.id

  const formUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/f/${formIdentifier}`
    : `/f/${formIdentifier}`

  const appDomain = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://app.tyform.com'

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(formUrl)
    setCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    toast.success('Code copied to clipboard')
  }

  const openInNewTab = () => {
    window.open(formUrl, '_blank')
  }

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(formUrl)}`, '_blank')
  }

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(formUrl)}&text=${encodeURIComponent(`Check out my form: ${form.title}`)}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(formUrl)}`, '_blank')
  }

  const getEmbedCode = () => {
    switch (embedTextT) {
      case 'inline':
        return `<div data-tyform-embed data-form='${formIdentifier}' data-width='${embedWidth}' data-height='${embedHeight}'></div>`
      case 'popup':
        return `<button data-tyform-popup data-form='${formIdentifier}'>Open Form</button>`
      case 'slider':
        return `<div data-tyform-slider data-form='${formIdentifier}' data-position='right'></div>`
      case 'popover':
        return `<div data-tyform-popover data-form='${formIdentifier}'></div>`
      case 'side-tab':
        return `<div data-tyform-sidetab data-form='${formIdentifier}' data-label='Feedback'></div>`
      default:
        return `<div data-tyform-embed data-form='${formIdentifier}' data-width='${embedWidth}' data-height='${embedHeight}'></div>`
    }
  }

  const getScriptCode = () => {
    return `<script src="${appDomain}/embed.js"></script>`
  }

  const getReactCode = () => {
    switch (embedTextT) {
      case 'inline':
        return `import { TyformEmbed } from '@tyform/react'

<TyformEmbed 
  formId="${formIdentifier}" 
  width="${embedWidth}" 
  height="${embedHeight}" 
/>`
      case 'popup':
        return `import { TyformPopup } from '@tyform/react'

<TyformPopup formId="${formIdentifier}">
  <button>Open Form</button>
</TyformPopup>`
      default:
        return `import { TyformEmbed } from '@tyform/react'

<TyformEmbed formId="${formIdentifier}" />`
    }
  }

  const getHTMLCode = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <title>${form.title}</title>
</head>
<body>
  ${getEmbedCode()}
  ${getScriptCode()}
</body>
</html>`
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="w-full sm:max-w-2xl p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>Share Form</SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-6 space-y-8">
              {/* Form URL */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={formUrl}
                    readOnly
                    className="flex-1 bg-muted"
                  />
                  <Button onClick={handleCopyLink} className="gap-2">
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    Copy Link
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Make sure your form is published before you share it to the world.
                </p>
              </div>

              {/* Social Share Icons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={openInNewTab}
                >
                  <ArrowSquareOut className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={shareOnFacebook}
                >
                  <FacebookLogo className="h-5 w-5" weight="duotone" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={shareOnTwitter}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={shareOnLinkedIn}
                >
                  <LinkedinLogo className="h-5 w-5" weight="duotone" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setShowQRCode(true)}
                >
                  <QrCode className="h-5 w-5" />
                </Button>
              </div>

              <Separator />

              {/* Embed Options */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Label>Embed in your website as</Label>
                    <Select value={embedTextT} onValueChange={(v) => setEmbedTextT(v as EmbedTextT)}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inline">Inline embed</SelectItem>
                        <SelectItem value="popup">Popup</SelectItem>
                        <SelectItem value="slider">Slider</SelectItem>
                        <SelectItem value="popover">Popover</SelectItem>
                        <SelectItem value="side-tab">Side tab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label>of type</Label>
                    <Select value={embedFormat} onValueChange={(v) => setEmbedFormat(v as EmbedFormat)}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="js">JS embed</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="react">React</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Works with WordPress, Squarespace, Wix, Shopify, Webflow, Carrd, and all other website builders.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setShowConfigureDialog(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Paste the below code snippet in your page where you want to show it:
                </p>

                {/* Embed Code Block */}
                <div 
                  className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm cursor-pointer hover:bg-slate-800 transition-colors"
                  onClick={() => handleCopyCode(embedFormat === 'react' ? getReactCode() : (embedFormat === 'html' ? getHTMLCode() : getEmbedCode()))}
                >
                  <code className="whitespace-pre-wrap break-all">
                    {embedFormat === 'react' ? getReactCode() : (embedFormat === 'html' ? getHTMLCode() : getEmbedCode())}
                  </code>
                </div>

                <p className="text-sm text-muted-foreground">
                  You can configure the width and height according to your need.{' '}
                  <a href="#" className="text-primary hover:underline">
                    Learn more about embed code
                  </a>{' '}
                  here.
                </p>

                {embedFormat === 'js' && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Then include the following script tag below the above tag:
                    </p>

                    <div 
                      className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm cursor-pointer hover:bg-slate-800 transition-colors"
                      onClick={() => handleCopyCode(getScriptCode())}
                    >
                      <code>{getScriptCode()}</code>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              {/* Custom Domain */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Custom Domain</h3>
                  <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                    PRO
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Please buy a PRO plan to add your own custom domain.
                </p>
              </div>

              <Separator />

              {/* Link to Settings */}
              <p className="text-sm text-muted-foreground">
                To change form Title, share image or favicon go to{' '}
                <button 
                  className="text-primary hover:underline"
                  onClick={onClose}
                >
                  Form Settings
                </button>
              </p>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            {/* Simple QR code placeholder - in production you'd use a QR library */}
            <div className="w-48 h-48 bg-white p-4 rounded-lg border flex items-center justify-center">
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <QrCode className="h-24 w-24 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan this QR code to open the form on your mobile device.
            </p>
            <p className="text-xs text-muted-foreground text-center font-mono">
              {formUrl}
            </p>
            <Button onClick={() => toast.info('QR code download coming soon!')}>
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configure Dialog */}
      <Dialog open={showConfigureDialog} onOpenChange={setShowConfigureDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Embed</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Width</Label>
              <Input
                value={embedWidth}
                onChange={(e) => setEmbedWidth(e.target.value)}
                placeholder="100% or 600px"
              />
              <p className="text-xs text-muted-foreground">
                Use percentage (100%) or pixels (600px)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Height</Label>
              <Input
                value={embedHeight}
                onChange={(e) => setEmbedHeight(e.target.value)}
                placeholder="700"
              />
              <p className="text-xs text-muted-foreground">
                Height in pixels
              </p>
            </div>
            <Button 
              className="w-full" 
              onClick={() => {
                setShowConfigureDialog(false)
                toast.success('Embed settings updated')
              }}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
