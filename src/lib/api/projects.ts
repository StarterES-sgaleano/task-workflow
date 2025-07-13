import { createClient } from '@/lib/supabase/client'
import { type Tables, type TablesInsert, type TablesUpdate } from '@/lib/database.types'

type Project = Tables<'projects'>
type ProjectInsert = TablesInsert<'projects'>
type ProjectUpdate = TablesUpdate<'projects'>

export async function getProjects(): Promise<Project[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    throw error
  }

  return data || []
}

export async function getArchivedProjects(): Promise<Project[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_archived', true)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching archived projects:', error)
    throw error
  }

  return data || []
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  return data
}

export async function createProject(project: Omit<ProjectInsert, 'user_id'>): Promise<Project> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...project,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    throw error
  }

  return data
}

export async function updateProject(id: string, updates: ProjectUpdate): Promise<Project> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    throw error
  }

  return data
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting project:', error)
    throw error
  }
}

export async function archiveProject(id: string): Promise<Project> {
  return updateProject(id, { is_archived: true })
}

export async function unarchiveProject(id: string): Promise<Project> {
  return updateProject(id, { is_archived: false })
} 