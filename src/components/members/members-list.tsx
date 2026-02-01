'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DotsThree, Clock, Envelope, XCircle, SpinnerGap, UserMinus, ShieldCheck, User } from '@phosphor-icons/react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { InviteMemberButton } from '@/components/members/invite-member-button'
import { useWorkspace } from '@/store/workspace'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface WorkspaceMember {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: string
  joinedAt: string
}

interface TeamInvitation {
  id: string
  email: string
  role: string
  created_at: string
  expires_at: string
}

interface MembersData {
  members: WorkspaceMember[]
  invitations: TeamInvitation[]
  currentUser: {
    id: string
    email: string
    name: string
    avatar?: string
  }
}

export function MembersList() {
  const { activeWorkspace, isLoading: workspaceLoading } = useWorkspace()
  const [data, setData] = useState<MembersData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [removingMember, setRemovingMember] = useState<string | null>(null)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null)
  const [cancellingInvite, setCancellingInvite] = useState<string | null>(null)

  const fetchMembers = async () => {
    if (!activeWorkspace) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/workspaces/${activeWorkspace.id}/members`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [activeWorkspace])

  const handleRemoveMember = async () => {
    if (!activeWorkspace || !memberToRemove) return

    setRemovingMember(memberToRemove.id)
    try {
      const response = await fetch(`/api/workspaces/${activeWorkspace.id}/members/${memberToRemove.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Member removed from workspace')
        fetchMembers()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to remove member')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setRemovingMember(null)
      setMemberToRemove(null)
    }
  }

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'member') => {
    if (!activeWorkspace) return

    setUpdatingRole(memberId)
    try {
      const response = await fetch(`/api/workspaces/${activeWorkspace.id}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        toast.success(`Role updated to ${newRole}`)
        fetchMembers()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update role')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setUpdatingRole(null)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    if (!activeWorkspace) return

    setCancellingInvite(invitationId)
    try {
      const response = await fetch(`/api/workspaces/${activeWorkspace.id}/invitations/${invitationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Invitation cancelled')
        fetchMembers()
      } else {
        toast.error('Failed to cancel invitation')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setCancellingInvite(null)
    }
  }

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase()
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
      case 'admin':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  if (isLoading || workspaceLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <SpinnerGap className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!activeWorkspace) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Please select a workspace
      </div>
    )
  }

  const members = data?.members || []
  const invitations = data?.invitations || []
  const currentUser = data?.currentUser
  const totalCount = members.length + invitations.length

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight">Members</h1>
          <p className="text-[13px] text-muted-foreground/80 mt-0.5">
            Manage who has access to {activeWorkspace.name}
          </p>
        </div>
        <InviteMemberButton onSuccess={fetchMembers} />
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 border border-border/50 rounded-lg bg-card overflow-hidden divide-x divide-border/50">
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Total</span>
          <p className="text-lg font-semibold tabular-nums mt-1">{totalCount}</p>
        </div>
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Active</span>
          <p className="text-lg font-semibold tabular-nums mt-1">{members.length}</p>
        </div>
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Pending</span>
          <p className="text-lg font-semibold tabular-nums mt-1">{invitations.length}</p>
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h2 className="font-semibold text-[14px] tracking-tight">Pending invitations</h2>
            <p className="text-[12px] text-muted-foreground/70 mt-0.5">
              {invitations.length} invitation{invitations.length !== 1 ? 's' : ''} awaiting response
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[12px]">Email</TableHead>
                <TableHead className="text-[12px]">Role</TableHead>
                <TableHead className="text-[12px] hidden sm:table-cell">Sent</TableHead>
                <TableHead className="text-[12px] hidden sm:table-cell">Expires</TableHead>
                <TableHead className="text-[12px] w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invite) => (
                <TableRow key={invite.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Envelope className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span className="font-medium text-[13px]">{invite.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="text-[10px] border-0 bg-muted text-muted-foreground capitalize">
                      {invite.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[12px] text-muted-foreground hidden sm:table-cell">
                    {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-[12px] text-muted-foreground hidden sm:table-cell">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(invite.expires_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => handleCancelInvitation(invite.id)}
                      disabled={cancellingInvite === invite.id}
                    >
                      {cancellingInvite === invite.id ? (
                        <SpinnerGap className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Members Table */}
      <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-semibold text-[14px] tracking-tight">Workspace members</h2>
          <p className="text-[12px] text-muted-foreground/70 mt-0.5">
            {members.length} member{members.length !== 1 ? 's' : ''} in this workspace
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[12px]">Member</TableHead>
              <TableHead className="text-[12px]">Role</TableHead>
              <TableHead className="text-[12px] hidden sm:table-cell">Joined</TableHead>
              <TableHead className="text-[12px] w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const isCurrentUser = member.email === currentUser?.email
              const displayName = member.name || member.email?.split('@')[0] || 'User'
              const displayEmail = member.email

              return (
                <TableRow key={member.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {member.avatar && (
                          <AvatarImage src={member.avatar} />
                        )}
                        <AvatarFallback className="bg-muted text-[11px]">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[13px]">
                          {displayName}
                          {isCurrentUser && <span className="text-muted-foreground ml-1">(you)</span>}
                        </p>
                        <p className="text-[11px] text-muted-foreground/60">{displayEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] border-0 capitalize ${getRoleBadgeClass(member.role)}`}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[12px] text-muted-foreground hidden sm:table-cell">
                    {member.joinedAt ? formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true }) : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {!isCurrentUser && member.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            disabled={removingMember === member.id || updatingRole === member.id}
                          >
                            <DotsThree className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {member.role === 'member' ? (
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(member.id, 'admin')}
                              disabled={updatingRole === member.id}
                            >
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              Make admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(member.id, 'member')}
                              disabled={updatingRole === member.id}
                            >
                              <User className="w-4 h-4 mr-2" />
                              Make member
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setMemberToRemove(member)}
                            className="text-destructive focus:text-destructive"
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Remove from workspace
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-medium text-foreground">{memberToRemove?.name || memberToRemove?.email}</span> from this workspace? They will lose access to all forms and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!!removingMember}
            >
              {removingMember ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
