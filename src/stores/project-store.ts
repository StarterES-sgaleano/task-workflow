import { create } from 'zustand'
import { type Tables } from '@/lib/database.types'

type Project = Tables<'projects'>

interface ProjectState {
  projects: Project[]
  activeProjectId: string | null
  isLoading: boolean
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (projectId: string, updates: Partial<Project>) => void
  deleteProject: (projectId: string) => void
  setActiveProject: (projectId: string | null) => void
  setLoading: (loading: boolean) => void
  getActiveProject: () => Project | null
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  isLoading: false,
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  updateProject: (projectId, updates) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === projectId ? { ...p, ...updates } : p
    )
  })),
  deleteProject: (projectId) => set((state) => ({
    projects: state.projects.filter(p => p.id !== projectId),
    activeProjectId: state.activeProjectId === projectId ? null : state.activeProjectId
  })),
  setActiveProject: (projectId) => set({ activeProjectId: projectId }),
  setLoading: (isLoading) => set({ isLoading }),
  getActiveProject: () => {
    const { projects, activeProjectId } = get()
    return projects.find(p => p.id === activeProjectId) || null
  }
})) 