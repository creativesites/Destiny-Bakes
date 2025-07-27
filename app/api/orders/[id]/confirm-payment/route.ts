import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth-server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const orderId = params.id

    // Verify order belongs to user
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('customer_id', user.id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ error: 'Payment already confirmed' }, { status: 400 })
    }

    // Update order payment status
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_status: 'paid',
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order:', updateError)
      return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 })
    }

    // Create order event
    await supabase
      .from('order_events')
      .insert({
        order_id: orderId,
        event_type: 'payment_confirmed',
        description: 'Customer confirmed Airtel Money payment',
        created_by: user.id
      })

    // In a real implementation, you would also:
    // 1. Send WhatsApp notification to business
    // 2. Send confirmation SMS/email to customer
    // 3. Update inventory if applicable

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully. You will receive a WhatsApp confirmation within 5 minutes.',
      order: {
        ...order,
        payment_status: 'paid',
        status: 'confirmed'
      }
    })

  } catch (error) {
    console.error('Error confirming payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}