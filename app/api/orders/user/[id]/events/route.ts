import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // Get user profile first
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (!userProfile) {
      return NextResponse.json({ 
        success: false, 
        error: 'User profile not found' 
      }, { status: 404 })
    }

    // Verify the order belongs to the user
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('id', params.id)
      .eq('customer_id', userProfile.id)
      .single()

    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found or access denied' 
      }, { status: 404 })
    }

    // Fetch order events
    const { data, error } = await supabase
      .from('order_events')
      .select('*')
      .eq('order_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching order events:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch order events' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}