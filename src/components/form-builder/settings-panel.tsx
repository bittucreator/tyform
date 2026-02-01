'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useFormBuilder } from '@/store/form-builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Plus,
  Trash,
  Info,
  FloppyDisk,
  Globe,
  Copy,
  CheckCircle,
  ArrowSquareOut,
  Spinner,
  Image as ImageIcon,
  Gear,
  Link as LinkIcon,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Domain, DomainUrl } from '@/types/database'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

type SettingsTab = 'general' | 'email' | 'access' | 'hidden' | 'link' | 'domain' | 'language'

const settingsTabs: { id: SettingsTab; label: string; sublabel?: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'email', label: 'Email Settings' },
  { id: 'access', label: 'Access' },
  { id: 'hidden', label: 'Hidden Fields', sublabel: '& variables' },
  { id: 'link', label: 'Link Settings' },
  { id: 'domain', label: 'Custom Domain' },
  { id: 'language', label: 'Language' },
]

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
]

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { form, updateSettings } = useFormBuilder()
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [emailTab, setEmailTab] = useState<'me' | 'responder'>('me')
  const [isUploadingSocialPreview, setIsUploadingSocialPreview] = useState(false)
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false)
  
  // Domain state
  const [verifiedDomains, setVerifiedDomains] = useState<Domain[]>([])
  const [formDomainUrls, setFormDomainUrls] = useState<DomainUrl[]>([])
  const [isLoadingDomains, setIsLoadingDomains] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState('')
  const [domainSlug, setDomainSlug] = useState('')
  const [isSavingDomainUrl, setIsSavingDomainUrl] = useState(false)
  const supabase = createClient()

  const loadDomainData = useCallback(async () => {
    setIsLoadingDomains(true)
    try {
      // Load verified domains
      const { data: domains } = await supabase
        .from('workspace_domains')
        .select('*')
        .eq('status', 'verified')
        .order('domain')
      
      setVerifiedDomains((domains as Domain[]) || [])

      // Load domain URLs for this form
      const { data: urls } = await supabase
        .from('domain_urls')
        .select('*')
        .eq('form_id', form.id)
      
      setFormDomainUrls((urls as DomainUrl[]) || [])
    } catch (error) {
      console.error('Failed to load domain data:', error)
    } finally {
      setIsLoadingDomains(false)
    }
  }, [form.id, supabase])

  // Load verified domains and form's domain URLs
  useEffect(() => {
    if (open && activeTab === 'domain') {
      loadDomainData()
    }
  }, [open, activeTab, loadDomainData])

  const handleSaveDomainUrl = async () => {
    if (!selectedDomain || !domainSlug) {
      toast.error('Please select a domain and enter a slug')
      return
    }

    const slugPattern = /^[a-z0-9-]+$/
    if (!slugPattern.test(domainSlug)) {
      toast.error('Slug can only contain lowercase letters, numbers, and hyphens')
      return
    }

    setIsSavingDomainUrl(true)
    try {
      const { data: user } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('domain_urls')
        .insert({
          domain_id: selectedDomain,
          form_id: form.id,
          slug: domainSlug,
          is_default: false,
          user_id: user.user?.id
        })

      if (error) {
        if (error.code === '23505') {
          toast.error('This slug is already in use on this domain')
        } else {
          throw error
        }
        return
      }

      toast.success('Domain URL created')
      setSelectedDomain('')
      setDomainSlug('')
      await loadDomainData()
    } catch (error) {
      console.error(error)
      toast.error('Failed to save domain URL')
    } finally {
      setIsSavingDomainUrl(false)
    }
  }

  const handleDeleteDomainUrl = async (urlId: string) => {
    const { error } = await supabase
      .from('domain_urls')
      .delete()
      .eq('id', urlId)

    if (error) {
      toast.error('Failed to delete URL')
    } else {
      setFormDomainUrls(formDomainUrls.filter(u => u.id !== urlId))
      toast.success('URL deleted')
    }
  }

  const getDomainName = (domainId: string) => {
    const domain = verifiedDomains.find(d => d.id === domainId)
    return domain?.domain || 'Unknown'
  }

  // Local state for settings
  const settings = form.settings
  
  // Hidden fields state
  const [hiddenFields, setHiddenFields] = useState<string[]>(
    settings.hiddenFields || []
  )
  const [newHiddenField, setNewHiddenField] = useState('')
  
  // Variables state
  const [variables, setVariables] = useState<{ name: string; type: string }[]>(
    settings.variables || []
  )
  const [newVarName, setNewVarName] = useState('')
  const [newVarTextT, setNewVarTextT] = useState('')

  const handleUpdateSetting = (key: string, value: unknown) => {
    updateSettings({
      ...settings,
      [key]: value,
    })
  }

  const handleSaveHiddenFields = () => {
    updateSettings({
      ...settings,
      hiddenFields,
      variables,
    })
    toast.success('Hidden fields saved')
  }

  const addHiddenField = () => {
    if (newHiddenField && !hiddenFields.includes(newHiddenField)) {
      setHiddenFields([...hiddenFields, newHiddenField])
      setNewHiddenField('')
    }
  }

  const removeHiddenField = (field: string) => {
    setHiddenFields(hiddenFields.filter((f) => f !== field))
  }

  const addVariable = () => {
    if (newVarName && newVarTextT) {
      setVariables([...variables, { name: newVarName, type: newVarTextT }])
      setNewVarName('')
      setNewVarTextT('')
    }
  }

  const removeVariable = (name: string) => {
    setVariables(variables.filter((v) => v.name !== name))
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-1">
            <h2 className="text-lg font-semibold mb-6">Display</h2>
            
            {/* Progress Bar */}
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium">Progress Bar</p>
              </div>
              <Switch
                checked={settings.showProgressBar}
                onCheckedChange={(checked) => handleUpdateSetting('showProgressBar', checked)}
              />
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium">Navigation Arrows</p>
                <p className="text-sm text-muted-foreground mt-1">
                  These are the &quot;Up&quot; and &quot;Down&quot; arrows that are shown in bottom right corner
                  of the form (except mobiles). This helps users in navigating the form.
                </p>
              </div>
              <Switch
                checked={settings.showNavigationArrows ?? true}
                onCheckedChange={(checked) => handleUpdateSetting('showNavigationArrows', checked)}
              />
            </div>

            {/* Refill Link */}
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Refill Link</p>
                  <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                    PRO
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  When enabled, all form submissions will have a refill link generated by default,
                  allowing respondents to easily resubmit the form with their previous answers pre-filled.
                </p>
              </div>
              <Switch
                checked={settings.enableRefillLink ?? false}
                onCheckedChange={(checked) => handleUpdateSetting('enableRefillLink', checked)}
              />
            </div>

            {/* reCaptcha */}
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium">Enable reCaptcha</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please disable it if you are using custom domain otherwise your form won&apos;t work.
                  We will soon allow you to add your own reCaptcha key for custom domains.
                </p>
              </div>
              <Switch
                checked={settings.enableRecaptcha ?? false}
                onCheckedChange={(checked) => handleUpdateSetting('enableRecaptcha', checked)}
              />
            </div>

            {/* Show Powered By */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <p className="font-medium">Show &quot;Powered By Tyform&quot;</p>
                <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                  PRO
                </Badge>
              </div>
              <Switch
                checked={settings.showPoweredBy ?? true}
                onCheckedChange={(checked) => handleUpdateSetting('showPoweredBy', checked)}
              />
            </div>
          </div>
        )

      case 'email':
        return (
          <div className="space-y-6">
            {/* Email Tab Toggle */}
            <Tabs value={emailTab} onValueChange={(v) => setEmailTab(v as 'me' | 'responder')}>
              <TabsList className="w-full">
                <TabsTrigger value="me" className="flex-1">Email to Me</TabsTrigger>
                <TabsTrigger value="responder" className="flex-1">Email to Responder</TabsTrigger>
              </TabsList>
            </Tabs>

            {emailTab === 'me' ? (
              <div className="space-y-6">
                {/* Receive Email Notifications */}
                <div className="flex items-center justify-between py-4 border-b">
                  <div>
                    <p className="font-medium">Receive Email Notifications</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive email notifications when someone submits your form.
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications?.enabled ?? false}
                    onCheckedChange={(checked) =>
                      handleUpdateSetting('emailNotifications', {
                        ...settings.emailNotifications,
                        enabled: checked,
                      })
                    }
                  />
                </div>

                {/* To Email */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>To</Label>
                    <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                      PRO
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="your@email.com"
                      value={settings.emailNotifications?.to || ''}
                      onChange={(e) =>
                        handleUpdateSetting('emailNotifications', {
                          ...settings.emailNotifications,
                          to: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Receiver&apos;s email address. You can add multiple recipients in PRO plan.
                  </p>
                </div>

                {/* Reply To */}
                <div className="space-y-2">
                  <Label>Reply To</Label>
                  <Select
                    value={settings.emailNotifications?.replyTo || ''}
                    onValueChange={(value) =>
                      handleUpdateSetting('emailNotifications', {
                        ...settings.emailNotifications,
                        replyTo: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Select an email block from the form --" />
                    </SelectTrigger>
                    <SelectContent>
                      {form.questions
                        .filter((q) => q.type === 'email')
                        .map((q) => (
                          <SelectItem key={q.id} value={q.id}>
                            {q.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose an email block from your form and the answer of that field will be set
                    as Reply To of the notification email.
                  </p>
                </div>

                {/* Email Subject */}
                <div className="space-y-2">
                  <Label>Email Subject</Label>
                  <p className="text-xs text-muted-foreground">
                    Customize the subject of the notification email. TextT @ to include questions and variables.
                  </p>
                  <Input
                    placeholder={`🎉 You received a new submission in ${form.title}`}
                    value={settings.emailNotifications?.subject || ''}
                    onChange={(e) =>
                      handleUpdateSetting('emailNotifications', {
                        ...settings.emailNotifications,
                        subject: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Email Body */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Email Body</Label>
                    <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                      PRO
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Customize the body of the notification email using the editor below.
                  </p>
                  <Textarea
                    rows={6}
                    placeholder="Hi,

Your form @Form Name just received a new submission.

Here are the details:
@All Answers

Thanks,
Tyform"
                    value={settings.emailNotifications?.body || ''}
                    onChange={(e) =>
                      handleUpdateSetting('emailNotifications', {
                        ...settings.emailNotifications,
                        body: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* PaperPlaneTilt Confirmation to Responder */}
                <div className="flex items-center justify-between py-4 border-b">
                  <div>
                    <p className="font-medium">PaperPlaneTilt Confirmation Email</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PaperPlaneTilt an automatic confirmation email to the respondent after submission.
                    </p>
                  </div>
                  <Switch
                    checked={settings.responderEmail?.enabled ?? false}
                    onCheckedChange={(checked) =>
                      handleUpdateSetting('responderEmail', {
                        ...settings.responderEmail,
                        enabled: checked,
                      })
                    }
                  />
                </div>

                {/* Responder Email Field */}
                <div className="space-y-2">
                  <Label>Respondent Email Field</Label>
                  <Select
                    value={settings.responderEmail?.emailField || ''}
                    onValueChange={(value) =>
                      handleUpdateSetting('responderEmail', {
                        ...settings.responderEmail,
                        emailField: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Select an email block from the form --" />
                    </SelectTrigger>
                    <SelectContent>
                      {form.questions
                        .filter((q) => q.type === 'email')
                        .map((q) => (
                          <SelectItem key={q.id} value={q.id}>
                            {q.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Confirmation Subject */}
                <div className="space-y-2">
                  <Label>Confirmation Subject</Label>
                  <Input
                    placeholder="Thank you for your submission!"
                    value={settings.responderEmail?.subject || ''}
                    onChange={(e) =>
                      handleUpdateSetting('responderEmail', {
                        ...settings.responderEmail,
                        subject: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Confirmation Body */}
                <div className="space-y-2">
                  <Label>Confirmation Message</Label>
                  <Textarea
                    rows={6}
                    placeholder="Thank you for submitting the form. We have received your response and will get back to you soon."
                    value={settings.responderEmail?.body || ''}
                    onChange={(e) =>
                      handleUpdateSetting('responderEmail', {
                        ...settings.responderEmail,
                        body: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )

      case 'access':
        return (
          <div className="space-y-1">
            <h2 className="text-lg font-semibold mb-6">Access & Scheduling</h2>

            {/* Close Form */}
            <div className="flex items-center justify-between py-4 border-b">
              <p className="font-medium">Close Form</p>
              <Switch
                checked={settings.closeForm ?? false}
                onCheckedChange={(checked) => handleUpdateSetting('closeForm', checked)}
              />
            </div>

            {/* Close Form By Date */}
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium">Close Form By Date</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically close the form after a specific date.
                </p>
              </div>
              <Switch
                checked={settings.closeByDate?.enabled ?? false}
                onCheckedChange={(checked) =>
                  handleUpdateSetting('closeByDate', {
                    ...settings.closeByDate,
                    enabled: checked,
                  })
                }
              />
            </div>

            {settings.closeByDate?.enabled && (
              <div className="py-4 border-b">
                <Input
                  type="datetime-local"
                  value={settings.closeByDate?.date || ''}
                  onChange={(e) =>
                    handleUpdateSetting('closeByDate', {
                      ...settings.closeByDate,
                      date: e.target.value,
                    })
                  }
                />
              </div>
            )}

            {/* Close Form By Submissions */}
            <div className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="font-medium">Close Form By Submissions</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically close the form after reaching a specific number of submissions.
                </p>
              </div>
              <Switch
                checked={settings.closeBySubmissions?.enabled ?? false}
                onCheckedChange={(checked) =>
                  handleUpdateSetting('closeBySubmissions', {
                    ...settings.closeBySubmissions,
                    enabled: checked,
                  })
                }
              />
            </div>

            {settings.closeBySubmissions?.enabled && (
              <div className="py-4 border-b">
                <Input
                  type="number"
                  min={1}
                  placeholder="Maximum submissions"
                  value={settings.closeBySubmissions?.max || ''}
                  onChange={(e) =>
                    handleUpdateSetting('closeBySubmissions', {
                      ...settings.closeBySubmissions,
                      max: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            )}

            {/* Auto-refresh on Inactivity */}
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">Auto-refresh on Inactivity</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically refresh the form after a period of inactivity.
                </p>
              </div>
              <Switch
                checked={settings.autoRefresh ?? false}
                onCheckedChange={(checked) => handleUpdateSetting('autoRefresh', checked)}
              />
            </div>
          </div>
        )

      case 'hidden':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Hidden Fields</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Use hidden fields to fill data using URL parameters. You can also use this for UTM parameters.
                </p>
              </div>
              <Button size="sm" onClick={handleSaveHiddenFields}>
                <FloppyDisk className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter field name (e.g., utm_source)"
                  value={newHiddenField}
                  onChange={(e) => setNewHiddenField(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addHiddenField()}
                />
                <Button onClick={addHiddenField}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Select from the dropdown or enter your own.
              </p>

              {hiddenFields.length > 0 && (
                <div className="space-y-2 mt-4">
                  {hiddenFields.map((field) => (
                    <div
                      key={field}
                      className="flex items-center justify-between p-3 rounded-md border"
                    >
                      <code className="text-sm">{field}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeHiddenField(field)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Variables</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Use variables to do calculations in the form.
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="New variable name"
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value)}
                  className="flex-1"
                />
                <Select value={newVarTextT} onValueChange={setNewVarTextT}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="-- Select type --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addVariable} disabled={!newVarName || !newVarTextT}>
                  Add
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Default variables <strong>score</strong> and <strong>price</strong> are already available.
                So you need not to add them.
              </p>

              {variables.length > 0 && (
                <div className="space-y-2 mt-4">
                  {variables.map((variable) => (
                    <div
                      key={variable.name}
                      className="flex items-center justify-between p-3 rounded-md border"
                    >
                      <div className="flex items-center gap-3">
                        <code className="text-sm">{variable.name}</code>
                        <Badge variant="secondary">{variable.type}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeVariable(variable.name)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 'link':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Link Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Setup how your forms will appear in social media like Facebook, X etc.
                </p>
              </div>
              <Button size="sm">
                <FloppyDisk className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={settings.seo?.title || form.title}
                onChange={(e) =>
                  handleUpdateSetting('seo', {
                    ...settings.seo,
                    title: e.target.value,
                  })
                }
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">Max characters 60.</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={settings.seo?.description || `Fill out my ${form.title}`}
                onChange={(e) =>
                  handleUpdateSetting('seo', {
                    ...settings.seo,
                    description: e.target.value,
                  })
                }
                maxLength={110}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Max characters 110.</p>
            </div>

            {/* Social Preview Image */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Social Preview Image</Label>
                <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                  PRO
                </Badge>
              </div>
              {settings.seo?.image ? (
                <div className="space-y-2">
                  <div className="relative w-full h-32 rounded-lg border overflow-hidden">
                    <Image 
                      src={settings.seo.image} 
                      alt="Social preview" 
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => handleUpdateSetting('seo', { ...settings.seo, image: undefined })}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <label className={cn(
                  "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg transition-colors",
                  isUploadingSocialPreview ? "opacity-50 cursor-wait" : "cursor-pointer hover:border-foreground/30"
                )}>
                  {isUploadingSocialPreview ? (
                    <>
                      <Spinner className="w-6 h-6 text-muted-foreground mb-1 animate-spin" />
                      <p className="text-xs text-muted-foreground">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">Click to upload</p>
                      <p className="text-[10px] text-muted-foreground">1200x630, up to 5MB</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    disabled={isUploadingSocialPreview}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error('Image must be less than 5MB')
                        return
                      }
                      
                      setIsUploadingSocialPreview(true)
                      try {
                        const formData = new FormData()
                        formData.append('file', file)
                        formData.append('formId', form.id)
                        
                        const response = await fetch('/api/upload/social-preview', {
                          method: 'POST',
                          body: formData,
                        })
                        
                        if (!response.ok) {
                          const error = await response.json()
                          throw new Error(error.error || 'Upload failed')
                        }
                        
                        const data = await response.json()
                        handleUpdateSetting('seo', { ...settings.seo, image: data.url })
                        toast.success('Social preview image uploaded')
                      } catch (error) {
                        console.error('Upload error:', error)
                        toast.error(error instanceof Error ? error.message : 'Failed to upload image')
                      } finally {
                        setIsUploadingSocialPreview(false)
                      }
                    }}
                  />
                </label>
              )}
              <p className="text-xs text-muted-foreground">
                Recommended size 1200x630. Should be less than 5MB.
              </p>
            </div>

            {/* Favicon */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Favicon</Label>
                <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                  PRO
                </Badge>
              </div>
              {settings.seo?.favicon ? (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="relative w-8 h-8">
                    <Image 
                      src={settings.seo.favicon} 
                      alt="Favicon" 
                      fill
                      className="object-contain"
                      sizes="32px"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground flex-1 truncate">
                    {settings.seo.favicon.split('/').pop()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleUpdateSetting('seo', { ...settings.seo, favicon: undefined })}
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <label className={cn(
                  "flex items-center gap-3 w-full p-3 border-2 border-dashed border-border rounded-lg transition-colors",
                  isUploadingFavicon ? "opacity-50 cursor-wait" : "cursor-pointer hover:border-foreground/30"
                )}>
                  {isUploadingFavicon ? (
                    <>
                      <Spinner className="w-5 h-5 text-muted-foreground animate-spin" />
                      <span className="text-sm text-muted-foreground">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload favicon</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".ico,.png,.jpg,.jpeg,.svg,image/*"
                    disabled={isUploadingFavicon}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      
                      if (file.size > 1 * 1024 * 1024) {
                        toast.error('Favicon must be less than 1MB')
                        return
                      }
                      
                      setIsUploadingFavicon(true)
                      try {
                        const formData = new FormData()
                        formData.append('file', file)
                        formData.append('formId', form.id)
                        
                        const response = await fetch('/api/upload/favicon', {
                          method: 'POST',
                          body: formData,
                        })
                        
                        if (!response.ok) {
                          const error = await response.json()
                          throw new Error(error.error || 'Upload failed')
                        }
                        
                        const data = await response.json()
                        handleUpdateSetting('seo', { ...settings.seo, favicon: data.url })
                        toast.success('Favicon uploaded')
                      } catch (error) {
                        console.error('Upload error:', error)
                        toast.error(error instanceof Error ? error.message : 'Failed to upload favicon')
                      } finally {
                        setIsUploadingFavicon(false)
                      }
                    }}
                  />
                </label>
              )}
              <p className="text-xs text-muted-foreground">
                Recommended size 60x60. Ideally .ico or .png image.
              </p>
            </div>

            <Separator />

            <p className="text-sm text-muted-foreground text-center">
              Want to use your own domain? Check the <span className="text-primary">Custom Domain</span> tab.
            </p>
          </div>
        )

      case 'domain':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Custom Domain</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Serve this form on your own domain with a custom URL.
                </p>
              </div>
              <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                PRO
              </Badge>
            </div>

            {/* Current Domain Status */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Default URL</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" weight="fill" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
                <code className="text-sm flex-1">
                  {(form as any).short_id 
                    ? `https://tyform.com/r/${(form as any).short_id}`
                    : `https://tyform.com/f/${form.id}`}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    const url = (form as any).short_id 
                      ? `https://tyform.com/r/${(form as any).short_id}`
                      : `https://tyform.com/f/${form.id}`
                    navigator.clipboard.writeText(url)
                    toast.success('URL copied to clipboard')
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Custom Domain URLs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Custom Domain URLs</h3>
                {isLoadingDomains && <Spinner className="h-4 w-4 animate-spin" />}
              </div>

              {verifiedDomains.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <Globe className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground mb-2">No verified domains yet</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Add and verify a custom domain in workspace settings first
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/dashboard?settings=domains'}
                  >
                    <Gear className="h-3.5 w-3.5 mr-1.5" />
                    Manage Domains
                  </Button>
                </div>
              ) : (
                <>
                  {/* Add new URL */}
                  <div className="rounded-lg border p-4 space-y-3">
                    <p className="text-sm font-medium">Add Custom URL</p>
                    <div className="flex gap-2">
                      <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                        <SelectTrigger className="w-45">
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {verifiedDomains.map(domain => (
                            <SelectItem key={domain.id} value={domain.id}>
                              {domain.domain}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1 flex-1">
                        <span className="text-sm text-muted-foreground">/</span>
                        <Input
                          placeholder="contact"
                          value={domainSlug}
                          onChange={(e) => setDomainSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          className="flex-1"
                        />
                      </div>
                      <Button onClick={handleSaveDomainUrl} disabled={isSavingDomainUrl}>
                        {isSavingDomainUrl ? <Spinner className="h-4 w-4 animate-spin" /> : 'Add'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Example: {selectedDomain ? getDomainName(selectedDomain) : 'yourdomain.com'}/{domainSlug || 'contact'}
                    </p>
                  </div>

                  {/* Existing URLs for this form */}
                  {formDomainUrls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Active URLs for this form</p>
                      <div className="rounded-lg border divide-y">
                        {formDomainUrls.map(url => (
                          <div key={url.id} className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-2">
                              <LinkIcon className="h-4 w-4 text-muted-foreground" />
                              <code className="text-sm">{getDomainName(url.domain_id)}/{url.slug}</code>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  navigator.clipboard.writeText(`https://${getDomainName(url.domain_id)}/${url.slug}`)
                                  toast.success('URL copied')
                                }}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => window.open(`https://${getDomainName(url.domain_id)}/${url.slug}`, '_blank')}
                              >
                                <ArrowSquareOut className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteDomainUrl(url.id)}
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <Separator />

            {/* Link to domain management */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Need to add more domains?</p>
                <p className="text-xs text-muted-foreground">Manage all your domains from workspace settings</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard?settings=domains'}>
                <Gear className="h-3.5 w-3.5 mr-1.5" />
                Manage Domains
              </Button>
            </div>
          </div>
        )

      case 'language':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Language Settings</h2>

            {/* Default Language */}
            <div className="flex items-center justify-between py-4 border rounded-lg px-4">
              <div>
                <p className="font-medium">Form&apos;s default language</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will make all the system messages in your form in that language.
                </p>
              </div>
              <Select
                value={settings.language || 'en'}
                onValueChange={(value) => handleUpdateSetting('language', value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Info Prohibitner */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 flex gap-3">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Please note that changing the default language here won&apos;t affect any text that you
                have entered from the builder like question title, button texts etc. You have to write
                them yourself in the language of your choice.
              </p>
            </div>

            {/* Multi-language */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Add multiple languages</h3>
                <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                  PRO
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Here you can add multiple languages to your form. All the translations will be done
                on the basis of the default language you have selected above.
              </p>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="+ Add language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Default language badge */}
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {languages.find((l) => l.code === (settings.language || 'en'))?.flag}
                  </span>
                  <span className="font-medium">
                    {languages.find((l) => l.code === (settings.language || 'en'))?.name}
                  </span>
                </div>
                <Badge variant="outline">Default</Badge>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-3xl p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Form Settings</SheetTitle>
        </SheetHeader>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <div className="w-48 border-r p-4 space-y-1">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <span className="block">{tab.label}</span>
                {tab.sublabel && (
                  <span className="block text-xs opacity-70">{tab.sublabel}</span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">{renderContent()}</div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  )
}
