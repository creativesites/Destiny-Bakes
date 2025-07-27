"use server"
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabase } from './supabase'
import type { UserProfile } from '@/types/database'

export async function getCurrentUser(): Promise<UserProfile | null> {
  const { userId } = await auth()
  
  if (!userId) return null

  // First check if user exists in our database
  const { data: existingUser } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', userId)
    .single()

  if (existingUser) {
    return existingUser
  }

  // If user doesn't exist, create them from Clerk data
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const newUser = {
    clerk_user_id: userId,
    full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
    email: clerkUser.emailAddresses[0]?.emailAddress,
    phone: clerkUser.phoneNumbers[0]?.phoneNumber,
    role: 'customer' as const,
  }

  const { data: createdUser, error } = await supabase
    .from('user_profiles')
    .insert(newUser)
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }

  return createdUser
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const { userId } = await auth()
  
  if (!userId) return null

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('clerk_user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    return null
  }

  return data
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  
  if (user.role !== 'admin') {
    throw new Error('Admin access required')
  }
  
  return user
}