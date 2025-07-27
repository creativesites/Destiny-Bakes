import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:user_profiles!customer_id(
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch order' 
      }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const updateData: any = {}
    
    if (body.status) {
      updateData.status = body.status
      
      // Create order event for status change
      await supabase
        .from('order_events')
        .insert([{
          order_id: id,
          event_type: `Status changed to ${body.status}`,
          description: `Order status updated to ${body.status}`,
          created_at: new Date().toISOString()
        }])
    }
    
    if (body.payment_status) {
      updateData.payment_status = body.payment_status
      
      // Create order event for payment status change
      await supabase
        .from('order_events')
        .insert([{
          order_id: id,
          event_type: `Payment status changed to ${body.payment_status}`,
          description: `Payment status updated to ${body.payment_status}`,
          created_at: new Date().toISOString()
        }])
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No valid fields to update' 
      }, { status: 400 })
    }

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update order' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}