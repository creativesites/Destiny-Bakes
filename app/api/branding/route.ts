import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface BrandingSettings {
  businessName: string
  tagline: string
  logo: string
  favicon: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  headerFont: string
}

interface ContactSettings {
  email: string
  phone: string
  whatsapp: string
  address: string
  city: string
  country: string
  businessHours: any
}

interface SystemSettings {
  currency: string
  timezone: string
  dateFormat: string
  allowGuestOrders: boolean
  requirePhoneVerification: boolean
  enableReviews: boolean
  enableNotifications: boolean
  maintenanceMode: boolean
  googleAnalyticsId: string
  facebookPixelId: string
}

// Default settings for new bakeries
const defaultSettings = {
  branding: {
    businessName: 'Destiny Bakes',
    tagline: 'Crafting delicious memories, one cake at a time',
    logo: '',
    favicon: '',
    primaryColor: '#E91E63',
    secondaryColor: '#FFF8E1',
    accentColor: '#FFD700',
    fontFamily: 'Poppins',
    headerFont: 'Playfair Display'
  },
  contact: {
    email: 'hello@destinybakes.com',
    phone: '+260 123 456 789',
    whatsapp: '+260 123 456 789',
    address: '123 Baker Street',
    city: 'Chirundu',
    country: 'Zambia',
    businessHours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '14:00', closed: false }
    }
  },
  system: {
    currency: 'ZMW',
    timezone: 'Africa/Lusaka',
    dateFormat: 'DD/MM/YYYY',
    allowGuestOrders: true,
    requirePhoneVerification: false,
    enableReviews: true,
    enableNotifications: true,
    maintenanceMode: false,
    googleAnalyticsId: '',
    facebookPixelId: ''
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section') // branding, contact, system
    const publicView = searchParams.get('public') === 'true'

    // For public view, only return non-sensitive branding and contact info
    if (publicView) {
      return NextResponse.json({
        success: true,
        settings: {
          branding: {
            businessName: defaultSettings.branding.businessName,
            tagline: defaultSettings.branding.tagline,
            primaryColor: defaultSettings.branding.primaryColor,
            secondaryColor: defaultSettings.branding.secondaryColor,
            accentColor: defaultSettings.branding.accentColor,
            fontFamily: defaultSettings.branding.fontFamily,
            headerFont: defaultSettings.branding.headerFont
          },
          contact: {
            email: defaultSettings.contact.email,
            phone: defaultSettings.contact.phone,
            address: defaultSettings.contact.address,
            city: defaultSettings.contact.city,
            country: defaultSettings.contact.country,
            businessHours: defaultSettings.contact.businessHours
          }
        }
      })
    }

    // For admin view, check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('clerk_user_id', user.id)
      .single()

    if (userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Return requested section or all settings
    let settings = defaultSettings
    if (section && settings[section as keyof typeof settings]) {
      settings = { [section]: settings[section as keyof typeof settings] } as any
    }

    return NextResponse.json({
      success: true,
      settings
    })

  } catch (error) {
    console.error('Error fetching branding settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('clerk_user_id', user.id)
      .single()

    if (userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { section, settings } = body

    if (!section || !settings) {
      return NextResponse.json({ 
        error: 'Section and settings are required' 
      }, { status: 400 })
    }

    // Validate section
    if (!['branding', 'contact', 'system'].includes(section)) {
      return NextResponse.json({ 
        error: 'Invalid section. Must be branding, contact, or system' 
      }, { status: 400 })
    }

    // In a real implementation, you would save this to the database
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: `${section} settings updated successfully`,
      settings
    })

  } catch (error) {
    console.error('Error updating branding settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('clerk_user_id', user.id)
      .single()

    if (userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { section, key, value } = body

    if (!section || !key || value === undefined) {
      return NextResponse.json({ 
        error: 'Section, key, and value are required' 
      }, { status: 400 })
    }

    // In a real implementation, you would update the specific setting in the database
    return NextResponse.json({
      success: true,
      message: `Updated ${key} in ${section} settings`,
      updated: { section, key, value }
    })

  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    )
  }
}