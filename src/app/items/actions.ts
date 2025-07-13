'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function createItem(formData: FormData, projectId: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const data = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    type: formData.get('type') as 'task' | 'document',
  }

  if (!data.name) {
    return { error: 'Item name is required' }
  }

  const { error } = await supabase.from('items').insert({
    name: data.name,
    description: data.description,
    type: data.type,
    status: 'open',
    project_id: projectId,
    user_id: user.id,
  })

  if (error) {
    console.error('Error creating item:', error)
    return { error: 'Database error: Could not create item.' }
  }

  revalidatePath(`/projects/${projectId}`)
}

export async function updateItem(formData: FormData, itemId: string, projectId: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const data = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    type: formData.get('type') as 'task' | 'document',
  }

  if (!data.name) {
    return { error: 'Item name is required' }
  }

  const { error } = await supabase
    .from('items')
    .update({
      name: data.name,
      description: data.description,
      type: data.type,
    })
    .eq('id', itemId)

  if (error) {
    console.error('Error updating item:', error)
    return { error: 'Database error: Could not update item.' }
  }

  revalidatePath(`/projects/${projectId}/${itemId}`)
  revalidatePath(`/projects/${projectId}`)
}

export async function toggleItemStatus(itemId: string, projectId: string, currentStatus: 'open' | 'closed') {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const newStatus = currentStatus === 'open' ? 'closed' : 'open'

  const { error } = await supabase
    .from('items')
    .update({ status: newStatus })
    .eq('id', itemId)

  if (error) {
    console.error('Error updating item status:', error)
    return { error: 'Database error: Could not update item status.' }
  }

  revalidatePath(`/projects/${projectId}`)
}
