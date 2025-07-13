'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function createProject(formData: FormData) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string || null,
  }

  if (!data.name) {
    return { error: "Project name is required" }
  }

  const { error } = await supabase.from("projects").insert({
    name: data.name,
    description: data.description,
    user_id: user.id,
  })

  if (error) {
    console.error("Error creating project:", error)
    return { error: "Database error: Could not create project." }
  }

  revalidatePath("/projects")
}

export async function updateProject(projectId: string, formData: FormData) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const data = {
    name: formData.get("name") as string,
    description: formData.get("description") as string || null,
  }

  if (!data.name) {
    return { error: "Project name is required" }
  }

  const { error } = await supabase.from("projects")
    .update({
      name: data.name,
      description: data.description,
    })
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
    console.error("Error updating project:", error)
    return { error: "Database error: Could not update project." }
  }

  revalidatePath("/projects")
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteProject(projectId: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const { error } = await supabase.from("projects")
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
    console.error("Error deleting project:", error)
    return { error: "Database error: Could not delete project." }
  }

  revalidatePath("/projects")
  return redirect("/projects")
}

export async function archiveProject(projectId: string) {
  // Note: Archive functionality is disabled until the is_archived column is added to the database
  // You can add this column through the Supabase dashboard: ALTER TABLE projects ADD COLUMN is_archived boolean DEFAULT false;
  return { error: "Archive functionality is not available yet. Please add the is_archived column to the projects table." }
}
