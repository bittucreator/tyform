'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useWorkspace } from '@/store/workspace'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { GearSix, UserCircle, BellSimple, Camera, Folder, Users, CreditCard, Crown, Check, Trash, Plus, Copy, Code, Eye, EyeSlash, ArrowClockwise, Globe, CheckCircle, XCircle, ArrowsClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
import type { User } from '@supabase/supabase-js'

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
    const [domains, setDomains] = useState<Array<{ id: string; domain: string; verification_token: string; status: 'pending' | 'verified' | 'failed'; created_at: string; verified_at?: string }>>([]) 
    const [loadingDomains, setLoadingDomains] = useState(false)
    const [newDomain, setNewDomain] = useState('')
    const [addingDomain, setAddingDomain] = useState(false)
    const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null)
    const [deletingDomain, setDeletingDomain] = useState<string | null>(null)
    
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
                setDomains(prev => prev.map(d => d.id === domainId ? { ...d, status: data.status, verified_at: data.verified_at } : d))
                if (data.status === 'verified') {
                    toast.success('Domain verified successfully!')
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
            id: 'free' as const,
            name: 'Free',
            price: { monthly: 0, yearly: 0 },
            features: ['Up to 3 forms', '100 responses/month', 'Basic analytics', 'Email support'],
        },
        {
            id: 'pro' as const,
            name: 'Pro',
            price: { monthly: 29, yearly: 290 },
            features: ['Unlimited forms', '10,000 responses/month', 'Advanced analytics', 'Priority support', 'Custom branding', 'File uploads'],
            popular: true,
        },
        {
            id: 'business' as const,
            name: 'Business',
            price: { monthly: 79, yearly: 790 },
            features: ['Everything in Pro', 'Unlimited responses', 'Team collaboration', 'API access', 'SSO', 'Dedicated support'],
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
                            <TabsTrigger 
                                value="members" 
                                className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[13px] focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                                onClick={loadMembers}
                            >
                                <Users className="w-4 h-4 mr-1.5" weight="duotone" />
                                Members
                            </TabsTrigger>
                            <TabsTrigger 
                                value="billing" 
                                className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[13px] focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                            >
                                <CreditCard className="w-4 h-4 mr-1.5" weight="duotone" />
                                Billing
                            </TabsTrigger>
                            <TabsTrigger 
                                value="domains" 
                                className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[13px] focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                                onClick={loadDomains}
                            >
                                <Globe className="w-4 h-4 mr-1.5" weight="duotone" />
                                Domains
                            </TabsTrigger>
                            <TabsTrigger 
                                value="api" 
                                className="h-10 px-0 pb-3 pt-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[13px] focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                                onClick={loadApiKeys}
                            >
                                <Code className="w-4 h-4 mr-1.5" weight="duotone" />
                                API
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
                                            <img src={workspaceIcon} alt="Workspace icon" className="w-full h-full object-cover" />
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
                                    Choose which emails you'd like to receive. Powered by Unosend.
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

                        {/* Members Tab */}
                        <TabsContent value="members" className="mt-0 space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-[13px] mb-1">Invite team members</h3>
                                    <p className="text-[12px] text-muted-foreground/70 mb-3">
                                        Collaborate with your team by inviting them to this workspace
                                    </p>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="colleague@company.com"
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="h-9 text-[13px] flex-1"
                                        />
                                        <select
                                            value={inviteRole}
                                            onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                                            className="h-9 px-3 text-[13px] border rounded-md bg-background"
                                        >
                                            <option value="member">Member</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <Button 
                                            size="sm" 
                                            className="h-9 text-[12px]"
                                            onClick={handleInviteMember}
                                            disabled={inviting || !inviteEmail}
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            {inviting ? 'Sending...' : 'Invite'}
                                        </Button>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 pt-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 text-[12px]"
                                        onClick={handleCopyInviteLink}
                                    >
                                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                                        Copy invite link
                                    </Button>
                                </div>
                                
                                <div className="border-t pt-4">
                                    <h3 className="font-medium text-[13px] mb-3">Workspace members</h3>
                                    {loadingMembers ? (
                                        <p className="text-[12px] text-muted-foreground">Loading members...</p>
                                    ) : members.length === 0 ? (
                                        <div className="text-center py-6 text-muted-foreground">
                                            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-[12px]">No team members yet</p>
                                            <p className="text-[11px] opacity-70">Invite colleagues to collaborate</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {members.map((member) => (
                                                <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            {member.avatar ? (
                                                                <img src={member.avatar} alt={member.name || member.email} className="w-full h-full rounded-full object-cover" />
                                                            ) : (
                                                                <span className="text-[12px] font-medium text-primary">
                                                                    {(member.name || member.email).charAt(0).toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-[13px] font-medium">{member.name || member.email}</p>
                                                            <p className="text-[11px] text-muted-foreground">{member.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                                                            member.role === 'owner' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            member.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}>
                                                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                                        </span>
                                                        {member.role !== 'owner' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                                                onClick={() => handleRemoveMember(member.id)}
                                                                disabled={removingMember === member.id}
                                                            >
                                                                <Trash className="w-3.5 h-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Billing Tab */}
                        <TabsContent value="billing" className="mt-0 space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-[13px]">Current Plan</h3>
                                        <p className="text-[12px] text-muted-foreground/70">
                                            You are currently on the <span className="font-medium text-foreground">{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</span> plan
                                        </p>
                                    </div>
                                    {currentPlan !== 'free' && (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-8 text-[12px]"
                                            onClick={handleManageBilling}
                                            disabled={loadingBilling}
                                        >
                                            Manage billing
                                        </Button>
                                    )}
                                </div>
                                
                                <div className="flex items-center justify-center gap-2 py-2">
                                    <span className={`text-[12px] ${billingCycle === 'monthly' ? 'font-medium' : 'text-muted-foreground'}`}>Monthly</span>
                                    <Switch
                                        checked={billingCycle === 'yearly'}
                                        onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                                    />
                                    <span className={`text-[12px] ${billingCycle === 'yearly' ? 'font-medium' : 'text-muted-foreground'}`}>Yearly</span>
                                    <span className="text-[11px] text-green-600 font-medium ml-1">Save 17%</span>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-3">
                                    {plans.map((plan) => (
                                        <div 
                                            key={plan.id}
                                            className={`relative p-4 rounded-lg border-2 transition-colors ${
                                                currentPlan === plan.id 
                                                    ? 'border-primary bg-primary/5' 
                                                    : plan.popular 
                                                        ? 'border-primary/50' 
                                                        : 'border-border hover:border-primary/30'
                                            }`}
                                        >
                                            {plan.popular && (
                                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                                                    <span className="bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                                                        Popular
                                                    </span>
                                                </div>
                                            )}
                                            <div className="text-center mb-3">
                                                <h4 className="font-semibold text-[14px]">{plan.name}</h4>
                                                <div className="mt-1">
                                                    <span className="text-2xl font-bold">${plan.price[billingCycle]}</span>
                                                    <span className="text-[12px] text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                                </div>
                                            </div>
                                            <ul className="space-y-1.5 mb-4">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-1.5 text-[11px]">
                                                        <Check className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" weight="bold" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            {currentPlan === plan.id ? (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="w-full h-8 text-[12px]" 
                                                    disabled
                                                >
                                                    Current plan
                                                </Button>
                                            ) : plan.id === 'free' ? (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="w-full h-8 text-[12px]" 
                                                    disabled
                                                >
                                                    Free forever
                                                </Button>
                                            ) : (
                                                <Button 
                                                    size="sm" 
                                                    className="w-full h-8 text-[12px]"
                                                    onClick={() => handleUpgradePlan(plan.id)}
                                                    disabled={loadingBilling}
                                                >
                                                    <Crown className="w-3.5 h-3.5 mr-1" weight="fill" />
                                                    Upgrade
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                {currentPlan !== 'free' && (
                                    <div className="border-t pt-4">
                                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                            <div>
                                                <p className="text-[13px] font-medium">Need more?</p>
                                                <p className="text-[11px] text-muted-foreground">Contact us for enterprise pricing</p>
                                            </div>
                                            <Button variant="outline" size="sm" className="h-8 text-[12px]">
                                                Contact sales
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Domains Tab */}
                        <TabsContent value="domains" className="mt-0 space-y-4">
                            <div>
                                <h3 className="font-medium text-[13px] mb-1">Custom Domains</h3>
                                <p className="text-[11px] text-muted-foreground/70 mb-4">
                                    Add custom domains to serve your forms on your own branded URLs.
                                </p>
                            </div>
                            
                            <div className="flex gap-2">
                                <Input
                                    placeholder="forms.yourdomain.com"
                                    value={newDomain}
                                    onChange={(e) => setNewDomain(e.target.value)}
                                    className="h-9 text-[13px] flex-1"
                                />
                                <Button 
                                    size="sm" 
                                    className="h-9 text-[12px]"
                                    onClick={handleAddDomain}
                                    disabled={addingDomain || !newDomain.trim()}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    {addingDomain ? 'Adding...' : 'Add domain'}
                                </Button>
                            </div>
                            
                            <div className="border-t pt-4">
                                <h4 className="font-medium text-[12px] mb-3">Your Domains</h4>
                                {loadingDomains ? (
                                    <p className="text-[12px] text-muted-foreground">Loading domains...</p>
                                ) : domains.length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-[12px]">No custom domains yet</p>
                                        <p className="text-[11px] opacity-70">Add a domain to use your own branded URLs</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {domains.map((domain) => (
                                            <div key={domain.id} className="p-3 bg-muted/50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[13px] font-medium">{domain.domain}</p>
                                                        {domain.status === 'verified' ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">
                                                                <CheckCircle className="w-3 h-3" weight="fill" />
                                                                Verified
                                                            </span>
                                                        ) : domain.status === 'failed' ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded">
                                                                <XCircle className="w-3 h-3" weight="fill" />
                                                                Failed
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded">
                                                                <ArrowsClockwise className="w-3 h-3" />
                                                                Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {domain.status !== 'verified' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-[11px] px-2"
                                                                onClick={() => handleVerifyDomain(domain.id)}
                                                                disabled={verifyingDomain === domain.id}
                                                            >
                                                                <ArrowsClockwise className={`w-3.5 h-3.5 mr-1 ${verifyingDomain === domain.id ? 'animate-spin' : ''}`} />
                                                                {verifyingDomain === domain.id ? 'Checking...' : 'Verify'}
                                                            </Button>
                                                        )}
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                                                    disabled={deletingDomain === domain.id}
                                                                >
                                                                    <Trash className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle className="text-[15px]">Remove domain?</AlertDialogTitle>
                                                                    <AlertDialogDescription className="text-[13px]">
                                                                        Forms using this domain will no longer be accessible at {domain.domain}.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="h-8 text-[12px]">Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDeleteDomain(domain.id)}
                                                                        className="h-8 text-[12px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Remove
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                                
                                                {/* DNS Records for pending domains */}
                                                {domain.status !== 'verified' && (
                                                    <div className="mt-3 pt-3 border-t border-border/50">
                                                        <p className="text-[10px] text-muted-foreground mb-2">Add these DNS records:</p>
                                                        <div className="space-y-1.5 text-[10px]">
                                                            <div className="flex items-center gap-2 font-mono bg-background rounded px-2 py-1.5">
                                                                <span className="text-muted-foreground w-12">CNAME</span>
                                                                <span className="text-muted-foreground">→</span>
                                                                <span className="flex-1">cname.tyform.com</span>
                                                                <button onClick={() => { navigator.clipboard.writeText('cname.tyform.com'); toast.success('Copied') }} className="text-muted-foreground hover:text-foreground">
                                                                    <Copy className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center gap-2 font-mono bg-background rounded px-2 py-1.5">
                                                                <span className="text-muted-foreground w-12">TXT</span>
                                                                <span className="text-muted-foreground w-16 truncate">_tyform</span>
                                                                <span className="flex-1 truncate">{domain.verification_token}</span>
                                                                <button onClick={() => { navigator.clipboard.writeText(domain.verification_token); toast.success('Copied') }} className="text-muted-foreground hover:text-foreground">
                                                                    <Copy className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <p className="text-[10px] text-muted-foreground mt-2">
                                                    Added {new Date(domain.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <p className="text-[10px] text-muted-foreground/70 border-t pt-3">
                                DNS changes can take up to 48 hours to propagate.
                            </p>
                        </TabsContent>

                        {/* API Tab */}
                        <TabsContent value="api" className="mt-0 space-y-4">
                            <div>
                                <h3 className="font-medium text-[13px] mb-1">API Keys</h3>
                                <p className="text-[11px] text-muted-foreground/70 mb-4">
                                    Manage API keys to access the Tyform API programmatically.
                                </p>
                            </div>
                            
                            <div className="flex gap-2">
                                <Input
                                    placeholder="API key name (e.g., Production)"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    className="h-9 text-[13px] flex-1"
                                />
                                <Button 
                                    size="sm" 
                                    className="h-9 text-[12px]"
                                    onClick={handleCreateApiKey}
                                    disabled={creatingApiKey || !newKeyName.trim()}
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    {creatingApiKey ? 'Creating...' : 'Create key'}
                                </Button>
                            </div>
                            
                            <div className="border-t pt-4">
                                <h4 className="font-medium text-[12px] mb-3">Your API Keys</h4>
                                {loadingApiKeys ? (
                                    <p className="text-[12px] text-muted-foreground">Loading API keys...</p>
                                ) : apiKeys.length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-[12px]">No API keys yet</p>
                                        <p className="text-[11px] opacity-70">Create your first API key to get started</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {apiKeys.map((apiKey) => (
                                            <div key={apiKey.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-medium">{apiKey.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <code className="text-[11px] font-mono bg-background px-2 py-0.5 rounded border">
                                                            {showApiKey === apiKey.id ? apiKey.key : `${apiKey.key.slice(0, 12)}${'•'.repeat(20)}`}
                                                        </code>
                                                        <button
                                                            onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                                                            className="text-muted-foreground hover:text-foreground"
                                                        >
                                                            {showApiKey === apiKey.id ? (
                                                                <EyeSlash className="w-3.5 h-3.5" />
                                                            ) : (
                                                                <Eye className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(apiKey.key)
                                                                toast.success('API key copied')
                                                            }}
                                                            className="text-muted-foreground hover:text-foreground"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground mt-1">
                                                        Created {new Date(apiKey.created_at).toLocaleDateString()}
                                                        {apiKey.last_used && ` • Last used ${new Date(apiKey.last_used).toLocaleDateString()}`}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleDeleteApiKey(apiKey.id)}
                                                    disabled={deletingApiKey === apiKey.id}
                                                >
                                                    <Trash className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            <div className="border-t pt-4">
                                <h4 className="font-medium text-[12px] mb-2">API Documentation</h4>
                                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                                    <div>
                                        <p className="text-[11px] text-muted-foreground mb-1">Base URL</p>
                                        <code className="text-[12px] font-mono bg-background px-2 py-1 rounded border block">
                                            {typeof window !== 'undefined' ? window.location.origin : ''}/api/v1
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-muted-foreground mb-1">Authentication</p>
                                        <code className="text-[12px] font-mono bg-background px-2 py-1 rounded border block">
                                            Authorization: Bearer YOUR_API_KEY
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-muted-foreground mb-2">Available Endpoints</p>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">GET</span>
                                                <code className="text-[11px] font-mono">/forms</code>
                                                <span className="text-[10px] text-muted-foreground">List all forms</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">GET</span>
                                                <code className="text-[11px] font-mono">/forms/:id</code>
                                                <span className="text-[10px] text-muted-foreground">Get form details</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">GET</span>
                                                <code className="text-[11px] font-mono">/forms/:id/responses</code>
                                                <span className="text-[10px] text-muted-foreground">Get form responses</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded">POST</span>
                                                <code className="text-[11px] font-mono">/forms</code>
                                                <span className="text-[10px] text-muted-foreground">Create a form</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded">PATCH</span>
                                                <code className="text-[11px] font-mono">/forms/:id</code>
                                                <span className="text-[10px] text-muted-foreground">Update a form</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded">DELETE</span>
                                                <code className="text-[11px] font-mono">/forms/:id</code>
                                                <span className="text-[10px] text-muted-foreground">Delete a form</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
