import { createClient } from '@supabase/supabase-js'
import type { User, UserToken, CleanHistory } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// User operations
export async function createUser(user: Omit<User, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('users')
    .upsert([user], { onConflict: 'email' })
    .select()
    .single()

  if (error) throw error
  return data as User
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as User | null
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as User
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')

  if (error) throw error
  return data as User[]
}

// Token operations
export async function saveUserToken(token: UserToken) {
  const { data, error } = await supabase
    .from('user_tokens')
    .upsert([token], { onConflict: 'user_id' })
    .select()
    .single()

  if (error) throw error
  return data as UserToken
}

export async function getUserToken(userId: string) {
  const { data, error } = await supabase
    .from('user_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as UserToken | null
}

export async function deleteUserToken(userId: string) {
  const { error } = await supabase
    .from('user_tokens')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}

// Clean history operations
export async function saveCleanHistory(history: Omit<CleanHistory, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('clean_history')
    .insert([history])
    .select()
    .single()

  if (error) throw error
  return data as CleanHistory
}

export async function getCleanHistory(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('clean_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as CleanHistory[]
}

export async function getLatestCleanHistory(userId: string) {
  const { data, error } = await supabase
    .from('clean_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as CleanHistory | null
}
