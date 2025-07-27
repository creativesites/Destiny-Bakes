import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      cake_config, 
      delivery_date, 
      delivery_time, 
      delivery_address, 
      special_instructions,
      total_amount 
    } = body

    // Validate required fields
    if (!cake_config || !delivery_date || !delivery_address || !total_amount) {
      return NextResponse.json({ 
        error: 'Missing required fields: cake_config, delivery_date, delivery_address, total_amount' 
      }, { status: 400 })
    }

    // Generate order number
    const orderNumber = `DB${Date.now().toString().slice(-8)}`

    // Create order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        order_number: orderNumber,
        cake_config,
        total_amount,
        delivery_date,
        delivery_time,
        delivery_address,
        special_instructions,
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'airtel_money'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating order:', error)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create initial order event
    await supabase
      .from('order_events')
      .insert({
        order_id: order.id,
        event_type: 'order_placed',
        description: 'Order placed by customer',
        created_by: user.id
      })

    return NextResponse.json({
      success: true,
      order,
      payment_instructions: {
        method: 'airtel_money',
        phone_number: '0974147414',
        amount: total_amount,
        reference: orderNumber,
        instructions: [
          'Dial *115# on your Airtel phone',
          'Select option 5 (Send Money)',
          'Enter recipient number: 0974147414',
          `Enter amount: ZMW ${total_amount}`,
          `Reference: ${orderNumber}`,
          'Follow prompts to complete payment',
          'Click "Payment Complete" button below once transaction is done'
        ]
      }
    })

  } catch (error) {
    console.error('Error in order creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_events(*)
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    return NextResponse.json({ orders })

  } catch (error) {
    console.error('Error in orders fetch:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}