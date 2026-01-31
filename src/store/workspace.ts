import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Workspace {
  id: string
  name: string
  slug: string
  icon: string
  role: string
  isOwner: boolean
}

interface WorkspaceState {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  isLoading: boolean
  refreshTrigger: number
  setWorkspaces: (workspaces: Workspace[]) => void
  setActiveWorkspace: (workspace: Workspace) => void
  addWorkspace: (workspace: Workspace) => void
  updateWorkspace: (workspace: Workspace) => void
  setLoading: (loading: boolean) => void
  triggerRefresh: () => void
}

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspace: null,
      isLoading: true,
      refreshTrigger: 0,
      setWorkspaces: (workspaces) => {
        const current = get().activeWorkspace
        // If no active workspace or active workspace not in list, set first one
        // Also update activeWorkspace with fresh data from the list
        const updatedActive = current 
          ? workspaces.find((w) => w.id === current.id) 
          : null
        set({
          workspaces,
          activeWorkspace: updatedActive || workspaces[0] || null,
          isLoading: false,
        })
      },
      setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
      addWorkspace: (workspace) =>
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
          activeWorkspace: workspace, // Switch to the new workspace
        })),
      updateWorkspace: (workspace) =>
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspace.id ? workspace : w
          ),
          activeWorkspace:
            state.activeWorkspace?.id === workspace.id
              ? workspace
              : state.activeWorkspace,
        })),
      setLoading: (loading) => set({ isLoading: loading }),
      triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
    }),
    {
      name: 'tyform-workspace',
      partialize: (state) => ({
        activeWorkspace: state.activeWorkspace,
      }),
    }
  )
)
