'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import TemplateRenderer from '@/components/templates/TemplateRenderer'
import { Button } from '@/components/ui/Button'

interface BrandingSettings {
  businessName: string
  tagline: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  headerFont: string
}

interface PageTemplate {
  id: string
  name: string
  type: string
  components: any[]
  styles: any
  settings: any
}

interface CatalogCake {
  id: string
  name: string
  description: string
  base_price: number
  images: string[]
  category: string
  featured: boolean
}

export default function TemplateCataloguePage() {
  const [template, setTemplate] = useState<PageTemplate | null>(null)
  const [branding, setBranding] = useState<BrandingSettings | null>(null)
  const [cakes, setCakes] = useState<CatalogCake[]>([])
  const [filteredCakes, setFilteredCakes] = useState<CatalogCake[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = ['All', 'Birthday', 'Wedding', 'Anniversary', 'Custom', 'Cupcakes']

  useEffect(() => {
    const loadPageData = async () => {
      try {
        // Load branding settings
        const brandingResponse = await fetch('/api/branding?public=true')
        const brandingData = await brandingResponse.json()
        
        if (brandingData.success) {
          setBranding(brandingData.settings.branding)
        }

        // Load active catalogue template
        const templateResponse = await fetch('/api/page-templates?type=catalogue&active=true')
        const templateData = await templateResponse.json()
        
        if (templateData.success && templateData.templates.length > 0) {
          setTemplate(templateData.templates[0])
        }

        // Load cake catalog
        // For demo purposes, using static data
        const demoCakes: CatalogCake[] = [
          {
            id: '1',
            name: 'Classic Chocolate Cake',
            description: 'Rich chocolate layers with smooth ganache frosting',
            base_price: 150,
            images: ['/images/chocolate-cake.jpg'],
            category: 'Birthday',
            featured: true
          },
          {
            id: '2',
            name: 'Vanilla Wedding Cake',
            description: 'Elegant three-tier vanilla cake with buttercream roses',
            base_price: 450,
            images: ['/images/wedding-cake.jpg'],
            category: 'Wedding',
            featured: true
          },
          {
            id: '3',
            name: 'Strawberry Delight',
            description: 'Fresh strawberry cake with cream filling',
            base_price: 180,
            images: ['/images/strawberry-cake.jpg'],
            category: 'Birthday',
            featured: false
          },
          {
            id: '4',
            name: 'Anniversary Special',
            description: 'Heart-shaped red velvet with cream cheese frosting',
            base_price: 220,
            images: ['/images/anniversary-cake.jpg'],
            category: 'Anniversary',
            featured: true
          },
          {
            id: '5',
            name: 'Custom Design Cake',
            description: 'Personalized cake designed to your specifications',
            base_price: 300,
            images: ['/images/custom-cake.jpg'],
            category: 'Custom',
            featured: false
          },
          {
            id: '6',
            name: 'Birthday Cupcakes (Dozen)',
            description: 'Assorted flavored cupcakes with colorful frosting',
            base_price: 80,
            images: ['/images/cupcakes.jpg'],
            category: 'Cupcakes',
            featured: true
          }
        ]

        setCakes(demoCakes)
        setFilteredCakes(demoCakes)
      } catch (err) {
        console.error('Error loading page data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPageData()
  }, [])

  useEffect(() => {
    let filtered = cakes

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(cake => cake.category === selectedCategory)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(cake => 
        cake.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cake.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredCakes(filtered)
  }, [selectedCategory, searchTerm, cakes])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-cream-50 to-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-400 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading our delicious catalog...</p>
          </div>
        </div>
      </div>
    )
  }

  // Create a custom template for catalogue if none exists
  const catalogueTemplate = template || {
    id: 'catalogue-default',
    name: 'Default Catalogue',
    type: 'catalogue',
    components: [
      {
        id: 'catalogue-hero',
        type: 'hero',
        name: 'Catalogue Header',
        content: {
          title: 'Our Cake Collection',
          subtitle: 'Browse our delicious selection of handcrafted cakes',
        },
        styles: {
          height: '400px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          padding: '60px 0'
        }
      }
    ],
    styles: {},
    settings: {}
  }

  return (
    <div className="min-h-screen" style={{ 
      fontFamily: branding?.fontFamily || 'Poppins, sans-serif' 
    }}>
      <Navbar />
      
      {/* Render template components */}
      <TemplateRenderer 
        components={catalogueTemplate.components}
        styles={catalogueTemplate.styles}
        settings={catalogueTemplate.settings}
        branding={branding || undefined}
      />

      {/* Catalog Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          {/* Search and Filters */}
          <div className="mb-12">
            {/* Search Bar */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search cakes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md mx-auto block px-6 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category ? (branding?.primaryColor || '#E91E63') : undefined
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="text-center mb-8">
            <p className="text-gray-600">
              Showing {filteredCakes.length} of {cakes.length} cakes
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>

          {/* Cake Grid */}
          {filteredCakes.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6 opacity-30">🎂</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No cakes found</h3>
              <p className="text-gray-600 mb-8">
                Try adjusting your search or category filter
              </p>
              <Button 
                onClick={() => {
                  setSelectedCategory('All')
                  setSearchTerm('')
                }}
                style={{ backgroundColor: branding?.primaryColor || '#E91E63' }}
                className="text-white"
              >
                Show All Cakes
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCakes.map(cake => (
                <div key={cake.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                  {/* Featured Badge */}
                  {cake.featured && (
                    <div className="absolute top-4 left-4 z-10">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: branding?.accentColor || '#FFD700' }}
                      >
                        ⭐ Featured
                      </span>
                    </div>
                  )}

                  {/* Cake Image */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                    {cake.images.length > 0 ? (
                      <img 
                        src={cake.images[0]} 
                        alt={cake.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.parentElement?.classList.add('flex', 'items-center', 'justify-center')
                          if (target.parentElement) {
                            target.parentElement.innerHTML = '<span class="text-6xl">🎂</span>'
                          }
                        }}
                      />
                    ) : (
                      <span className="text-6xl">🎂</span>
                    )}
                  </div>

                  {/* Cake Details */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-xl">{cake.name}</h3>
                      <span 
                        className="text-xs px-2 py-1 rounded-full text-white"
                        style={{ backgroundColor: branding?.primaryColor || '#E91E63' }}
                      >
                        {cake.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {cake.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-2xl font-bold"
                        style={{ color: branding?.primaryColor || '#E91E63' }}
                      >
                        ZMW {cake.base_price}
                      </span>
                      <div className="space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          style={{ borderColor: branding?.primaryColor || '#E91E63', color: branding?.primaryColor || '#E91E63' }}
                        >
                          Details
                        </Button>
                        <Button 
                          size="sm"
                          style={{ backgroundColor: branding?.primaryColor || '#E91E63' }}
                          className="text-white"
                        >
                          Order Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-gray-50 rounded-2xl p-12">
              <h3 
                className="text-3xl font-bold mb-4"
                style={{ 
                  fontFamily: branding?.headerFont || 'Playfair Display, serif',
                  color: '#1f2937'
                }}
              >
                Don't see what you're looking for?
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                We specialize in custom cakes designed exactly to your vision
              </p>
              <Button 
                className="text-white px-8 py-4 text-lg font-semibold rounded-xl"
                style={{ backgroundColor: branding?.primaryColor || '#E91E63' }}
              >
                Design Your Custom Cake
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}