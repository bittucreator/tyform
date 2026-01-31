'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, SpinnerGap, Clock, Users } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface InvitationData {
  id: string
  email: string
  role: string
  inviterName: string
  workspaceName: string
  expiresAt: string
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/invitations/${token}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Invalid invitation')
          return
        }

        setInvitation(data.invitation)
      } catch {
        setError('Failed to load invitation')
      } finally {
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [token])

  const handleAccept = async () => {
    setAccepting(true)

    try {
      const response = await fetch(`/api/invitations/${token}`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // User needs to sign in first
          toast.error('Please sign in to accept the invitation')
          router.push(`/login?redirect=/invite/${token}`)
          return
        }
        throw new Error(data.error || 'Failed to accept invitation')
      }

      setAccepted(true)
      toast.success('Welcome to the team!')
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (err) {
      console.error('Error accepting invitation:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <SpinnerGap className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-[13px] text-muted-foreground mt-4">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-[17px]">Invalid Invitation</CardTitle>
            <CardDescription className="text-[13px]">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button variant="outline" className="text-[12px]">
                Go to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-[17px]">Welcome to the team!</CardTitle>
            <CardDescription className="text-[13px]">
              You&apos;ve successfully joined {invitation?.workspaceName}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-[12px] text-muted-foreground mb-4">
              Redirecting to dashboard...
            </p>
            <SpinnerGap className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-[17px]">You&apos;re invited!</CardTitle>
          <CardDescription className="text-[13px]">
            <strong>{invitation?.inviterName}</strong> has invited you to join{' '}
            <strong>{invitation?.workspaceName}</strong> on Tyform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{invitation?.email}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">{invitation?.role}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-muted-foreground">Expires</span>
              <span className="font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {invitation?.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          <Button 
            className="w-full h-10 text-[13px]" 
            onClick={handleAccept}
            disabled={accepting}
          >
            {accepting ? (
              <>
                <SpinnerGap className="h-4 w-4 mr-2 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Invitation
              </>
            )}
          </Button>

          <p className="text-[11px] text-muted-foreground text-center">
            By accepting, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
