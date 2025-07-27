import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// User-specific occasions table
// const createUserOccasionsTable = async () => {
//   const { error } = await supabase.sql`
//     CREATE TABLE IF NOT EXISTS user_occasions (
//       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//       user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
//       name VARCHAR NOT NULL,
//       description TEXT,
//       date DATE NOT NULL,
//       reminder_days INTEGER DEFAULT 7,
//       category VARCHAR DEFAULT 'other',
//       notes TEXT,
//       recurring BOOLEAN DEFAULT false,
//       cake_preferences JSONB DEFAULT '{}'::jsonb,
//       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
//     )
//   `
  
//   if (error && !error.message.includes('already exists')) {
//     console.error('Error creating user_occasions table:', error)
//   }
// }

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // Ensure table exists
    //await createUserOccasionsTable()

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

    const { data, error } = await supabase
      .from('user_occasions')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching occasions:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch occasions' 
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // Ensure table exists
    //await createUserOccasionsTable()

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
      .insert([{
        user_id: userProfile.id,
        name: body.name,
        description: body.description || null,
        date: body.date,
        reminder_days: body.reminder_days || 7,
        category: body.category || 'other',
        notes: body.notes || null,
        recurring: body.recurring || false,
        cake_preferences: body.cake_preferences || {}
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating occasion:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create occasion' 
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