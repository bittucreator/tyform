'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { GearSix, UserCircle, BellRinging, WarningCircle, LockKey, Envelope } from '@phosphor-icons/react'
import { toast } from 'sonner'
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
import type { User } from '@supabase/supabase-js'

interface SettingsFormProps {
    user: User
    workspace: {
        id: string
        name: string
        slug: string
    } | null
}

export function SettingsForm({ user, workspace: initialWorkspace }: SettingsFormProps) {
    const router = useRouter()
    const supabase = createClient()
    
    // Workspace state
    const [workspace, setWorkspace] = useState(initialWorkspace)
    const [workspaceName, setWorkspaceName] = useState(initialWorkspace?.name || 'My Workspace')
    const [workspaceSlug, setWorkspaceSlug] = useState(initialWorkspace?.slug || '')
    const [savingWorkspace, setSavingWorkspace] = useState(false)
    const [creatingWorkspace, setCreatingWorkspace] = useState(false)
    
    // Profile state
    const [fullName, setFullName] = useState(user.user_metadata?.full_name || '')
    const [newEmail, setNewEmail] = useState('')
    const [savingProfile, setSavingProfile] = useState(false)
    const [updatingEmail, setUpdatingEmail] = useState(false)
    
    // Password state
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [updatingPassword, setUpdatingPassword] = useState(false)
    
    // Notification state
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [weeklyDigest, setWeeklyDigest] = useState(false)
    
    // Delete state
    const [deleting, setDeleting] = useState(false)
    const [deletingAccount, setDeletingAccount] = useState(false)

    const handleCreateWorkspace = async () => {
        setCreatingWorkspace(true)
        try {
            const response = await fetch('/api/workspaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: workspaceName || 'My Workspace',
                    slug: workspaceSlug || user.id.slice(0, 8),
                    icon: ''
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
        if (!workspace) {
            await handleCreateWorkspace()
            return
        }
        
        setSavingWorkspace(true)
        try {
            const response = await fetch(`/api/workspaces/${workspace.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: workspaceName, slug: workspaceSlug }),
            })
            
            if (response.ok) {
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
        if (!newEmail || newEmail === user.email) {
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
        
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match')
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
                setConfirmPassword('')
            }
        } catch {
            toast.error('Failed to change password')
        } finally {
            setUpdatingPassword(false)
        }
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

    return (
        <div className="space-y-5 p-6 max-w-2xl mx-auto w-full">
            {/* Page Header */}
            <div>
                <h1 className="text-[17px] font-semibold tracking-tight">Settings</h1>
                <p className="text-[13px] text-muted-foreground/80 mt-0.5">
                    Manage your workspace settings
                </p>
            </div>

            {/* Workspace Settings */}
            <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
                <div className="p-4 border-b border-border/50 flex items-center gap-2">
                    <GearSix className="w-4 h-4 text-muted-foreground/50" weight="duotone" />
                    <div>
                        <h2 className="font-semibold text-[14px] tracking-tight">Workspace</h2>
                        <p className="text-[12px] text-muted-foreground/70">Manage your workspace settings</p>
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="workspace-name" className="text-[12px]">Workspace name</Label>
                        <Input 
                            id="workspace-name" 
                            value={workspaceName}
                            onChange={(e) => setWorkspaceName(e.target.value)}
                            className="h-9 text-[13px]" 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="workspace-slug" className="text-[12px]">Workspace URL</Label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border/50 bg-muted/50 text-muted-foreground text-[12px]">
                                tyform.app/
                            </span>
                            <Input
                                id="workspace-slug"
                                className="rounded-l-none h-9 text-[13px]"
                                value={workspaceSlug}
                                onChange={(e) => setWorkspaceSlug(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button 
                        size="sm" 
                        className="h-8 text-[12px]"
                        onClick={handleSaveWorkspace}
                        disabled={savingWorkspace || creatingWorkspace}
                    >
                        {creatingWorkspace ? 'Creating...' : savingWorkspace ? 'Saving...' : workspace ? 'Save changes' : 'Create Workspace'}
                    </Button>
                </div>
            </div>

            {/* Profile Settings */}
            <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
                <div className="p-4 border-b border-border/50 flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-muted-foreground/50" weight="duotone" />
                    <div>
                        <h2 className="font-semibold text-[14px] tracking-tight">Profile</h2>
                        <p className="text-[12px] text-muted-foreground/70">Your personal information</p>
                    </div>
                </div>
                <div className="p-4 space-y-4">
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
                        <Input id="current-email" value={user.email || ''} disabled className="h-9 text-[13px] bg-muted/50" />
                    </div>
                    <Button 
                        size="sm" 
                        className="h-8 text-[12px]"
                        onClick={handleUpdateProfile}
                        disabled={savingProfile}
                    >
                        {savingProfile ? 'Updating...' : 'Update profile'}
                    </Button>
                </div>
            </div>

            {/* Email Settings */}
            <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
                <div className="p-4 border-b border-border/50 flex items-center gap-2">
                    <Envelope className="w-4 h-4 text-muted-foreground/50" weight="duotone" />
                    <div>
                        <h2 className="font-semibold text-[14px] tracking-tight">Change Email</h2>
                        <p className="text-[12px] text-muted-foreground/70">Update your email address</p>
                    </div>
                </div>
                <div className="p-4 space-y-4">
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
                        <p className="text-[11px] text-muted-foreground/60">
                            A confirmation link will be sent to your new email
                        </p>
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
            </div>

            {/* Password Settings */}
            <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
                <div className="p-4 border-b border-border/50 flex items-center gap-2">
                    <LockKey className="w-4 h-4 text-muted-foreground/50" weight="duotone" />
                    <div>
                        <h2 className="font-semibold text-[14px] tracking-tight">Change Password</h2>
                        <p className="text-[12px] text-muted-foreground/70">Update your password</p>
                    </div>
                </div>
                <div className="p-4 space-y-4">
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
                    <div className="space-y-1.5">
                        <Label htmlFor="confirm-password" className="text-[12px]">Confirm new password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="h-9 text-[13px]"
                        />
                    </div>
                    <Button 
                        size="sm" 
                        className="h-8 text-[12px]"
                        onClick={handleChangePassword}
                        disabled={updatingPassword || !newPassword || !confirmPassword}
                    >
                        {updatingPassword ? 'Updating...' : 'Change password'}
                    </Button>
                </div>
            </div>

            {/* Notifications */}
            <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
                <div className="p-4 border-b border-border/50 flex items-center gap-2">
                    <BellRinging className="w-4 h-4 text-muted-foreground/50" weight="duotone" />
                    <div>
                        <h2 className="font-semibold text-[14px] tracking-tight">Notifications</h2>
                        <p className="text-[12px] text-muted-foreground/70">Manage your notification preferences</p>
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-[13px]">Email notifications</p>
                            <p className="text-[12px] text-muted-foreground/70">
                                Receive email when you get new responses
                            </p>
                        </div>
                        <Switch 
                            checked={emailNotifications} 
                            onCheckedChange={setEmailNotifications}
                        />
                    </div>
                    <div className="border-t border-border/50 pt-4 flex items-center justify-between">
                        <div>
                            <p className="font-medium text-[13px]">Weekly digest</p>
                            <p className="text-[12px] text-muted-foreground/70">
                                Receive a weekly summary of your forms
                            </p>
                        </div>
                        <Switch 
                            checked={weeklyDigest}
                            onCheckedChange={setWeeklyDigest}
                        />
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-destructive/30 rounded-lg bg-card overflow-hidden">
                <div className="p-4 border-b border-destructive/30 flex items-center gap-2">
                    <WarningCircle className="w-4 h-4 text-destructive/70" weight="duotone" />
                    <div>
                        <h2 className="font-semibold text-[14px] tracking-tight text-destructive">Danger Zone</h2>
                        <p className="text-[12px] text-muted-foreground/70">Irreversible actions</p>
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    {/* Delete Workspace */}
                    {workspace && (
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[13px]">Delete workspace</p>
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
                    )}
                    
                    {/* Delete Account */}
                    <div className={`flex items-center justify-between ${workspace ? 'border-t border-destructive/20 pt-4' : ''}`}>
                        <div>
                            <p className="font-medium text-[13px]">Delete account</p>
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
            </div>
        </div>
    )
}
