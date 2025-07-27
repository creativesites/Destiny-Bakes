'use client'
import { supabase } from './supabase'

export async function isAdmin(clerkUserId: string): Promise<boolean> {
  try {
    if (!clerkUserId) return false

    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }

    return data?.role === 'admin'
  } catch (error) {
    console.error('Error in isAdmin:', error)
    return false
  }
}

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

export async function setUserRole(adminClerkUserId: string, targetClerkUserId: string, role: 'customer' | 'admin' | 'baker'): Promise<boolean> {
  try {
    // Only admins can set roles
    const isCurrentUserAdmin = await isAdmin(adminClerkUserId)
    if (!isCurrentUserAdmin) {
      throw new Error('Only admins can set user roles')
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('clerk_user_id', targetClerkUserId)

    if (error) {
      console.error('Error setting user role:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in setUserRole:', error)
    return false
  }
}

export async function setSelfAsAdmin(clerkUserId: string, userData: any): Promise<boolean> {
  try {
    if (!clerkUserId || !userData) return false

    // First, check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    const userProfile = {
      clerk_user_id: clerkUserId,
      full_name: userData.fullName || `${userData.firstName} ${userData.lastName}` || 'Admin User',
      email: userData.emailAddresses[0]?.emailAddress,
      role: 'admin' as const,
      updated_at: new Date().toISOString()
    }

    let error: any = null

    if (existingUser) {
      // User exists, update their role to admin
      const result = await supabase
        .from('user_profiles')
        .update({ 
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('clerk_user_id', clerkUserId)
      
      error = result.error
    } else {
      // User doesn't exist, create new profile
      const result = await supabase
        .from('user_profiles')
        .insert([userProfile])
      
      error = result.error
    }

    if (error) {
      console.error('Error setting self as admin:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in setSelfAsAdmin:', error)
    return false
  }
}

export interface AdminStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  totalCustomers: number
  averageOrderValue: number
}

export async function getAdminStats(clerkUserId: string): Promise<AdminStats | null> {
  try {
    const adminStatus = await isAdmin(clerkUserId)
    if (!adminStatus) {
      throw new Error('Admin access required')
    }

    // Get order statistics
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('status, total_amount, payment_status')

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return null
    }

    // Get customer count
    const { count: customerCount, error: customerError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')

    if (customerError) {
      console.error('Error fetching customer count:', customerError)
      return null
    }

    const totalOrders = orders?.length || 0
    const pendingOrders = orders?.filter(o => ['pending', 'confirmed', 'preparing', 'baking', 'decorating'].includes(o.status)).length || 0
    const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0
    const totalRevenue = orders?.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + Number(o.total_amount), 0) || 0
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      totalCustomers: customerCount || 0,
      averageOrderValue
    }
  } catch (error) {
    console.error('Error in getAdminStats:', error)
    return null
  }
}