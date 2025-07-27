'use client'
import { useUser } from '@clerk/nextjs'
import { supabase } from './supabase'

export async function getUserRole(clerkUserId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (error) {
      console.error('Error getting user role:', error)
      return null
    }

    return data?.role || 'customer'
  } catch (error) {
    console.error('Error in getUserRole:', error)
    return null
  }
}

export async function isUserAdmin(clerkUserId: string): Promise<boolean> {
  const role = await getUserRole(clerkUserId)
  return role === 'admin'
}

export async function createOrUpdateUserProfile(clerkUser: any): Promise<boolean> {
  try {
    if (!clerkUser) return false

    const userProfile = {
      clerk_user_id: clerkUser.id,
      full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
      email: clerkUser.emailAddresses[0]?.emailAddress,
      phone: clerkUser.phoneNumbers[0]?.phoneNumber,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert(userProfile)

    if (error) {
      console.error('Error creating/updating user profile:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in createOrUpdateUserProfile:', error)
    return false
  }
}

export function useAuthStatus() {
  const { user, isLoaded } = useUser()
  
  return {
    user,
    isLoaded,
    isSignedIn: !!user,
  }
}