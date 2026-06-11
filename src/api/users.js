import { supabase } from '../lib/supabase'

/**
 * Get the profile of the currently logged-in user.
 */
export async function getCurrentUser() {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

/**
 * Update the current user's profile.
 * @param {Object} updates - Fields to update (e.g. { first_name, last_name })
 */
export async function updateUserProfile(updates) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Sign up a new user with email and password.
 * Also inserts a row into the public users table.
 */
export async function signUp({ email, password, firstName, lastName }) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error

  // Insert into public.users to store profile data
  const { error: profileError } = await supabase.from('users').insert([{
    id: data.user.id,
    email,
    first_name: firstName,
    last_name: lastName,
  }])

  if (profileError) throw profileError
  return data.user
}

/**
 * Sign in with email and password.
 */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
