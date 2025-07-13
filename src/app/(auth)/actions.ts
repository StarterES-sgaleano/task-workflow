'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

import { createUserProfile } from '@/lib/auth'

function createClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function login(formData: FormData) {
  const supabase = createClient()

  // type-casting here for convenience
  // in a real app you should use a schema validation library like zod
  const data = Object.fromEntries(formData.entries()) as { [key: string]: string };

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const data = Object.fromEntries(formData.entries()) as { [key: string]: string };

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
      },
    },
  })

  if (error) {
    return redirect('/signup?message=Could not create account')
  }

  // Create user profile if user was created successfully
  if (authData.user) {
    try {
      await createUserProfile(authData.user)
    } catch (profileError) {
      console.error('Error creating user profile:', profileError)
      // Continue with signup even if profile creation fails
    }
  }

  return redirect('/login?message=Check email to continue sign in process')
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return redirect('/login')
}
