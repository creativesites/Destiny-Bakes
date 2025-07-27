'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

interface Cake {
  id: string
  name: string
  description: string
  base_price: number
  category: string
  images: string[]
  ingredients: any
  difficulty_level: number
  featured: boolean
  available: boolean
}

export default function CataloguePage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [cakes, setCakes] = useState<Cake[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'difficulty'>('name')
  const [isVisible, setIsVisible] = useState(false)

  const categories = [
    { id: 'all', name: 'All Cakes', icon: '🍰' },
    { id: 'Birthday', name: 'Birthday', icon: '🎂' },
    { id: 'Wedding', name: 'Wedding', icon: '💒' },
    { id: 'Celebration', name: 'Celebration', icon: '🎉' },
    { id: 'Custom', name: 'Custom', icon: '🎨' },
    { id: 'Anniversary', name: 'Anniversary', icon: '💝' }
  ]

  useEffect(() => {
    fetchCakes()
    setIsVisible(true)
  }, [])

  const fetchCakes = async () => {
    try {
      const response = await fetch('/api/cakes')
      if (response.ok) {
        const data = await response.json()
        setCakes(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching cakes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCakes = cakes
    .filter(cake => 
      (selectedCategory === 'all' || cake.category === selectedCategory) &&
      (searchTerm === '' || 
        cake.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cake.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) &&
      cake.available
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.base_price - b.base_price
        case 'difficulty':
          return a.difficulty_level - b.difficulty_level
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const handleOrderCake = (cake: Cake) => {
    // Navigate to cake designer with pre-selected design
    const queryParams = new URLSearchParams({
      catalogueDesign: cake.id,
      flavor: cake.name.toLowerCase().includes('vanilla') ? 'Vanilla' : 
             cake.name.toLowerCase().includes('chocolate') ? 'Chocolate' :
             cake.name.toLowerCase().includes('strawberry') ? 'Strawberry' : 'Vanilla',
      category: cake.category
    })
    
    router.push(`/cake-designer/interactive?${queryParams.toString()}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-cream-50 to-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin text-6xl mb-4">🎂</div>
          <p className="text-xl text-gray-600">Loading our delicious catalogue...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-cream-50 to-gray-50">
      <Navbar />
      
      {/* Floating background elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-gray-100/60 to-gray-200/60 rounded-full opacity-40 animate-float flex items-center justify-center">
        <span className="text-2xl">✨</span>
      </div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-cream-100/60 to-cream-200/60 rounded-full opacity-40 animate-float flex items-center justify-center" style={{animationDelay: '1s'}}>
        <span className="text-xl">🎂</span>
      </div>
      <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-gradient-to-r from-gray-50/60 to-gray-100/60 rounded-full opacity-40 animate-float flex items-center justify-center" style={{animationDelay: '2s'}}>
        <span className="text-xl">🌟</span>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="font-display text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 bg-clip-text text-transparent">Cake</span>
            <br />
            <span className="text-gray-800 text-shadow-premium">Catalogue</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our collection of designer cakes, each crafted with love and attention to detail. 
            Every cake tells a story of celebration.
          </p>
        </div>

        {/* Filters & Search */}
        <div className={`bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block font-semibold text-gray-700 mb-3">Search Cakes</label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block font-semibold text-gray-700 mb-3">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block font-semibold text-gray-700 mb-3">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'difficulty')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="name">Name A-Z</option>
                <option value="price">Price Low-High</option>
                <option value="difficulty">Difficulty Easy-Hard</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className={`mb-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-gray-600 text-center">
            Showing {filteredCakes.length} of {cakes.length} cakes
            {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
          </p>
        </div>

        {/* Cake Grid */}
        <div className={`grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {filteredCakes.map((cake, index) => (
            <div
              key={cake.id}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                {cake.images && cake.images[0] ? (
                  <img
                    src={"/images/catalogue/" + cake.images[0]}
                    alt={cake.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-6xl opacity-50">🎂</span>
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                  {categories.find(c => c.id === cake.category)?.icon} {cake.category}
                </div>

                {/* Featured Badge */}
                {cake.featured && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    ⭐ Featured
                  </div>
                )}

                {/* Difficulty Level */}
                <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-80 text-white px-3 py-1 rounded-full text-sm">
                  {'⭐'.repeat(cake.difficulty_level)} Level {cake.difficulty_level}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                  {cake.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {cake.description}
                </p>

                {/* Ingredients/Style Info */}
                {cake.ingredients && cake.ingredients.style && (
                  <div className="mb-4">
                    <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                      {cake.ingredients.style} style
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-sm text-gray-500">Starting from</span>
                    <div className="text-2xl font-bold text-gray-800">
                      K{cake.base_price.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                    onClick={() => handleOrderCake(cake)}
                  >
                    🎂 Order This Cake
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      👁️ Preview
                    </button>
                    <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      💝 Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCakes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 opacity-50">🍰</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No cakes found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or category filter.
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-3xl p-12 text-white shadow-2xl">
            <h2 className="font-display text-4xl lg:text-5xl font-bold mb-6">
              Don't See What You Want? 🎨
            </h2>
            <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
              Create a completely custom cake with our AI-powered designer. 
              Bring your vision to life with unlimited possibilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/cake-designer" className="btn-glass bg-white text-gray-800 hover:bg-gray-50">
                🤖 Start Custom Design
              </Link>
              <Link href="/templates" className="btn-outline border-white text-white hover:bg-white hover:text-gray-800">
                📋 Browse Templates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}