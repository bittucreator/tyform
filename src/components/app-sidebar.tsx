'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Layout,
  ChartBar,
  Gear,
  SignOut,
  CaretUpDown,
  Check,
  Plus,
  Folder,
  Users,
  Globe,
  Code,
  Sparkle,
  CreditCard,
} from '@phosphor-icons/react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/store/auth'
import { useWorkspace } from '@/store/workspace'
import { CreateWorkspaceModal } from '@/components/workspace/create-workspace-modal'
import { SettingsModal } from '@/components/settings/settings-modal'

const navItems = [
  {
    title: 'Forms',
    url: '/dashboard',
    icon: Layout,
  },
  {
    title: 'Templates',
    url: '/templates',
    icon: Sparkle,
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: ChartBar,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, setUser } = useAuth()
  const { workspaces, activeWorkspace, setWorkspaces, setActiveWorkspace, isLoading, refreshTrigger } = useWorkspace()
  const { isMobile } = useSidebar()
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [settingsTab, setSettingsTab] = React.useState('workspace')
  const supabase = createClient()

  // Handle settings query param to open settings modal with specific tab
  React.useEffect(() => {
    const settingsParam = searchParams.get('settings')
    if (settingsParam) {
      setSettingsTab(settingsParam)
      setSettingsOpen(true)
      // Clean up URL
      const url = new URL(window.location.href)
      url.searchParams.delete('settings')
      router.replace(url.pathname, { scroll: false })
    }
  }, [searchParams, router])

  // Fetch workspaces on mount and when refresh is triggered
  React.useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await fetch('/api/workspaces')
        if (response.ok) {
          const data = await response.json()
          setWorkspaces(data.workspaces || [])
        }
      } catch (error) {
        console.error('Failed to fetch workspaces:', error)
      }
    }
    fetchWorkspaces()
  }, [setWorkspaces, refreshTrigger])

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
    }
    getUser()
  }, [supabase.auth, setUser])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <>
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex size-8 items-center justify-center rounded-lg overflow-hidden border">
                    {activeWorkspace?.icon?.startsWith('http') ? (
                      <Image
                        src={activeWorkspace.icon}
                        alt={activeWorkspace.name}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <Image
                        src="/logo.svg"
                        alt="Tyform"
                        width={32}
                        height={32}
                        className="rounded-lg"
                      />
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{activeWorkspace?.name || 'Tyform'}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {isLoading ? 'Loading...' : 'Workspace'}
                    </span>
                  </div>
                  <CaretUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="start"
                side={isMobile ? 'bottom' : 'right'}
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Workspaces
                </DropdownMenuLabel>
                {workspaces.length === 0 && !isLoading && (
                  <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                    No workspaces yet
                  </div>
                )}
                {workspaces.map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    onClick={() => setActiveWorkspace(workspace)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border overflow-hidden">
                      {workspace.icon?.startsWith('http') ? (
                        <Image
                          src={workspace.icon}
                          alt={workspace.name}
                          width={24}
                          height={24}
                          className="object-cover"
                        />
                      ) : (
                        <Folder className="size-4 text-muted-foreground" weight="duotone" />
                      )}
                    </div>
                    <span className="flex-1">{workspace.name}</span>
                    {activeWorkspace?.id === workspace.id && (
                      <Check className="size-4" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2 p-2"
                  onClick={() => setCreateWorkspaceOpen(true)}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <span className="text-muted-foreground">Add workspace</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2 p-2 cursor-pointer"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Gear className="size-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2 p-2">
                  <SignOut className="size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/members'}
                  tooltip="Members"
                >
                  <Link href="/members">
                    <Users />
                    <span>Members</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/domains'}
                  tooltip="Domains"
                >
                  <Link href="/domains">
                    <Globe />
                    <span>Domains</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/api'}
                  tooltip="API"
                >
                  <Link href="/api">
                    <Code />
                    <span>API</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/billing'}
                  tooltip="Billing"
                >
                  <Link href="/billing">
                    <CreditCard />
                    <span>Billing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Settings"
                  onClick={() => { setSettingsTab('workspace'); setSettingsOpen(true) }}
                >
                  <Gear />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="rounded-lg bg-foreground text-background text-xs">
                      {user?.email ? getInitials(user.email) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email || ''}
                    </span>
                  </div>
                  <CaretUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="rounded-lg bg-foreground text-background text-xs">
                        {user?.email ? getInitials(user.email) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email || ''}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2 cursor-pointer"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Gear className="size-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2">
                  <SignOut className="size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
    <CreateWorkspaceModal open={createWorkspaceOpen} onOpenChange={setCreateWorkspaceOpen} />
    {user && (
      <SettingsModal 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
        user={user}
        workspace={activeWorkspace ? { id: activeWorkspace.id, name: activeWorkspace.name, slug: activeWorkspace.slug, icon: activeWorkspace.icon } : null}
        defaultTab={settingsTab}
      />
    )}
    </>
  )
}
