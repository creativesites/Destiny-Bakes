import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    
    const eventData = {
      order_id: params.id,
      event_type: body.event_type,
      description: body.description,
      notes: body.notes || null,
      estimated_completion: body.estimated_completion || null,
      created_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('order_events')
      .insert([eventData])
      .select()
      .single()

    if (error) {
      console.error('Error creating order event:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create order event' 
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