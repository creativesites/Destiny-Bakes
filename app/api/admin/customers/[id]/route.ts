import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const { id: customerId } = params;
    
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

    // Fetch customer details
    const { data: customer, error: customerError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json({ 
        success: false, 
        error: 'Customer not found' 
      }, { status: 404 })
    }

    // Fetch customer orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_events (
          id,
          event_type,
          description,
          created_at
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Error fetching customer orders:', ordersError)
    }

    // Calculate customer statistics
    const totalOrders = orders?.length || 0
    const totalSpent = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    const lastOrderDate = orders && orders.length > 0 ? orders[0].created_at : null

    // Fetch all order events for this customer
    const orderIds = orders?.map(order => order.id) || []
    let orderEvents: any[] = []
    
    if (orderIds.length > 0) {
      const { data: events } = await supabase
        .from('order_events')
        .select('*')
        .in('order_id', orderIds)
        .order('created_at', { ascending: false })
      
      orderEvents = events || []
    }

    // Add calculated stats to customer object
    const customerWithStats = {
      ...customer,
      total_orders: totalOrders,
      total_spent: totalSpent,
      last_order_date: lastOrderDate
    }

    return NextResponse.json({
      success: true,
      data: {
        customer: customerWithStats,
        orders: orders || [],
        orderEvents
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}