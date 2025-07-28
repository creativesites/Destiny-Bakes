'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import TemplateRenderer from '@/components/templates/TemplateRenderer'
import { CopilotPopup } from '@copilotkit/react-ui'

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

export default function TemplateBasedHomePage() {
  const [template, setTemplate] = useState<PageTemplate | null>(null)
  const [branding, setBranding] = useState<BrandingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPageData = async () => {
      try {
        // Load branding settings
        const brandingResponse = await fetch('/api/branding?public=true')
        const brandingData = await brandingResponse.json()
        
        if (brandingData.success) {
          setBranding(brandingData.settings.branding)
        }

        // Load active home template
        const templateResponse = await fetch('/api/page-templates?type=home&active=true')
        const templateData = await templateResponse.json()
        
        if (templateData.success && templateData.templates.length > 0) {
          setTemplate(templateData.templates[0])
        } else {
          setError('No active home template found')
        }
      } catch (err) {
        console.error('Error loading page data:', err)
        setError('Failed to load page data')
      } finally {
        setLoading(false)
      }
    }

    loadPageData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-cream-50 to-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-400 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your bakery...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-cream-50 to-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-6xl mb-6">🎂</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Our Bakery</h1>
            <p className="text-gray-600 mb-8">
              {error || 'Template not found, but we\'re still here to serve you!'}
            </p>
            <div className="space-y-4">
              <a 
                href="/catalogue" 
                className="inline-block bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
              >
                View Our Cakes
              </a>
              <br />
              <a 
                href="/cake-designer" 
                className="inline-block bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Design Your Cake
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ 
      fontFamily: branding?.fontFamily || 'Poppins, sans-serif' 
    }}>
      <Navbar />
      
      <TemplateRenderer 
        components={template.components}
        styles={template.styles}
        settings={template.settings}
        branding={branding || undefined}
      />

      {/* CopilotKit Integration */}
      <CopilotPopup
        instructions={`You are the AI assistant for ${branding?.businessName || 'this bakery'}. Help customers with:

1. Finding the perfect cake for their occasion
2. Understanding our offerings and customization options
3. Navigating the cake design process
4. Answering questions about pricing, delivery, and availability
5. Guiding them through the ordering process

Our specialties include custom cakes, wedding cakes, birthday cakes, and special occasion treats. We're located in ${branding ? 'Chirundu, Zambia' : 'our local area'} and offer fresh, homemade quality.

Be friendly, helpful, and focus on making their cake dreams come true!`}
        labels={{
          title: `🎂 ${branding?.businessName || 'Bakery'} Assistant`,
          initial: `Hello! I'm here to help you find the perfect cake. Whether you're looking for a birthday surprise, wedding centerpiece, or just want to treat yourself, I can guide you through our delicious options. What kind of celebration are you planning?`,
        }}
        className="copilot-popup-bakery"
      />
    </div>
  )
}