import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    const { id } = await params
    
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

    const body = await request.json()
    
    const { data, error } = await supabase
      .from('user_occasions')
      .update({
        name: body.name,
        description: body.description || null,
        date: body.date,
        reminder_days: body.reminder_days || 7,
        category: body.category || 'other',
        notes: body.notes || null,
        recurring: body.recurring || false,
        cake_preferences: body.cake_preferences || {},
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userProfile.id) // Ensure user can only update their own occasions
      .select()
      .single()

    if (error) {
      console.error('Error updating occasion:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update occasion' 
      }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Occasion not found or access denied' 
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    
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

    const { error } = await supabase
      .from('user_occasions')
      .delete()
      .eq('id', id)
      .eq('user_id', userProfile.id) // Ensure user can only delete their own occasions

    if (error) {
      console.error('Error deleting occasion:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete occasion' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Occasion deleted successfully'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}