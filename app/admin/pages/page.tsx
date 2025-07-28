'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Link from 'next/link'

interface PageTemplate {
  id: string
  name: string
  description: string
  type: 'home' | 'about' | 'contact' | 'catalogue' | 'cake-designer'
  isActive: boolean
  preview: string
  components: any[]
  lastModified: Date
}

const defaultTemplates: PageTemplate[] = [
  {
    id: 'home-destiny-default',
    name: 'Destiny Default',
    description: 'Current homepage design with hero, featured cakes, and testimonials',
    type: 'home',
    isActive: true,
    preview: '/admin/pages/templates/home-destiny/preview.jpg',
    components: [],
    lastModified: new Date()
  },
  {
    id: 'home-elegant',
    name: 'Elegant Home',
    description: 'A sophisticated homepage with hero section, featured cakes, and testimonials',
    type: 'home',
    isActive: false,
    preview: '/admin/pages/templates/home-elegant/preview.jpg',
    components: [],
    lastModified: new Date()
  },
  {
    id: 'home-modern',
    name: 'Modern Home',
    description: 'Clean, minimalist homepage with focus on visual elements',
    type: 'home',
    isActive: false,
    preview: '/admin/pages/templates/home-modern/preview.jpg',
    components: [],
    lastModified: new Date()
  },
  {
    id: 'home-classic',
    name: 'Classic Home',
    description: 'Traditional bakery homepage with warm, welcoming design',
    type: 'home',
    isActive: false,
    preview: '/admin/pages/templates/home-classic/preview.jpg',
    components: [],
    lastModified: new Date()
  },
  {
    id: 'about-story',
    name: 'Our Story',
    description: 'Personal about page focusing on the baker\'s journey',
    type: 'about',
    isActive: true,
    preview: '/admin/pages/templates/about-story/preview.jpg',
    components: [],
    lastModified: new Date()
  },
  {
    id: 'about-team',
    name: 'Meet the Team',
    description: 'Team-focused about page with member profiles',
    type: 'about',
    isActive: false,
    preview: '/admin/pages/templates/about-team/preview.jpg',
    components: [],
    lastModified: new Date()
  },
  {
    id: 'about-values',
    name: 'Our Values',
    description: 'Values and mission-driven about page',
    type: 'about',
    isActive: false,
    preview: '/admin/pages/templates/about-values/preview.jpg',
    components: [],
    lastModified: new Date()
  },
  {
    id: 'contact-simple',
    name: 'Simple Contact',
    description: 'Clean contact form with location and hours',
    type: 'contact',
    isActive: true,
    preview: '/admin/pages/templates/contact-simple/preview.jpg',
    components: [],
    lastModified: new Date()
  },
  {
    id: 'contact-detailed',
    name: 'Detailed Contact',
    description: 'Comprehensive contact page with map and multiple contact methods',
    type: 'contact',
    isActive: false,
    preview: '/admin/pages/templates/contact-detailed/preview.jpg',
    components: [],
    lastModified: new Date()
  },
  {
    id: 'catalogue-destiny-default',
    name: 'Destiny Catalogue',
    description: 'Current catalogue page with grid layout and filtering',
    type: 'catalogue',
    isActive: true,
    preview: '/admin/pages/templates/catalogue-destiny/preview.jpg',
    components: [],
    lastModified: new Date()
  },
  {
    id: 'catalogue-grid',
    name: 'Grid Catalogue',
    description: 'Grid-based catalogue with filtering and search',
    type: 'catalogue',
    isActive: false,
    preview: '/admin/pages/templates/catalogue-grid/preview.jpg',
    components: [],
    lastModified: new Date()
  },
  {
    id: 'catalogue-masonry',
    name: 'Masonry Catalogue',
    description: 'Pinterest-style masonry layout for visual appeal',
    type: 'catalogue',
    isActive: false,
    preview: '/admin/pages/templates/catalogue-masonry/preview.jpg',
    components: [],
    lastModified: new Date()
  },
  {
    id: 'catalogue-list',
    name: 'List Catalogue',
    description: 'Detailed list view with comprehensive cake information',
    type: 'catalogue',
    isActive: false,
    preview: '/admin/pages/templates/catalogue-list/preview.jpg',
    components: [],
    lastModified: new Date()
  },
  {
    id: 'designer-destiny-default',
    name: 'Destiny Designer',
    description: 'Current cake designer interface with customization options',
    type: 'cake-designer',
    isActive: true,
    preview: '/admin/pages/templates/designer-destiny/preview.jpg',
    components: [],
    lastModified: new Date()
  },
  {
    id: 'designer-wizard',
    name: 'Wizard Designer',
    description: 'Step-by-step cake design wizard with visual feedback',
    type: 'cake-designer',
    isActive: false,
    preview: '/admin/pages/templates/designer-wizard/preview.jpg',
    components: [],
    lastModified: new Date()
  },
  {
    id: 'designer-canvas',
    name: 'Canvas Designer',
    description: 'Interactive canvas-based cake designer',
    type: 'cake-designer',
    isActive: false,
    preview: '/admin/pages/templates/designer-canvas/preview.jpg',
    components: [],
    lastModified: new Date()
  },
  {
    id: 'designer-quick',
    name: 'Quick Designer',
    description: 'Simplified designer for quick cake customization',
    type: 'cake-designer',
    isActive: false,
    preview: '/admin/pages/templates/designer-quick/preview.jpg',
    components: [],
    lastModified: new Date()
  }
]

export default function PagesManagement() {
  const [templates, setTemplates] = useState<PageTemplate[]>(defaultTemplates)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const pageTypes = [
    { value: 'all', label: 'All Pages', icon: '📄' },
    { value: 'home', label: 'Home', icon: '🏠' },
    { value: 'about', label: 'About', icon: '👋' },
    { value: 'contact', label: 'Contact', icon: '📞' },
    { value: 'catalogue', label: 'Catalogue', icon: '🎂' },
    { value: 'cake-designer', label: 'Cake Designer', icon: '🎨' }
  ]

  const filteredTemplates = templates.filter(template => {
    const matchesType = selectedType === 'all' || template.type === selectedType
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const activateTemplate = (templateId: string, type: string) => {
    setTemplates(prev => prev.map(template => ({
      ...template,
      isActive: template.type === type ? template.id === templateId : template.isActive
    })))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">
            Page Management
          </h1>
          <p className="text-gray-600">
            Manage your website pages and templates to customize your bakery's online presence
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => window.open('/admin/pages/builder/new', '_blank')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            ✨ Create Custom Page
          </Button>
          <Button variant="outline">
            📥 Import Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Page Type Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Type
            </label>
            <div className="flex flex-wrap gap-2">
              {pageTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedType === type.value
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.icon} {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="lg:w-80">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Templates
            </label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="relative">
              {/* Preview Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                <div className="text-6xl opacity-30">
                  {template.type === 'home' && '🏠'}
                  {template.type === 'about' && '👋'}
                  {template.type === 'contact' && '📞'}
                  {template.type === 'catalogue' && '🎂'}
                  {template.type === 'cake-designer' && '🎨'}
                </div>
                {template.isActive && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    ACTIVE
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white bg-opacity-90 px-3 py-1 rounded-full text-xs font-medium text-gray-700 capitalize">
                  {template.type.replace('-', ' ')}
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-gray-800 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {template.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last modified: {template.lastModified.toLocaleDateString()}</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => window.open(`/admin/pages/builder/${template.id}`, '_blank')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    ✏️ Edit
                  </Button>
                  <Button
                    onClick={() => window.open(`/admin/pages/preview/${template.id}`, '_blank')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    👁️ Preview
                  </Button>
                  {!template.isActive && (
                    <Button
                      onClick={() => activateTemplate(template.id, template.type)}
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      ✅ Activate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-30">📄</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or search term
          </p>
          <Button 
            onClick={() => {
              setSelectedType('all')
              setSearchTerm('')
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-6">Page Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {pageTypes.slice(1).map(type => {
            const typeTemplates = templates.filter(t => t.type === type.value)
            const activeTemplate = typeTemplates.find(t => t.isActive)
            
            return (
              <div key={type.value} className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="text-lg font-bold text-gray-800">{typeTemplates.length}</div>
                <div className="text-xs text-gray-600 mb-2">{type.label} Templates</div>
                {activeTemplate && (
                  <div className="text-xs text-green-600 font-medium">
                    Active: {activeTemplate.name}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}