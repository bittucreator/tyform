'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Question, CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Form } from '@/types/database'

interface SettingsViewProps {
  form: Form
}

interface SettingRowProps {
  title: string
  description: string
  badge?: 'Pro' | 'Business'
  children: React.ReactNode
  disabled?: boolean
}

function SettingRow({ title, description, badge, children, disabled }: SettingRowProps) {
  return (
    <div className={cn(
      "flex items-start justify-between py-6 border-b border-border/50 last:border-0",
      disabled && "opacity-60"
    )}>
      <div className="flex-1 pr-8">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-medium">{title}</h3>
          {badge && (
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded font-medium",
              badge === 'Pro' ? "bg-pink-100 text-pink-600" : "bg-blue-100 text-blue-600"
            )}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">
        {children}
      </div>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-border/50 pb-4 mb-2">
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  )
}

export function SettingsView({ form }: SettingsViewProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // General settings
  const [language, setLanguage] = useState(form.settings.language || 'en')
  const [redirectEnabled, setRedirectEnabled] = useState(!!form.settings.seo?.redirectUrl)
  const [redirectUrl, setRedirectUrl] = useState(form.settings.seo?.redirectUrl || '')
  const [showProgressBar, setShowProgressBar] = useState(form.settings.showProgressBar !== false)
  const [partialSubmissions, setPartialSubmissions] = useState(form.settings.enablePartialSubmissions || false)
  const [showBranding, setShowBranding] = useState(form.settings.showPoweredBy !== false)
  
  // Email notifications
  const [selfEmailEnabled, setSelfEmailEnabled] = useState(form.settings.emailNotifications?.enabled || false)
  const [notificationEmail, setNotificationEmail] = useState(form.settings.emailNotifications?.to || '')
  const [respondentEmailEnabled, setRespondentEmailEnabled] = useState(form.settings.responderEmail?.enabled || false)
  
  // Access settings
  const [passwordProtect, setPasswordProtect] = useState(!!form.settings.password)
  const [password, setPassword] = useState(form.settings.password || '')
  const [closeForm, setCloseForm] = useState(form.settings.closeForm || false)
  const [scheduledClose, setScheduledClose] = useState(form.settings.closeByDate?.enabled || false)
  const [closedDate, setClosedDate] = useState(form.settings.closeByDate?.date || '')
  const [limitSubmissions, setLimitSubmissions] = useState(form.settings.closeBySubmissions?.enabled || false)
  const [maxSubmissions, setMaxSubmissions] = useState(form.settings.closeBySubmissions?.max?.toString() || '')
  const [closedMessage, setClosedMessage] = useState(form.settings.closedMessage || '')
  const [preventDuplicates, setPreventDuplicates] = useState(!!form.settings.preventDuplicates)
  
  // Behavior settings
  const [autoJump, setAutoJump] = useState(!!form.settings.autoJump)
  const [saveForLater, setSaveForLater] = useState(form.settings.enablePartialSubmissions || false)

  const handleChange = () => {
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const response = await fetch(`/api/forms/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            ...form.settings,
            language,
            seo: {
              ...form.settings.seo,
              redirectUrl: redirectEnabled ? redirectUrl : undefined,
            },
            showProgressBar,
            enablePartialSubmissions: partialSubmissions || saveForLater,
            showPoweredBy: showBranding,
            emailNotifications: {
              ...form.settings.emailNotifications,
              enabled: selfEmailEnabled,
              to: notificationEmail,
            },
            responderEmail: {
              ...form.settings.responderEmail,
              enabled: respondentEmailEnabled,
            },
            closeForm,
            closeByDate: {
              enabled: scheduledClose,
              date: scheduledClose ? closedDate : undefined,
            },
            closeBySubmissions: {
              enabled: limitSubmissions,
              max: limitSubmissions ? parseInt(maxSubmissions) : undefined,
            },
            closedMessage: closedMessage || undefined,
            // Access controls
            password: passwordProtect ? password : undefined,
            preventDuplicates,
            // Behavior
            autoJump,
          },
        }),
      })
      
      if (response.ok) {
        setHasChanges(false)
        setSaveSuccess(true)
        router.refresh()
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* General */}
      <section>
        <SectionHeader title="General" />
        
        <SettingRow
          title="Language"
          description="Choose in what language the respondents will see your form. This applies to the text which is not customized by you e.g. default buttons, errors, etc."
        >
          <Select value={language} onValueChange={(v) => { setLanguage(v); handleChange(); }}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="pt">Portuguese</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
              <SelectItem value="zh">Chinese</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          title="Redirect on completion"
          description="Redirect to a custom URL when the form is submitted."
        >
          <Switch 
            checked={redirectEnabled} 
            onCheckedChange={(v) => { setRedirectEnabled(v); handleChange(); }} 
          />
        </SettingRow>

        {redirectEnabled && (
          <div className="pb-6 border-b border-border/50">
            <Input
              value={redirectUrl}
              onChange={(e) => { setRedirectUrl(e.target.value); handleChange(); }}
              placeholder="https://example.com/thank-you"
              className="max-w-md"
            />
          </div>
        )}

        <SettingRow
          title="Progress bar"
          description="The progress bar provides a clear way for respondents to understand how much of the form they have completed, and encourages them to continue until the end."
        >
          <Switch 
            checked={showProgressBar} 
            onCheckedChange={(v) => { setShowProgressBar(v); handleChange(); }} 
          />
        </SettingRow>

        <SettingRow
          title="Partial submissions"
          description="Collect answers from people who filled in a part of your form, but didn't click the submit button. You can't export partial submissions with integrations, nor enable email notifications."
          badge="Pro"
        >
          <Switch 
            checked={partialSubmissions} 
            onCheckedChange={(v) => { setPartialSubmissions(v); handleChange(); }} 
          />
        </SettingRow>

        <SettingRow
          title="Tyform branding"
          description='Show "Made with Tyform" on your form.'
          badge="Pro"
        >
          <Switch 
            checked={showBranding} 
            onCheckedChange={(v) => { setShowBranding(v); handleChange(); }} 
          />
        </SettingRow>
      </section>

      {/* Email Notifications */}
      <section>
        <SectionHeader title="Email notifications" />
        
        <SettingRow
          title="Self email notifications"
          description="Get an email for new form submissions."
        >
          <Switch 
            checked={selfEmailEnabled} 
            onCheckedChange={(v) => { setSelfEmailEnabled(v); handleChange(); }} 
          />
        </SettingRow>

        {selfEmailEnabled && (
          <div className="pb-6 border-b border-border/50">
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center border-b border-border/50 px-4 py-3">
                <span className="text-sm text-muted-foreground w-24">From name:</span>
                <span className="text-sm">Tyform</span>
              </div>
              <div className="flex items-center border-b border-border/50 px-4 py-3">
                <span className="text-sm text-muted-foreground w-24">From:</span>
                <span className="text-sm text-primary">notifications@tyform.com</span>
              </div>
              <div className="flex items-center border-b border-border/50 px-4 py-3">
                <span className="text-sm text-muted-foreground w-24">To:</span>
                <Input
                  value={notificationEmail}
                  onChange={(e) => { setNotificationEmail(e.target.value); handleChange(); }}
                  placeholder="your@email.com"
                  className="border-0 p-0 h-auto text-sm focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center border-b border-border/50 px-4 py-3">
                <span className="text-sm text-muted-foreground w-24">Reply to:</span>
                <span className="text-sm text-muted-foreground">-</span>
              </div>
              <div className="flex items-center border-b border-border/50 px-4 py-3">
                <span className="text-sm text-muted-foreground w-24">Subject:</span>
                <span className="text-sm">New Tyform Submission for <span className="text-primary">@Form name</span></span>
              </div>
              <div className="px-4 py-3">
                <Textarea
                  placeholder="@All answers"
                  className="border-0 p-0 min-h-24 text-sm focus-visible:ring-0 resize-none"
                  disabled
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              To customize the email&apos;s recipient(s), subject and message,{' '}
              <a href="/billing" className="text-primary hover:underline">upgrade to Tyform Pro</a>.{' '}
              <span className="text-xs bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded font-medium">Pro</span>
            </p>
          </div>
        )}

        <SettingRow
          title="Respondent email notifications"
          description="Send a customized text email to respondents after form submission."
          badge="Pro"
        >
          <Switch 
            checked={respondentEmailEnabled} 
            onCheckedChange={(v) => { setRespondentEmailEnabled(v); handleChange(); }} 
          />
        </SettingRow>
      </section>

      {/* Access */}
      <section>
        <SectionHeader title="Access" />
        
        <SettingRow
          title="Password protect form"
          description="Enable this setting to require a password before respondents can access the form."
        >
          <Switch 
            checked={passwordProtect} 
            onCheckedChange={(v) => { setPasswordProtect(v); handleChange(); }} 
          />
        </SettingRow>

        {passwordProtect && (
          <div className="pb-6 border-b border-border/50">
            <Input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); handleChange(); }}
              placeholder="Enter password"
              className="max-w-xs"
            />
          </div>
        )}

        <SettingRow
          title="Close form"
          description="People won't be able to respond to this form anymore."
        >
          <Switch 
            checked={closeForm} 
            onCheckedChange={(v) => { setCloseForm(v); handleChange(); }} 
          />
        </SettingRow>

        <SettingRow
          title="Close form on a scheduled date"
          description="Schedule a date on which the form will be closed for new submissions."
        >
          <Switch 
            checked={scheduledClose} 
            onCheckedChange={(v) => { setScheduledClose(v); handleChange(); }} 
          />
        </SettingRow>

        {scheduledClose && (
          <div className="pb-6 border-b border-border/50">
            <Input
              type="datetime-local"
              value={closedDate}
              onChange={(e) => { setClosedDate(e.target.value); handleChange(); }}
              className="max-w-xs"
            />
          </div>
        )}

        <SettingRow
          title="Limit number of submissions"
          description="Set how many submissions you want to receive in total."
        >
          <Switch 
            checked={limitSubmissions} 
            onCheckedChange={(v) => { setLimitSubmissions(v); handleChange(); }} 
          />
        </SettingRow>

        {limitSubmissions && (
          <div className="pb-6 border-b border-border/50">
            <Input
              type="number"
              value={maxSubmissions}
              onChange={(e) => { setMaxSubmissions(e.target.value); handleChange(); }}
              placeholder="100"
              className="max-w-xs"
            />
          </div>
        )}

        <SettingRow
          title="Closed form message"
          description="This is what the recipients will see if you closed the form with one of the options above."
        >
          <Switch 
            checked={!!closedMessage} 
            onCheckedChange={(v) => { 
              if (!v) setClosedMessage(''); 
              handleChange(); 
            }} 
          />
        </SettingRow>

        {!!closedMessage || (
          <div className="pt-4 pb-6 border-b border-border/50">
            <Textarea
              value={closedMessage}
              onChange={(e) => { setClosedMessage(e.target.value); handleChange(); }}
              placeholder="This form is no longer accepting responses."
              className="max-w-md"
            />
          </div>
        )}

        <SettingRow
          title="Prevent duplicate submissions"
          description="Ensure each respondent can only submit the form once by selecting a form field (e.g. email address, phone number, IP address) that will be used as a unique identifier."
        >
          <Switch 
            checked={preventDuplicates} 
            onCheckedChange={(v) => { setPreventDuplicates(v); handleChange(); }} 
          />
        </SettingRow>
      </section>

      {/* Behavior */}
      <section>
        <SectionHeader title="Behavior" />
        
        <SettingRow
          title="Auto-jump to next page"
          description="Automatically jump to the next page when a question gets answered. Only works with one multiple choice, dropdown, rating or linear scale question per page."
        >
          <Switch 
            checked={autoJump} 
            onCheckedChange={(v) => { setAutoJump(v); handleChange(); }} 
          />
        </SettingRow>

        <SettingRow
          title="Save answers for later"
          description="Save answers of not-submitted forms, so respondents can continue from where they left off. The answers are stored in the local browser storage and never leave the respondent's computer."
        >
          <Switch 
            checked={saveForLater} 
            onCheckedChange={(v) => { setSaveForLater(v); handleChange(); }} 
          />
        </SettingRow>
      </section>

      {/* Footer */}
      <div className="flex items-center gap-4 pt-4 border-t border-border/50">
        <Button 
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={cn(!hasChanges && "opacity-50")}
        >
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
        {saveSuccess && (
          <span className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" weight="fill" />
            Settings saved
          </span>
        )}
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground ml-auto">
          <Question className="h-4 w-4" />
          Learn about settings
        </button>
      </div>
    </div>
  )
}
