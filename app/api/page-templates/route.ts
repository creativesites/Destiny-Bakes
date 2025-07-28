import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Default templates based on current pages
const DEFAULT_TEMPLATES = {
  home: [
    {
      id: 'home-destiny-default',
      name: 'Destiny Bakes Default',
      description: 'The current homepage design with hero section, featured cakes, and testimonials',
      type: 'home',
      is_active: true,
      components: [
        {
          id: 'hero-main',
          type: 'hero',
          name: 'Main Hero Section',
          content: {
            title: 'Welcome to Destiny Bakes',
            subtitle: 'Crafting delicious memories, one cake at a time',
            buttonText: 'Order Your Dream Cake',
            buttonLink: '/cake-designer',
            backgroundImage: '/images/hero-bg.jpg'
          },
          styles: {
            height: '600px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            padding: '80px 0'
          }
        },
        {
          id: 'featured-cakes',
          type: 'featured-grid',
          name: 'Featured Cakes',
          content: {
            title: 'Our Featured Creations',
            subtitle: 'Handcrafted with love and attention to detail',
            items: [
              { 
                name: 'Chocolate Delight', 
                price: 'ZMW 150', 
                image: '/images/chocolate-cake.jpg',
                description: 'Rich chocolate layers with smooth ganache'
              },
              { 
                name: 'Vanilla Dream', 
                price: 'ZMW 120', 
                image: '/images/vanilla-cake.jpg',
                description: 'Classic vanilla sponge with buttercream'
              },
              { 
                name: 'Strawberry Special', 
                price: 'ZMW 180', 
                image: '/images/strawberry-cake.jpg',
                description: 'Fresh strawberry cake with cream filling'
              }
            ]
          },
          styles: {
            padding: '80px 0',
            backgroundColor: '#ffffff'
          }
        },
        {
          id: 'about-section',
          type: 'about',
          name: 'About Us',
          content: {
            title: 'Our Story',
            text: 'At Destiny Bakes, we believe every celebration deserves a special cake. Located in the heart of Chirundu, Zambia, we have been creating beautiful, delicious cakes for over 5 years.',
            image: '/images/about-us.jpg',
            buttonText: 'Learn More About Us',
            buttonLink: '/about'
          },
          styles: {
            padding: '80px 0',
            backgroundColor: '#f8f9fa'
          }
        },
        {
          id: 'testimonials',
          type: 'testimonials',
          name: 'Customer Reviews',
          content: {
            title: 'What Our Customers Say',
            testimonials: [
              {
                name: 'Sarah Mwanza',
                text: 'Destiny Bakes created the most beautiful wedding cake for us. It was not only gorgeous but tasted incredible!',
                rating: 5,
                image: '/images/customer1.jpg'
              },
              {
                name: 'Michael Banda',
                text: 'Best birthday cake we ever had for our daughter. The unicorn design was perfect and she loved every bite!',
                rating: 5,
                image: '/images/customer2.jpg'
              }
            ]
          },
          styles: {
            padding: '80px 0',
            backgroundColor: '#ffffff'
          }
        },
        {
          id: 'cta-section',
          type: 'cta',
          name: 'Call to Action',
          content: {
            title: 'Ready to Create Your Dream Cake?',
            subtitle: 'Let us bring your vision to life with our custom cake designer',
            buttonText: 'Start Designing Now',
            buttonLink: '/cake-designer',
            backgroundColor: '#E91E63'
          },
          styles: {
            padding: '100px 0',
            textAlign: 'center',
            color: '#ffffff'
          }
        }
      ],
      styles: {
        fontFamily: 'Poppins',
        headerFont: 'Playfair Display',
        primaryColor: '#E91E63',
        secondaryColor: '#FFF8E1',
        accentColor: '#FFD700'
      },
      settings: {
        showNavigation: true,
        showFooter: true,
        enableAnimations: true
      }
    },
    {
      id: 'home-elegant-bakery',
      name: 'Elegant Bakery',
      description: 'Sophisticated design with elegant typography and premium feel',
      type: 'home',
      is_active: false,
      components: [
        {
          id: 'elegant-hero',
          type: 'hero',
          name: 'Elegant Hero Section',
          content: {
            title: '{businessName}',
            subtitle: 'Artisanal Cakes & Confections',
            buttonText: 'Discover Our Creations',
            buttonLink: '/catalogue',
            backgroundImage: '/images/elegant-hero-bg.jpg'
          },
          styles: {
            height: '70vh',
            textAlign: 'center',
            backgroundColor: '#f8f6f3',
            padding: '100px 0',
            color: '#2c1810'
          }
        },
        {
          id: 'signature-collection',
          type: 'featured-grid',
          name: 'Signature Collection',
          content: {
            title: 'Our Signature Collection',
            subtitle: 'Each cake is a masterpiece, crafted with passion and precision',
            items: [
              {
                name: 'Royal Chocolate Torte',
                price: 'ZMW 280',
                image: '/images/royal-chocolate.jpg',
                description: 'Decadent layers of Belgian chocolate with gold leaf accents'
              },
              {
                name: 'Garden Rose Cake',
                price: 'ZMW 320',
                image: '/images/garden-rose.jpg',
                description: 'Delicate vanilla sponge adorned with handcrafted sugar roses'
              }
            ]
          },
          styles: {
            padding: '100px 0',
            backgroundColor: '#ffffff'
          }
        }
      ],
      styles: {
        fontFamily: 'Crimson Text',
        headerFont: 'Playfair Display',
        primaryColor: '#2c1810',
        secondaryColor: '#f8f6f3',
        accentColor: '#d4af37'
      },
      settings: {
        showNavigation: true,
        showFooter: true,
        enableAnimations: true,
        elegantMode: true
      }
    },
    {
      id: 'home-modern-minimal',
      name: 'Modern Minimal',
      description: 'Clean, contemporary design focusing on stunning visuals',
      type: 'home',
      is_active: false,
      components: [
        {
          id: 'minimal-hero',
          type: 'hero',
          name: 'Minimal Hero',
          content: {
            title: 'Pure. Simple. Delicious.',
            subtitle: '{businessName}',
            buttonText: 'Explore',
            buttonLink: '/catalogue'
          },
          styles: {
            height: '100vh',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            padding: '0',
            color: '#000000'
          }
        }
      ],
      styles: {
        fontFamily: 'Inter',
        headerFont: 'Inter',
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        accentColor: '#666666'
      },
      settings: {
        showNavigation: true,
        showFooter: true,
        minimalMode: true
      }
    }
  ],
  catalogue: [
    {
      id: 'catalogue-destiny-default',
      name: 'Destiny Catalogue Default',
      description: 'Current catalogue page with grid layout and filtering',
      type: 'catalogue',
      is_active: true,
      components: [
        {
          id: 'catalogue-hero',
          type: 'hero',
          name: 'Catalogue Header',
          content: {
            title: 'Our Cake Collection',
            subtitle: 'Browse our delicious selection of handcrafted cakes',
            showSearch: true,
            showFilters: true
          },
          styles: {
            height: '400px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            padding: '60px 0'
          }
        },
        {
          id: 'cake-filters',
          type: 'filters',
          name: 'Category Filters',
          content: {
            categories: ['All', 'Birthday', 'Wedding', 'Anniversary', 'Custom'],
            sortOptions: ['Name', 'Price', 'Popularity', 'Newest']
          },
          styles: {
            padding: '40px 0',
            backgroundColor: '#ffffff'
          }
        },
        {
          id: 'cake-grid',
          type: 'product-grid',
          name: 'Cake Grid',
          content: {
            layout: 'grid',
            columns: 3,
            showPricing: true,
            showQuickOrder: true,
            enableWishlist: true
          },
          styles: {
            padding: '40px 0',
            backgroundColor: '#ffffff'
          }
        }
      ],
      styles: {
        fontFamily: 'Poppins',
        headerFont: 'Playfair Display',
        primaryColor: '#E91E63',
        secondaryColor: '#FFF8E1',
        accentColor: '#FFD700'
      },
      settings: {
        itemsPerPage: 12,
        enableInfiniteScroll: false,
        showSidebarFilters: true
      }
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const active = searchParams.get('active') === 'true'

    // For now, return default templates
    // In the future, these will be stored in the database
    let templates: any[] = []
    
    if (type && DEFAULT_TEMPLATES[type as keyof typeof DEFAULT_TEMPLATES]) {
      templates = DEFAULT_TEMPLATES[type as keyof typeof DEFAULT_TEMPLATES]
    } else {
      // Return all templates
      templates = [
        ...DEFAULT_TEMPLATES.home,
        ...DEFAULT_TEMPLATES.catalogue
      ]
    }

    if (active) {
      templates = templates.filter(t => t.is_active)
    }

    return NextResponse.json({
      success: true,
      templates
    })

  } catch (error) {
    console.error('Error fetching page templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch page templates' },
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

    const body = await request.json()
    const { name, description, type, components, styles, settings, preview_image } = body

    if (!name || !type || !components) {
      return NextResponse.json({ 
        error: 'Name, type, and components are required' 
      }, { status: 400 })
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

    // For now, we'll store in a simple JSON format
    // Later this can be moved to a proper database table
    const template = {
      id: `${type}-${Date.now()}`,
      name,
      description,
      type,
      components,
      styles: styles || {},
      settings: settings || {},
      preview_image,
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      template
    })

  } catch (error) {
    console.error('Error creating page template:', error)
    return NextResponse.json(
      { error: 'Failed to create page template' },
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

    const body = await request.json()
    const { templateId, components, styles, settings, is_active, name, description } = body

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
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

    // For now, return success - in real implementation this would update the database
    const updatedTemplate = {
      id: templateId,
      name,
      description,
      components,
      styles,
      settings,
      is_active,
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      template: updatedTemplate
    })

  } catch (error) {
    console.error('Error updating page template:', error)
    return NextResponse.json(
      { error: 'Failed to update page template' },
      { status: 500 }
    )
  }
}