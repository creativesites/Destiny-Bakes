import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const available = searchParams.get('available')

    let query = supabase
      .from('cakes')
      .select('*')

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    if (available !== 'false') {
      query = query.eq('available', true)
    }

    // Order by featured first, then by name
    query = query.order('featured', { ascending: false })
                 .order('name', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching cakes:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch cakes' 
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
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('cakes')
      .insert([{
        name: body.name,
        description: body.description,
        base_price: body.base_price,
        category: body.category,
        images: body.images || [],
        ingredients: body.ingredients || {},
        allergens: body.allergens || [],
        difficulty_level: body.difficulty_level || 1,
        preparation_time_hours: body.preparation_time_hours || 24,
        featured: body.featured || false,
        available: body.available !== false
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating cake:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create cake' 
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