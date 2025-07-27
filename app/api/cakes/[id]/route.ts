import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cake ID is required' 
      }, { status: 400 })
    }

    const { data: cake, error } = await supabase
      .from('cakes')
      .select('*')
      .eq('id', id)
      .eq('available', true)
      .single()

    if (error) {
      console.error('Error fetching cake:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Cake not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: cake
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}