import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('clerk_user_id', userId)
      .single()

    if (!adminProfile || adminProfile.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Access denied' 
      }, { status: 403 })
    }

    // Fetch customers with aggregated order data
    const { data: customers, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        clerk_user_id,
        full_name,
        email,
        phone,
        role,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching customers:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch customers' 
      }, { status: 500 })
    }

    // Get order statistics for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const { data: orderStats } = await supabase
          .from('orders')
          .select('total_amount, created_at')
          .eq('customer_id', customer.id)

        const totalOrders = orderStats?.length || 0
        const totalSpent = orderStats?.reduce((sum, order) => sum + order.total_amount, 0) || 0
        const lastOrderDate = orderStats && orderStats.length > 0 
          ? orderStats.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null

        return {
          ...customer,
          total_orders: totalOrders,
          total_spent: totalSpent,
          last_order_date: lastOrderDate
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: customersWithStats
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}