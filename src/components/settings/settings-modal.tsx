'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useWorkspace } from '@/store/workspace'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { GearSix, UserCircle, BellSimple, Camera, Folder, Users, CreditCard, Crown, Check, Trash, Plus, Copy, Code, Eye, EyeSlash, Globe, CheckCircle, XCircle, ArrowsClockwise, Link as LinkIcon, LockSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import { PrettyUrls } from '@/components/domains/pretty-urls'
import type { User } from '@supabase/supabase-js'
import type { Domain, Form } from '@/types/database'

interface SettingsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User | null
    workspace: {
        id: string
        name: string
        slug: string
        icon?: string
    } | null
    defaultTab?: string
}

export function SettingsModal({ open, onOpenChange, user, workspace: initialWorkspace, defaultTab = 'workspace' }: SettingsModalProps) {
    const router = useRouter()
    const supabase = createClient()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { triggerRefresh, updateWorkspace } = useWorkspace()
    
    // Workspace state
    const [workspace, setWorkspace] = useState(initialWorkspace)
    const [workspaceName, setWorkspaceName] = useState(initialWorkspace?.name || 'My Workspace')
    const [workspaceSlug, setWorkspaceSlug] = useState(initialWorkspace?.slug || '')
    const [workspaceIcon, setWorkspaceIcon] = useState(initialWorkspace?.icon || '')
    const [savingWorkspace, setSavingWorkspace] = useState(false)
    const [creatingWorkspace, setCreatingWorkspace] = useState(false)
    const [uploadingIcon, setUploadingIcon] = useState(false)
    const [hasInitialized, setHasInitialized] = useState(false)

    // Sync workspace state only when modal first opens
    React.useEffect(() => {
        if (open && !hasInitialized && initialWorkspace) {
            setWorkspace(initialWorkspace)
            setWorkspaceName(initialWorkspace.name || 'My Workspace')
            setWorkspaceSlug(initialWorkspace.slug || '')
            setWorkspaceIcon(initialWorkspace.icon || '')
            setHasInitialized(true)
        }
        if (!open) {
            setHasInitialized(false)
        }
    }, [open, initialWorkspace, hasInitialized])
    
    // Profile state
    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
    const [newEmail, setNewEmail] = useState('')
    const [savingProfile, setSavingProfile] = useState(false)
    const [updatingEmail, setUpdatingEmail] = useState(false)
    
    // Password state
    const [newPassword, setNewPassword] = useState('')
    const [updatingPassword, setUpdatingPassword] = useState(false)
    
    // Notification state
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [weeklyDigest, setWeeklyDigest] = useState(false)
    const [newResponseNotif, setNewResponseNotif] = useState(true)
    const [formPublishedNotif, setFormPublishedNotif] = useState(true)
    const [savingNotifications, setSavingNotifications] = useState(false)
    const [notificationsLoaded, setNotificationsLoaded] = useState(false)
    
    // Delete state
    const [deleting, setDeleting] = useState(false)
    const [deletingAccount, setDeletingAccount] = useState(false)
    
    // Members state
    const [members, setMembers] = useState<Array<{ id: string; email: string; role: string; name?: string; avatar?: string; joinedAt: string }>>([]) 
    const [loadingMembers, setLoadingMembers] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
    const [inviting, setInviting] = useState(false)
    const [removingMember, setRemovingMember] = useState<string | null>(null)
    
    // Billing state
    const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'business'>('free')
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
    const [loadingBilling, setLoadingBilling] = useState(false)
    
    // Domains state
    const [domains, setDomains] = useState<Array<{ id: string; domain: string; verification_token: string; status: 'pending' | 'verified' | 'failed'; created_at: string; verified_at?: string; sslReady?: boolean }>>([]) 
    const [loadingDomains, setLoadingDomains] = useState(false)
    const [newDomain, setNewDomain] = useState('')
    const [addingDomain, setAddingDomain] = useState(false)
    const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null)
    const [deletingDomain, setDeletingDomain] = useState<string | null>(null)
    const [manageUrlsDomain, setManageUrlsDomain] = useState<{ id: string; domain: string } | null>(null)
    const [forms, setForms] = useState<Pick<Form, 'id' | 'title'>[]>([])
    
    // API state
    const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; key: string; created_at: string; last_used?: string }>>([]) 
    const [loadingApiKeys, setLoadingApiKeys] = useState(false)
    const [creatingApiKey, setCreatingApiKey] = useState(false)
    const [newKeyName, setNewKeyName] = useState('')
    const [showApiKey, setShowApiKey] = useState<string | null>(null)
    const [deletingApiKey, setDeletingApiKey] = useState<string | null>(null)

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file')
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be less than 2MB')
            return
        }

        setUploadingIcon(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${workspace?.id || 'temp'}-${Date.now()}.${fileExt}`
            const filePath = `workspace-icons/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('assets')
                .upload(filePath, file)

            if (uploadError) {
                toast.error('Failed to upload image')
                return
            }

            const { data: { publicUrl } } = supabase.storage
                .from('assets')
                .getPublicUrl(filePath)

            setWorkspaceIcon(publicUrl)
            toast.success('Icon uploaded!')
        } catch {
            toast.error('Failed to upload image')
        } finally {
            setUploadingIcon(false)
        }
    }

    const handleCreateWorkspace = async () => {
        setCreatingWorkspace(true)
        try {
            const response = await fetch('/api/workspaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: workspaceName || 'My Workspace',
                    slug: workspaceSlug || user?.id?.slice(0, 8) || 'workspace',
                    icon: workspaceIcon
                }),
            })
            
            if (response.ok) {
                const data = await response.json()
                setWorkspace(data.workspace)
                toast.success('Workspace created!')
                router.refresh()
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to create workspace')
            }
        } catch {
            toast.error('Failed to create workspace')
        } finally {
            setCreatingWorkspace(false)
        }
    }

    const handleSaveWorkspace = async () => {
        // If no workspace or workspace ID equals user ID (default/fake workspace), create new one
        if (!workspace || workspace.id === user?.id) {
            await handleCreateWorkspace()
            return
        }
        
        setSavingWorkspace(true)
        try {
            const response = await fetch(`/api/workspaces/${workspace.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: workspaceName, slug: workspaceSlug, icon: workspaceIcon }),
            })
            
            if (response.ok) {
                const data = await response.json()
                // Update the workspace in the store
                if (data.workspace) {
                    updateWorkspace({
                        id: data.workspace.id,
                        name: data.workspace.name,
                        slug: data.workspace.slug,
                        icon: data.workspace.icon,
                        role: 'owner',
                        isOwner: true,
                    })
                }
                triggerRefresh()
                toast.success('Workspace settings saved')
                router.refresh()
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to save workspace settings')
            }
        } catch {
            toast.error('Failed to save workspace settings')
        } finally {
            setSavingWorkspace(false)
        }
    }

    const handleUpdateProfile = async () => {
        setSavingProfile(true)
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            })
            
            if (error) {
                toast.error(error.message)
            } else {
                toast.success('Profile updated')
                router.refresh()
            }
        } catch {
            toast.error('Failed to update profile')
        } finally {
            setSavingProfile(false)
        }
    }

    const handleUpdateEmail = async () => {
        if (!newEmail || newEmail === user?.email) {
            toast.error('Please enter a new email address')
            return
        }
        
        setUpdatingEmail(true)
        try {
            const { error } = await supabase.auth.updateUser({
                email: newEmail
            })
            
            if (error) {
                toast.error(error.message)
            } else {
                toast.success('Confirmation email sent to your new address')
                setNewEmail('')
            }
        } catch {
            toast.error('Failed to update email')
        } finally {
            setUpdatingEmail(false)
        }
    }

    const handleChangePassword = async () => {
        if (!newPassword) {
            toast.error('Please enter a new password')
            return
        }
        
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }
        
        setUpdatingPassword(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })
            
            if (error) {
                toast.error(error.message)
            } else {
                toast.success('Password updated successfully')
                setNewPassword('')
            }
        } catch {
            toast.error('Failed to change password')
        } finally {
            setUpdatingPassword(false)
        }
    }

    // Load notification preferences
    const loadNotificationPreferences = async () => {
        if (notificationsLoaded) return
        try {
            const response = await fetch('/api/notifications/preferences')
            if (response.ok) {
                const data = await response.json()
                const prefs = data.preferences
                setEmailNotifications(prefs.email_notifications ?? true)
                setWeeklyDigest(prefs.weekly_digest ?? false)
                setNewResponseNotif(prefs.new_response ?? true)
                setFormPublishedNotif(prefs.form_published ?? true)
                setNotificationsLoaded(true)
            }
        } catch (error) {
            console.error('Failed to load notification preferences:', error)
        }
    }

    // Save notification preferences
    const saveNotificationPreferences = async (updates: Record<string, boolean>) => {
        setSavingNotifications(true)
        try {
            const response = await fetch('/api/notifications/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email_notifications: updates.email_notifications ?? emailNotifications,
                    weekly_digest: updates.weekly_digest ?? weeklyDigest,
                    new_response: updates.new_response ?? newResponseNotif,
                    form_published: updates.form_published ?? formPublishedNotif,
                }),
            })
            
            if (response.ok) {
                toast.success('Notification preferences saved')
            } else {
                toast.error('Failed to save preferences')
            }
        } catch {
            toast.error('Failed to save preferences')
        } finally {
            setSavingNotifications(false)
        }
    }

    const handleNotificationChange = (key: string, value: boolean) => {
        switch (key) {
            case 'email_notifications':
                setEmailNotifications(value)
                break
            case 'weekly_digest':
                setWeeklyDigest(value)
                break
            case 'new_response':
                setNewResponseNotif(value)
                break
            case 'form_published':
                setFormPublishedNotif(value)
                break
        }
        saveNotificationPreferences({ [key]: value })
    }

    const handleDeleteWorkspace = async () => {
        if (!workspace) return
        
        setDeleting(true)
        try {
            const response = await fetch(`/api/workspaces/${workspace.id}`, {
                method: 'DELETE',
            })
            
            if (response.ok) {
                toast.success('Workspace deleted')
                onOpenChange(false)
                router.push('/dashboard')
                router.refresh()
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to delete workspace')
            }
        } catch {
            toast.error('Failed to delete workspace')
        } finally {
            setDeleting(false)
        }
    }

    const handleDeleteAccount = async () => {
        setDeletingAccount(true)
        try {
            const response = await fetch('/api/account', {
                method: 'DELETE',
            })
            
            if (response.ok) {
                toast.success('Account deleted')
                await supabase.auth.signOut()
                router.push('/')
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to delete account')
            }
        } catch {
            toast.error('Failed to delete account')
        } finally {
            setDeletingAccount(false)
        }
    }

    // Load members when Members tab is selected
    const loadMembers = async () => {
        if (!workspace) return
        setLoadingMembers(true)
        try {
            const response = await fetch(`/api/workspaces/${workspace.id}/members`)
            if (response.ok) {
                const data = await response.json()
                setMembers(data.members || [])
            }
        } catch {
            console.error('Failed to load members')
        } finally {
            setLoadingMembers(false)
        }
    }

    const handleInviteMember = async () => {
        if (!inviteEmail || !workspace) return
        
        setInviting(true)
        try {
            const response = await fetch(`/api/workspaces/${workspace.id}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            })
            
            if (response.ok) {
                toast.success(`Invitation sent to ${inviteEmail}`)
                setInviteEmail('')
                loadMembers()
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to send invitation')
            }
        } catch {
            toast.error('Failed to send invitation')
        } finally {
            setInviting(false)
        }
    }

    const handleRemoveMember = async (memberId: string) => {
        if (!workspace) return
        
        setRemovingMember(memberId)
        try {
            const response = await fetch(`/api/workspaces/${workspace.id}/members/${memberId}`, {
                method: 'DELETE',
            })
            
            if (response.ok) {
                toast.success('Member removed')
                loadMembers()
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to remove member')
            }
        } catch {
            toast.error('Failed to remove member')
        } finally {
            setRemovingMember(null)
        }
    }

    const handleCopyInviteLink = () => {
        const inviteLink = `${window.location.origin}/invite/${workspace?.id}`
        navigator.clipboard.writeText(inviteLink)
        toast.success('Invite link copied to clipboard')
    }

    const handleUpgradePlan = async (plan: 'pro' | 'business') => {
        setLoadingBilling(true)
        try {
            const response = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    plan, 
                    billingCycle,
                    workspaceId: workspace?.id 
                }),
            })
            
            if (response.ok) {
                const data = await response.json()
                if (data.url) {
                    window.location.href = data.url
                }
            } else {
                toast.error('Failed to start checkout')
            }
        } catch {
            toast.error('Failed to start checkout')
        } finally {
            setLoadingBilling(false)
        }
    }

    const handleManageBilling = async () => {
        setLoadingBilling(true)
        try {
            const response = await fetch('/api/billing/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workspaceId: workspace?.id }),
            })
            
            if (response.ok) {
                const data = await response.json()
                if (data.url) {
                    window.location.href = data.url
                }
            } else {
                toast.error('Failed to open billing portal')
            }
        } catch {
            toast.error('Failed to open billing portal')
        } finally {
            setLoadingBilling(false)
        }
    }

    // Load domains
    const loadDomains = async () => {
        if (!workspace) return
        setLoadingDomains(true)
        try {
            const response = await fetch(`/api/workspaces/${workspace.id}/domains`)
            if (response.ok) {
                const data = await response.json()
                setDomains(data.domains || [])
            }
            
            // Also load forms for Pretty URLs
            if (user?.id) {
                const { data: formsData } = await supabase
                    .from('forms')
                    .select('id, title')
                    .eq('user_id', user.id)
                    .order('title', { ascending: true })
                setForms(formsData || [])
            }
        } catch {
            console.error('Failed to load domains')
        } finally {
            setLoadingDomains(false)
        }
    }

    const handleAddDomain = async () => {
        if (!workspace || !newDomain.trim()) return
        
        // Basic domain validation
        const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i
        if (!domainRegex.test(newDomain.trim())) {
            toast.error('Please enter a valid domain (e.g., forms.example.com)')
            return
        }
        
        setAddingDomain(true)
        try {
            const response = await fetch(`/api/workspaces/${workspace.id}/domains`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: newDomain.trim().toLowerCase() }),
            })
            
            if (response.ok) {
                const data = await response.json()
                setDomains(prev => [...prev, data.domain])
                setNewDomain('')
                toast.success('Domain added! Configure your DNS to verify it.')
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to add domain')
            }
        } catch {
            toast.error('Failed to add domain')
        } finally {
            setAddingDomain(false)
        }
    }

    const handleVerifyDomain = async (domainId: string) => {
        if (!workspace) return
        
        setVerifyingDomain(domainId)
        try {
            const response = await fetch(`/api/workspaces/${workspace.id}/domains/${domainId}/verify`, {
                method: 'POST',
            })
            
            if (response.ok) {
                const data = await response.json()
                setDomains(prev => prev.map(d => d.id === domainId ? { 
                    ...d, 
                    status: data.status, 
                    verified_at: data.verified_at,
                    sslReady: data.vercelStatus === 'added'
                } : d))
                if (data.status === 'verified') {
                    toast.success('Domain verified and added to hosting!')
                } else {
                    toast.error('Domain verification failed. Please check your DNS settings.')
                }
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to verify domain')
            }
        } catch {
            toast.error('Failed to verify domain')
        } finally {
            setVerifyingDomain(null)
        }
    }

    const handleDeleteDomain = async (domainId: string) => {
        if (!workspace) return
        
        setDeletingDomain(domainId)
        try {
            const response = await fetch(`/api/workspaces/${workspace.id}/domains/${domainId}`, {
                method: 'DELETE',
            })
            
            if (response.ok) {
                setDomains(prev => prev.filter(d => d.id !== domainId))
                toast.success('Domain removed')
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to remove domain')
            }
        } catch {
            toast.error('Failed to remove domain')
        } finally {
            setDeletingDomain(null)
        }
    }

    // Load API keys
    const loadApiKeys = async () => {
        if (!workspace) return
        setLoadingApiKeys(true)
        try {
            const response = await fetch(`/api/workspaces/${workspace.id}/api-keys`)
            if (response.ok) {
                const data = await response.json()
                setApiKeys(data.apiKeys || [])
            }
        } catch {
            console.error('Failed to load API keys')
        } finally {
            setLoadingApiKeys(false)
        }
    }

    const handleCreateApiKey = async () => {
        if (!workspace || !newKeyName.trim()) return
        
        setCreatingApiKey(true)
        try {
            const response = await fetch(`/api/workspaces/${workspace.id}/api-keys`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newKeyName.trim() }),
            })
            
            if (response.ok) {
                const data = await response.json()
                setApiKeys(prev => [...prev, data.apiKey])
                setNewKeyName('')
                toast.success('API key created! Make sure to copy it now.')
                setShowApiKey(data.apiKey.id)
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to create API key')
            }
        } catch {
            toast.error('Failed to create API key')
        } finally {
            setCreatingApiKey(false)
        }
    }

    const handleDeleteApiKey = async (keyId: string) => {
        if (!workspace) return
        
        setDeletingApiKey(keyId)
        try {
            const response = await fetch(`/api/workspaces/${workspace.id}/api-keys/${keyId}`, {
                method: 'DELETE',
            })
            
            if (response.ok) {
                setApiKeys(prev => prev.filter(k => k.id !== keyId))
                toast.success('API key deleted')
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to delete API key')
            }
        } catch {
            toast.error('Failed to delete API key')
        } finally {
            setDeletingApiKey(null)
        }
    }

    const plans = [
        {
            id: 'pro' as const,
            name: 'Pro',
            price: { monthly: 20, yearly: 200 },
            trial: '3-day free trial',
            features: [
                'Unlimited forms',
                'Unlimited responses', 
                'Unlimited questions per form',
                'Logic builder',
                'Score & calculations',
                'Hidden fields',
                'Embed forms',
                'Remove Tyform branding',
                'Add your brand logo',
                'Custom fonts & colors',
                'Custom domains',
                'Redirect to URL after submission',
                'Partial submissions',
                'File uploads (unlimited)',
                'Invite team members',
                'Collect payments',
                'Advanced analytics & drop-off rates',
                'Webhooks',
                'API access',
                'Google Sheets integration',
                'Slack integration',
                'Zapier integration',
                'Priority support'
            ],
        },
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-200 h-150 overflow-hidden p-0 flex flex-col">
                <DialogHeader className="px-6 pt-5 pb-4 shrink-0">
                    <DialogTitle className="text-[17px] font-semibold">Settings</DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue={defaultTab} key={defaultTab} className="flex-1 flex flex-col min-h-0">
                    <div className="px-6 border-b shrink-0">
                        <TabsList className="h-10 bg-transparent p-0 w-max justify-start gap-6">
                            <TabsTrigger 
                                value="workspace" 
                                className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[13px] focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                            >
                                <GearSix className="w-4 h-4 mr-1.5" weight="duotone" />
                                Workspace
                            </TabsTrigger>
                            <TabsTrigger 
                                value="profile" 
                                className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[13px] focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                            >
                                <UserCircle className="w-4 h-4 mr-1.5" weight="duotone" />
                                Profile
                            </TabsTrigger>
                            <TabsTrigger 
                                value="notifications" 
                                className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[13px] focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                            >
                                <BellSimple className="w-4 h-4 mr-1.5" weight="duotone" />
                                Notifications
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {/* Workspace Tab */}
                        <TabsContent value="workspace" className="mt-0 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[12px]">Workspace icon</Label>
                                <div className="flex items-center gap-3">
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative w-14 h-14 rounded-lg bg-muted flex items-center justify-center text-2xl cursor-pointer hover:bg-muted/80 transition-colors group overflow-hidden"
                                    >
                                        {workspaceIcon?.startsWith('http') ? (
                                            <Image src={workspaceIcon} alt="Workspace icon" fill className="object-cover" sizes="56px" />
                                        ) : (
                                            <Folder className="w-6 h-6 text-muted-foreground" weight="duotone" />
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Camera className="w-5 h-5 text-white" weight="duotone" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-7 text-[11px]"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingIcon}
                                        >
                                            {uploadingIcon ? 'Uploading...' : 'Upload image'}
                                        </Button>
                                        <p className="text-[10px] text-muted-foreground">PNG, JPG up to 2MB</p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleIconUpload}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="workspace-name" className="text-[12px]">Workspace name</Label>
                                <Input 
                                    id="workspace-name" 
                                    value={workspaceName}
                                    onChange={(e) => setWorkspaceName(e.target.value)}
                                    className="h-9 text-[13px]" 
                                />
                            </div>
                            <Button 
                                size="sm" 
                                className="h-8 text-[12px]"
                                onClick={handleSaveWorkspace}
                                disabled={savingWorkspace || creatingWorkspace}
                            >
                                {creatingWorkspace ? 'Creating...' : savingWorkspace ? 'Saving...' : workspace ? 'Save changes' : 'Create Workspace'}
                            </Button>
                            
                            {workspace && (
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg">
                                        <div>
                                            <p className="font-medium text-[13px] text-destructive">Delete workspace</p>
                                            <p className="text-[12px] text-muted-foreground/70">
                                                Permanently delete this workspace and all its data
                                            </p>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-8 text-[12px] text-destructive border-destructive/50 hover:bg-destructive hover:text-destructive-foreground"
                                                >
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete your
                                                        workspace and remove all associated forms and responses.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleDeleteWorkspace}
                                                        disabled={deleting}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        {deleting ? 'Deleting...' : 'Delete workspace'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* Profile Tab */}
                        <TabsContent value="profile" className="mt-0 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-[12px]">Full name</Label>
                                    <Input
                                        id="name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="h-9 text-[13px]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="current-email" className="text-[12px]">Current email</Label>
                                    <Input id="current-email" value={user?.email || ''} disabled className="h-9 text-[13px] bg-muted/50" />
                                </div>
                            </div>
                            <Button 
                                size="sm" 
                                className="h-8 text-[12px]"
                                onClick={handleUpdateProfile}
                                disabled={savingProfile}
                            >
                                {savingProfile ? 'Updating...' : 'Update profile'}
                            </Button>
                            
                            <div className="border-t pt-4 mt-4">
                                <h3 className="font-medium text-[13px] mb-3">Update Credentials</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="new-email" className="text-[12px]">New email address</Label>
                                            <Input
                                                id="new-email"
                                                type="email"
                                                value={newEmail}
                                                onChange={(e) => setNewEmail(e.target.value)}
                                                placeholder="Enter new email"
                                                className="h-9 text-[13px]"
                                            />
                                        </div>
                                        <Button 
                                            size="sm" 
                                            className="h-8 text-[12px]"
                                            onClick={handleUpdateEmail}
                                            disabled={updatingEmail || !newEmail}
                                        >
                                            {updatingEmail ? 'Sending...' : 'Update email'}
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="new-password" className="text-[12px]">New password</Label>
                                            <Input
                                                id="new-password"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Enter new password"
                                                className="h-9 text-[13px]"
                                            />
                                        </div>
                                        <Button 
                                            size="sm" 
                                            className="h-8 text-[12px]"
                                            onClick={handleChangePassword}
                                            disabled={updatingPassword || !newPassword}
                                        >
                                            {updatingPassword ? 'Updating...' : 'Change password'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-t pt-4 mt-4">
                                <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg">
                                    <div>
                                        <p className="font-medium text-[13px] text-destructive">Delete account</p>
                                        <p className="text-[12px] text-muted-foreground/70">
                                            Permanently delete your account and all associated data
                                        </p>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-8 text-[12px] text-destructive border-destructive/50 hover:bg-destructive hover:text-destructive-foreground"
                                            >
                                                Delete
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete your
                                                    account, all workspaces you own, and all associated forms and responses.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleDeleteAccount}
                                                    disabled={deletingAccount}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    {deletingAccount ? 'Deleting...' : 'Delete account'}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Notifications Tab */}
                        <TabsContent value="notifications" className="mt-0 space-y-4" onFocus={loadNotificationPreferences}>
                            <div>
                                <h3 className="font-medium text-[13px] mb-1">Email Notifications</h3>
                                <p className="text-[11px] text-muted-foreground/70 mb-4">
                                    Choose which emails you&apos;d like to receive. Powered by Unosend.
                                </p>
                            </div>
                            
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="font-medium text-[13px]">All email notifications</p>
                                    <p className="text-[12px] text-muted-foreground/70">
                                        Master toggle for all email notifications
                                    </p>
                                </div>
                                <Switch 
                                    checked={emailNotifications} 
                                    onCheckedChange={(value) => handleNotificationChange('email_notifications', value)}
                                    disabled={savingNotifications}
                                />
                            </div>
                            
                            <div className="border-t border-border/50 pt-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-[13px]">New response alerts</p>
                                        <p className="text-[12px] text-muted-foreground/70">
                                            Get notified when someone submits a response
                                        </p>
                                    </div>
                                    <Switch 
                                        checked={newResponseNotif} 
                                        onCheckedChange={(value) => handleNotificationChange('new_response', value)}
                                        disabled={savingNotifications || !emailNotifications}
                                    />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-[13px]">Form published</p>
                                        <p className="text-[12px] text-muted-foreground/70">
                                            Confirmation when your form goes live
                                        </p>
                                    </div>
                                    <Switch 
                                        checked={formPublishedNotif} 
                                        onCheckedChange={(value) => handleNotificationChange('form_published', value)}
                                        disabled={savingNotifications || !emailNotifications}
                                    />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-[13px]">Weekly digest</p>
                                        <p className="text-[12px] text-muted-foreground/70">
                                            Receive a weekly summary of your forms
                                        </p>
                                    </div>
                                    <Switch 
                                        checked={weeklyDigest}
                                        onCheckedChange={(value) => handleNotificationChange('weekly_digest', value)}
                                        disabled={savingNotifications || !emailNotifications}
                                    />
                                </div>
                            </div>
                            
                            {savingNotifications && (
                                <p className="text-[11px] text-muted-foreground">Saving...</p>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
