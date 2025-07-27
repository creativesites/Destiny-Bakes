'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Navbar } from '@/components/layout/Navbar'

interface Template {
  id: string
  name: string
  description: string
  image_url: string
  specifications: any
  price: number
  category: string
  difficulty_level: number
  tags: string[]
  use_count: number
  created_at: string
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'popular' | 'newest'>('popular')

  const categories = [
    { value: 'all', label: 'All Categories', icon: '🎯' },
    { value: 'Birthday', label: 'Birthday', icon: '🎂' },
    { value: 'Wedding', label: 'Wedding', icon: '💒' },
    { value: 'Anniversary', label: 'Anniversary', icon: '💖' },
    { value: 'Graduation', label: 'Graduation', icon: '🎓' },
    { value: 'Baby Shower', label: 'Baby Shower', icon: '👶' },
    { value: 'Valentine', label: 'Valentine', icon: '💝' },
    { value: 'Other', label: 'Other', icon: '🎉' }
  ]

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates?adminView=false')
      const result = await response.json()
      
      if (result.success) {
        setTemplates(result.templates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedTemplates = templates
    .filter(template => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.use_count - a.use_count
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const handleUseTemplate = (template: Template) => {
    // Navigate to cake designer with template data
    const searchParams = new URLSearchParams({
      template: template.id,
      specs: JSON.stringify(template.specifications)
    })
    router.push(`/cake-designer/interactive?${searchParams.toString()}`)
  }

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-green-100 text-green-800'
      case 2:
        return 'bg-yellow-100 text-yellow-800'
      case 3:
        return 'bg-orange-100 text-orange-800'
      case 4:
      case 5:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1:
        return 'Easy'
      case 2:
        return 'Medium'
      case 3:
        return 'Hard'
      case 4:
        return 'Expert'
      case 5:
        return 'Master'
      default:
        return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-cream-50 to-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-cream-50 to-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent">
              Cake Templates
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover amazing cake designs created by our community. 
            Use any template as a starting point for your perfect cake.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Templates</label>
              <input
                type="text"
                placeholder="Search by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'popular' | 'newest')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredAndSortedTemplates.length} template{filteredAndSortedTemplates.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' && ` in ${categories.find(c => c.value === selectedCategory)?.label}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Templates Grid */}
        {filteredAndSortedTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎂</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search criteria or filters.'
                : 'Be the first to create a template!'}
            </p>
            <button
              onClick={() => router.push('/cake-designer')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Your First Template
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAndSortedTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="aspect-square relative">
                  <Image
                    src={template.image_url}
                    alt={template.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  
                  {/* Difficulty Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(template.difficulty_level)}`}>
                      {getDifficultyText(template.difficulty_level)}
                    </span>
                  </div>

                  {/* Use Count Badge */}
                  <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                    {template.use_count} uses
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">
                      {template.name}
                    </h3>
                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full ml-2">
                      {template.category}
                    </span>
                  </div>

                  {template.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Tags */}
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{template.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Price and Action */}
                  <div className="flex items-center justify-between">
                    {template.price && (
                      <span className="text-lg font-bold text-primary-600">
                        K{template.price}
                      </span>
                    )}
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors ml-auto"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16 py-12 bg-white rounded-2xl shadow-lg">
          <h2 className="font-display text-3xl font-bold text-gray-800 mb-4">
            Create Your Own Template
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Design a unique cake and save it as a template for others to discover. 
            Share your creativity with the Destiny Bakes community!
          </p>
          <button
            onClick={() => router.push('/cake-designer')}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Start Creating
          </button>
        </div>
      </div>
    </div>
  )
}