import { createClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getUser(): Promise<User | null> {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  const supabase = createClient(cookies())
  
  // Use maybeSingle() to avoid errors when no profile exists
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  
  // If no profile exists, try to create one automatically
  if (!profile) {
    console.log('No profile found for user, attempting to create one')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.id === userId) {
        const newProfile = await createUserProfile(user)
        return newProfile
      }
    } catch (createError) {
      console.error('Error creating profile automatically:', createError)
    }
    return null
  }
  
  return profile
}

export async function requireAuth(): Promise<User> {
  const user = await getUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function createUserProfile(user: User) {
  const supabase = createClient(cookies())
  
  // Check if profile already exists using maybeSingle to avoid errors
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
  
  if (existingProfile) {
    return existingProfile
  }
  
  // Create new profile with only columns that exist in the current schema
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      username: user.email?.split('@')[0] || '',
      full_name: user.user_metadata?.first_name && user.user_metadata?.last_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        : user.email?.split('@')[0] || '',
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating profile:', error)
    throw error
  }
  
  return profile
}

export function useAuthClient() {
  return createBrowserClient()
} 