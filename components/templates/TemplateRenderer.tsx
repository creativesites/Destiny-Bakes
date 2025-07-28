'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface TemplateComponent {
  id: string
  type: string
  name: string
  content: any
  styles: any
}

interface BrandingSettings {
  businessName: string
  tagline: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  headerFont: string
}

interface TemplateRendererProps {
  components: TemplateComponent[]
  styles?: any
  settings?: any
  branding?: BrandingSettings
  isPreview?: boolean
}

export default function TemplateRenderer({ 
  components, 
  styles = {}, 
  settings = {}, 
  branding,
  isPreview = false 
}: TemplateRendererProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Apply branding styles
  const brandingStyles = branding ? {
    '--primary-color': branding.primaryColor,
    '--secondary-color': branding.secondaryColor,
    '--accent-color': branding.accentColor,
    '--font-family': branding.fontFamily,
    '--header-font': branding.headerFont,
  } as React.CSSProperties : {}

  const globalStyles = {
    fontFamily: styles.fontFamily || branding?.fontFamily || 'Poppins, sans-serif',
    ...styles,
    ...brandingStyles
  }

  if (!mounted) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-400"></div>
    </div>
  }

  return (
    <div style={globalStyles} className="template-renderer">
      {/* Inject custom CSS if in preview mode */}
      {isPreview && branding && (
        <style jsx global>{`
          .template-renderer {
            --primary-color: ${branding.primaryColor};
            --secondary-color: ${branding.secondaryColor};
            --accent-color: ${branding.accentColor};
            --font-family: ${branding.fontFamily}, sans-serif;
            --header-font: ${branding.headerFont}, serif;
          }
          
          .template-renderer * {
            font-family: var(--font-family);
          }
          
          .template-renderer h1, 
          .template-renderer h2, 
          .template-renderer h3, 
          .template-renderer h4, 
          .template-renderer h5, 
          .template-renderer h6 {
            font-family: var(--header-font);
          }
          
          .template-renderer .btn-primary {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
          }
          
          .template-renderer .btn-primary:hover {
            background-color: color-mix(in srgb, var(--primary-color) 80%, black);
            border-color: color-mix(in srgb, var(--primary-color) 80%, black);
          }
        `}</style>
      )}

      {components.map((component, index) => (
        <ComponentRenderer 
          key={component.id || index}
          component={component} 
          branding={branding}
          isPreview={isPreview}
        />
      ))}
    </div>
  )
}

function ComponentRenderer({ 
  component, 
  branding, 
  isPreview = false 
}: { 
  component: TemplateComponent
  branding?: BrandingSettings
  isPreview?: boolean 
}) {
  const { type, content, styles } = component

  // Replace placeholders with branding data
  const processContent = (content: any): any => {
    if (!branding) return content
    
    const processValue = (value: any): any => {
      if (typeof value === 'string') {
        return value
          .replace(/\{businessName\}/g, branding.businessName)
          .replace(/\{tagline\}/g, branding.tagline)
      }
      if (Array.isArray(value)) {
        return value.map(item => processValue(item))
      }
      if (typeof value === 'object' && value !== null) {
        const processed: any = {}
        for (const [key, val] of Object.entries(value)) {
          processed[key] = processValue(val)
        }
        return processed
      }
      return value
    }
    
    return processValue(content)
  }

  const processedContent = processContent(content)
  
  // Debug logging for development
  if (process.env.NODE_ENV === 'development' && type === 'featured-grid') {
    console.log('Component content:', content)
    console.log('Processed content:', processedContent)
    console.log('Items array check:', Array.isArray(processedContent.items))
  }
  
  const baseStyle = {
    ...styles,
    minHeight: '100px'
  }

  // Apply branding colors to background if specified
  if (branding && styles.backgroundColor === '{primaryColor}') {
    baseStyle.backgroundColor = branding.primaryColor
  }
  if (branding && styles.backgroundColor === '{secondaryColor}') {
    baseStyle.backgroundColor = branding.secondaryColor
  }

  switch (type) {
    case 'hero':
      return (
        <div style={baseStyle} className="flex items-center justify-center text-center relative bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="z-10 max-w-4xl mx-auto px-6">
            <h1 
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ 
                fontFamily: branding?.headerFont || 'Playfair Display, serif',
                color: styles.color || '#1f2937'
              }}
            >
              {processedContent.title}
            </h1>
            <p 
              className="text-xl md:text-2xl mb-8 opacity-90"
              style={{ color: styles.color || '#6b7280' }}
            >
              {processedContent.subtitle}
            </p>
            {processedContent.buttonText && (
              <Link href={processedContent.buttonLink || '#'}>
                <Button 
                  className="btn-primary text-white px-8 py-4 text-lg font-semibold rounded-xl hover:scale-105 transition-all duration-300"
                  style={{ 
                    backgroundColor: branding?.primaryColor || '#E91E63',
                    borderColor: branding?.primaryColor || '#E91E63'
                  }}
                >
                  {processedContent.buttonText}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )

    case 'featured-grid':
      return (
        <div style={baseStyle} className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ 
                  fontFamily: branding?.headerFont || 'Playfair Display, serif',
                  color: '#1f2937'
                }}
              >
                {processedContent.title}
              </h2>
              {processedContent.subtitle && (
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {processedContent.subtitle}
                </p>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.isArray(processedContent.items) && processedContent.items.length > 0 ? processedContent.items.map((item: any, index: number) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl">🎂</span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2">{item.name}</h3>
                    {item.description && (
                      <p className="text-gray-600 mb-4 text-sm">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-xl font-bold"
                        style={{ color: branding?.primaryColor || '#E91E63' }}
                      >
                        {item.price}
                      </span>
                      <Button 
                        size="sm"
                        className="btn-primary"
                        style={{ 
                          backgroundColor: branding?.primaryColor || '#E91E63',
                          borderColor: branding?.primaryColor || '#E91E63'
                        }}
                      >
                        Order Now
                      </Button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-8">
                  <div className="text-4xl mb-4 opacity-30">🎂</div>
                  <p className="text-gray-600">No featured items to display</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )

    case 'testimonials':
      return (
        <div style={baseStyle} className="py-16">
          <div className="container mx-auto px-6">
            <h2 
              className="text-3xl md:text-4xl font-bold text-center mb-12"
              style={{ 
                fontFamily: branding?.headerFont || 'Playfair Display, serif',
                color: '#1f2937'
              }}
            >
              {processedContent.title}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.isArray(processedContent.testimonials) && processedContent.testimonials.length > 0 ? processedContent.testimonials.map((testimonial: any, index: number) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                      {testimonial.image ? (
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-xl">👤</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{testimonial.name}</h4>
                      <div className="flex text-yellow-500">
                        {'⭐'.repeat(testimonial.rating || 5)}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic leading-relaxed">"{testimonial.text}"</p>
                </div>
              )) : (
                <div className="col-span-full text-center py-8">
                  <div className="text-4xl mb-4 opacity-30">💬</div>
                  <p className="text-gray-600">No testimonials to display</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )

    case 'about':
      return (
        <div style={baseStyle} className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 
                  className="text-3xl md:text-4xl font-bold mb-6"
                  style={{ 
                    fontFamily: branding?.headerFont || 'Playfair Display, serif',
                    color: '#1f2937'
                  }}
                >
                  {processedContent.title}
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                  {processedContent.text}
                </p>
                {processedContent.buttonText && (
                  <Link href={processedContent.buttonLink || '#'}>
                    <Button 
                      className="btn-primary text-white px-6 py-3 font-semibold rounded-xl"
                      style={{ 
                        backgroundColor: branding?.primaryColor || '#E91E63',
                        borderColor: branding?.primaryColor || '#E91E63'
                      }}
                    >
                      {processedContent.buttonText}
                    </Button>
                  </Link>
                )}
              </div>
              <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center overflow-hidden">
                {processedContent.image ? (
                  <img 
                    src={processedContent.image} 
                    alt={processedContent.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">👋</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )

    case 'contact':
      return (
        <div style={baseStyle} className="py-16">
          <div className="container mx-auto px-6">
            <h2 
              className="text-3xl md:text-4xl font-bold text-center mb-12"
              style={{ 
                fontFamily: branding?.headerFont || 'Playfair Display, serif',
                color: '#1f2937'
              }}
            >
              {processedContent.title}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div className="p-6">
                <div className="text-4xl mb-4">📞</div>
                <h3 className="font-bold text-lg mb-2">Phone</h3>
                <p className="text-gray-600">{processedContent.phone}</p>
              </div>
              <div className="p-6">
                <div className="text-4xl mb-4">📧</div>
                <h3 className="font-bold text-lg mb-2">Email</h3>
                <p className="text-gray-600">{processedContent.email}</p>
              </div>
              <div className="p-6">
                <div className="text-4xl mb-4">📍</div>
                <h3 className="font-bold text-lg mb-2">Address</h3>
                <p className="text-gray-600">{processedContent.address}</p>
              </div>
              <div className="p-6">
                <div className="text-4xl mb-4">🕒</div>
                <h3 className="font-bold text-lg mb-2">Hours</h3>
                <p className="text-gray-600">{processedContent.hours}</p>
              </div>
            </div>
          </div>
        </div>
      )

    case 'cta':
      return (
        <div 
          style={{
            ...baseStyle, 
            backgroundColor: processedContent.backgroundColor || branding?.primaryColor || '#E91E63'
          }} 
          className="text-center text-white py-20"
        >
          <div className="container mx-auto px-6">
            <h2 
              className="text-3xl md:text-5xl font-bold mb-6"
              style={{ fontFamily: branding?.headerFont || 'Playfair Display, serif' }}
            >
              {processedContent.title}
            </h2>
            <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto">
              {processedContent.subtitle}
            </p>
            <Link href={processedContent.buttonLink || '#'}>
              <Button 
                className="bg-white text-gray-800 px-10 py-4 text-lg font-bold rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300"
              >
                {processedContent.buttonText}
              </Button>
            </Link>
          </div>
        </div>
      )

    case 'text':
      return (
        <div style={baseStyle} className="py-16">
          <div className="container mx-auto px-6">
            <div 
              className="prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: processedContent.html }}
            />
          </div>
        </div>
      )

    default:
      return (
        <div style={baseStyle} className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-6xl mb-4 opacity-30">🧩</div>
            <p className="text-gray-600">Component: {component.name}</p>
          </div>
        </div>
      )
  }
}