import { createClient } from '@/lib/supabase/client'
import { type Tables, type TablesInsert, type TablesUpdate, type Enums } from '@/lib/database.types'

type Item = Tables<'items'>
type ItemInsert = TablesInsert<'items'>
type ItemUpdate = TablesUpdate<'items'>
type ItemType = Enums<'item_type'>
type TaskStatus = Enums<'task_status'>

export async function getItems(): Promise<Item[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching items:', error)
    throw error
  }

  return data || []
}

export async function getItemsByProject(projectId: string): Promise<Item[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching items by project:', error)
    throw error
  }

  return data || []
}

export async function getItemsByType(type: ItemType): Promise<Item[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('type', type)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching items by type:', error)
    throw error
  }

  return data || []
}

export async function getTasksByStatus(status: TaskStatus): Promise<Item[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('type', 'task')
    .eq('status', status)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks by status:', error)
    throw error
  }

  return data || []
}

export async function getItem(id: string): Promise<Item | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching item:', error)
    return null
  }

  return data
}

export async function createItem(item: Omit<ItemInsert, 'user_id'>): Promise<Item> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('items')
    .insert({
      ...item,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating item:', error)
    throw error
  }

  return data
}

export async function updateItem(id: string, updates: ItemUpdate): Promise<Item> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating item:', error)
    throw error
  }

  return data
}

export async function deleteItem(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting item:', error)
    throw error
  }
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Item> {
  return updateItem(id, { status })
}

export async function searchItems(query: string): Promise<Item[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .textSearch('title', query)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error searching items:', error)
    throw error
  }

  return data || []
} 