'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import TemplateRenderer from '@/components/templates/TemplateRenderer'
import { Button } from '@/components/ui/Button'

interface PageTemplate {
  id: string
  name: string
  type: string
  components: any[]
  styles: any
  settings: any
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

export default function TemplatePreview() {
  const params = useParams()
  const templateId = params.templateId as string
  const [template, setTemplate] = useState<PageTemplate | null>(null)
  const [branding, setBranding] = useState<BrandingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  useEffect(() => {
    const loadPreviewData = async () => {
      try {
        // Load branding settings
        const brandingResponse = await fetch('/api/branding?public=true')
        const brandingData = await brandingResponse.json()
        
        if (brandingData.success) {
          setBranding(brandingData.settings.branding)
        }

        // Load template data
        const templateResponse = await fetch('/api/page-templates')
        const templateData = await templateResponse.json()
        
        if (templateData.success) {
          const foundTemplate = templateData.templates.find((t: PageTemplate) => t.id === templateId)
          if (foundTemplate) {
            setTemplate(foundTemplate)
          }
        }
      } catch (error) {
        console.error('Error loading preview data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPreviewData()
  }, [templateId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template preview...</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Template Not Found</h1>
          <p className="text-gray-600 mb-8">The requested template could not be loaded.</p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const deviceStyles = {
    desktop: { width: '100%', height: '100vh' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Preview Controls */}
      <div className="bg-white shadow-lg border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              size="sm"
            >
              ← Back
            </Button>
            <div>
              <h1 className="font-bold text-lg">{template.name}</h1>
              <p className="text-sm text-gray-600 capitalize">{template.type} Template Preview</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Device View Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { key: 'desktop', icon: '🖥️', label: 'Desktop' },
                { key: 'tablet', icon: '📱', label: 'Tablet' },
                { key: 'mobile', icon: '📱', label: 'Mobile' }
              ].map(device => (
                <button
                  key={device.key}
                  onClick={() => setDeviceView(device.key as any)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    deviceView === device.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={device.label}
                >
                  {device.icon}
                </button>
              ))}
            </div>

            <Button 
              onClick={() => window.open(`/admin/pages/builder/${templateId}`, '_blank')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              ✏️ Edit Template
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex items-center justify-center p-8 min-h-[calc(100vh-80px)]">
        <div 
          className="bg-white shadow-2xl rounded-lg overflow-hidden"
          style={{
            ...deviceStyles[deviceView],
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 160px)',
            transform: deviceView !== 'desktop' ? 'scale(0.8)' : 'none',
            transformOrigin: 'top center'
          }}
        >
          <div className="h-full overflow-y-auto">
            {/* Simulated Browser Bar for Desktop */}
            {deviceView === 'desktop' && (
              <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-600">
                  {branding?.businessName?.toLowerCase().replace(/\s+/g, '') || 'destinybakes'}.com
                </div>
              </div>
            )}

            {/* Template Render */}
            <TemplateRenderer 
              components={template.components}
              styles={template.styles}
              settings={template.settings}
              branding={branding || undefined}
              isPreview={true}
            />
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <h3 className="font-bold text-gray-800 mb-2">Preview Info</h3>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Template:</span>
            <span className="font-medium">{template.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium capitalize">{template.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Components:</span>
            <span className="font-medium">{template.components.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">View:</span>
            <span className="font-medium capitalize">{deviceView}</span>
          </div>
        </div>
      </div>
    </div>
  )
}