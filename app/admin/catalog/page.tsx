'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { CopilotChat  } from '@copilotkit/react-ui'
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { CopilotSidebar } from '@copilotkit/react-ui'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { isAdmin } from '@/lib/admin-client'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface CatalogCake {
  id: string
  name: string
  description: string
  base_price: number
  category: string
  images: string[]
  ingredients: any
  allergens: string[]
  available: boolean
  featured: boolean
  difficulty_level: number
  preparation_time_hours: number
  occasion_id?: string
  created_at: string
}

interface Occasion {
  id: string
  name: string
  icon: string
}

export default function CatalogManagement() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [cakes, setCakes] = useState<CatalogCake[]>([])
  const [occasions, setOccasions] = useState<Occasion[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCake, setEditingCake] = useState<CatalogCake | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [showChat, setShowChat] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: 150,
    category: 'Birthday',
    images: [] as string[],
    allergens: [] as string[],
    available: true,
    featured: false,
    difficulty_level: 1,
    preparation_time_hours: 24,
    occasion_id: ''
  })

  // Available catalog images
  const availableImages = [
    'birthday-cake-01.jpg', 'birthday-cake-02.jpg', 'birthday-cake-03.jpg', 'birthday-cake-04.jpg', 'birthday-cake-05.jpg', 'birthday-cake-06.jpg',
    'wedding-cake-01.jpg', 'wedding-cake-02.jpg', 'wedding-cake-03.jpg', 'wedding-cake-04.jpg', 'wedding-cake-05.jpg', 'wedding-cake-06.jpg',
    'celebration-cake-01.jpg', 'celebration-cake-02.jpg', 'celebration-cake-03.jpg', 'celebration-cake-04.jpg', 'celebration-cake-05.jpg', 'celebration-cake-06.jpg',
    'custom-cake-01.jpg', 'custom-cake-02.jpg', 'custom-cake-03.jpg', 'custom-cake-04.jpg', 'custom-cake-05.jpg'
  ]

  // Make catalog data available to Copilot
  useCopilotReadable({
    description: "Cake catalog with all available cakes and their details",
    value: {
      totalCakes: cakes.length,
      availableCakes: cakes.filter(c => c.available).length,
      featuredCakes: cakes.filter(c => c.featured).length,
      categoriesBreakdown: {
        Birthday: cakes.filter(c => c.category === 'Birthday').length,
        Wedding: cakes.filter(c => c.category === 'Wedding').length,
        Celebration: cakes.filter(c => c.category === 'Celebration').length,
        Custom: cakes.filter(c => c.category === 'Custom').length
      },
      averagePrice: cakes.length > 0 ? Math.round(cakes.reduce((sum, c) => sum + c.base_price, 0) / cakes.length) : 0,
      priceRange: {
        min: Math.min(...cakes.map(c => c.base_price)),
        max: Math.max(...cakes.map(c => c.base_price))
      },
      availableImages: availableImages
    }
  })

  // Copilot action for adding new cakes
  useCopilotAction({
    name: "addNewCake",
    description: "Add a new cake to the catalog with specified details",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Name of the cake"
      },
      {
        name: "description",
        type: "string",
        description: "Description of the cake"
      },
      {
        name: "category",
        type: "string",
        description: "Category of the cake",
        enum: ["Birthday", "Wedding", "Celebration", "Custom"]
      },
      {
        name: "basePrice",
        type: "number",
        description: "Base price in ZMW"
      },
      {
        name: "difficultyLevel",
        type: "number",
        description: "Difficulty level from 1-5"
      },
      {
        name: "prepTimeHours",
        type: "number",
        description: "Preparation time in hours"
      },
      {
        name: "featured",
        type: "boolean",
        description: "Whether the cake should be featured",
        required: false
      }
    ],
    handler: async ({ name, description, category, basePrice, difficultyLevel, prepTimeHours, featured = false }) => {
      try {
        const { error } = await supabase
          .from('cakes')
          .insert([{
            name,
            description,
            category,
            base_price: basePrice,
            difficulty_level: difficultyLevel,
            preparation_time_hours: prepTimeHours,
            featured,
            available: true,
            images: [],
            allergens: []
          }])

        if (error) throw error

        await loadCakes()
        return { success: true, message: `Cake "${name}" added to catalog successfully!` }
      } catch (error) {
        return { error: "Failed to add cake to catalog" }
      }
    }
  })

  // Copilot action for catalog analytics
  useCopilotAction({
    name: "getCatalogAnalytics",
    description: "Get analytics and insights about the cake catalog",
    parameters: [],
    handler: async () => {
      const categoryStats = {
        Birthday: cakes.filter(c => c.category === 'Birthday'),
        Wedding: cakes.filter(c => c.category === 'Wedding'),
        Celebration: cakes.filter(c => c.category === 'Celebration'),
        Custom: cakes.filter(c => c.category === 'Custom')
      }

      return {
        totalCakes: cakes.length,
        availabilityStats: {
          available: cakes.filter(c => c.available).length,
          unavailable: cakes.filter(c => !c.available).length
        },
        featuredStats: {
          featured: cakes.filter(c => c.featured).length,
          regular: cakes.filter(c => !c.featured).length
        },
        categoryStats: Object.entries(categoryStats).map(([category, cakes]) => ({
          category,
          count: cakes.length,
          averagePrice: cakes.length > 0 ? Math.round(cakes.reduce((sum, c) => sum + c.base_price, 0) / cakes.length) : 0
        })),
        priceAnalysis: {
          averagePrice: Math.round(cakes.reduce((sum, c) => sum + c.base_price, 0) / cakes.length),
          priceRange: {
            min: Math.min(...cakes.map(c => c.base_price)),
            max: Math.max(...cakes.map(c => c.base_price))
          }
        },
        difficultyBreakdown: [1,2,3,4,5].map(level => ({
          level,
          count: cakes.filter(c => c.difficulty_level === level).length
        })),
        recommendations: [
          cakes.filter(c => !c.featured && c.available).length > 0 ? "Consider featuring some available cakes to boost visibility" : null,
          cakes.filter(c => !c.available).length > 5 ? "You have several unavailable cakes - consider updating their status" : null,
          cakes.filter(c => c.category === 'Birthday').length < 3 ? "Consider adding more birthday cakes as they're popular" : null
        ].filter(Boolean)
      }
    }
  })

  

  useEffect(() => {
    const checkAccess = async () => {
      if (!isLoaded || !user) return

      const adminStatus = await isAdmin(user.id)
      setIsAdminUser(adminStatus)
      
      if (!adminStatus) {
        router.push('/admin')
        return
      }

      await Promise.all([loadCakes(), loadOccasions()])
      setLoading(false)
    }

    checkAccess()
  }, [user, isLoaded, router])

  const loadCakes = async () => {
    try {
      const { data, error } = await supabase
        .from('cakes')
        .select(`
          *,
          occasions(name, icon)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading cakes:', error)
        return
      }

      setCakes(data || [])
    } catch (error) {
      console.error('Error in loadCakes:', error)
    }
  }

  const loadOccasions = async () => {
    try {
      const { data, error } = await supabase
        .from('occasions')
        .select('id, name, icon')
        .eq('active', true)
        .order('name')

      if (error) {
        console.error('Error loading occasions:', error)
        return
      }

      setOccasions(data || [])
    } catch (error) {
      console.error('Error in loadOccasions:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCake) {
        // Update existing cake
        const { error } = await supabase
          .from('cakes')
          .update({
            ...formData,
            occasion_id: formData.occasion_id || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCake.id)

        if (error) {
          console.error('Error updating cake:', error)
          alert('Failed to update cake')
          return
        }
      } else {
        // Create new cake
        const { error } = await supabase
          .from('cakes')
          .insert([{
            ...formData,
            occasion_id: formData.occasion_id || null
          }])

        if (error) {
          console.error('Error creating cake:', error)
          alert('Failed to create cake')
          return
        }
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        base_price: 150,
        category: 'Birthday',
        images: [],
        allergens: [],
        available: true,
        featured: false,
        difficulty_level: 1,
        preparation_time_hours: 24,
        occasion_id: ''
      })
      setShowAddForm(false)
      setEditingCake(null)
      await loadCakes()

    } catch (error) {
      console.error('Error in handleSubmit:', error)
      alert('Failed to save cake')
    }
  }

  const handleEdit = (cake: CatalogCake) => {
    setEditingCake(cake)
    setFormData({
      name: cake.name,
      description: cake.description,
      base_price: cake.base_price,
      category: cake.category,
      images: cake.images || [],
      allergens: cake.allergens || [],
      available: cake.available,
      featured: cake.featured,
      difficulty_level: cake.difficulty_level,
      preparation_time_hours: cake.preparation_time_hours,
      occasion_id: cake.occasion_id || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cake?')) return

    try {
      const { error } = await supabase
        .from('cakes')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting cake:', error)
        alert('Failed to delete cake')
        return
      }

      await loadCakes()
    } catch (error) {
      console.error('Error in handleDelete:', error)
      alert('Failed to delete cake')
    }
  }

  const toggleAvailability = async (id: string, available: boolean) => {
    try {
      const { error } = await supabase
        .from('cakes')
        .update({ available: !available, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Error toggling availability:', error)
        return
      }

      await loadCakes()
    } catch (error) {
      console.error('Error in toggleAvailability:', error)
    }
  }

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('cakes')
        .update({ featured: !featured, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) {
        console.error('Error toggling featured:', error)
        return
      }

      await loadCakes()
    } catch (error) {
      console.error('Error in toggleFeatured:', error)
    }
  }

  const filteredCakes = cakes.filter(cake => {
    if (filter === 'all') return true
    if (filter === 'featured') return cake.featured
    if (filter === 'available') return cake.available
    if (filter === 'unavailable') return !cake.available
    return cake.category.toLowerCase() === filter.toLowerCase()
  })

  const handleImageToggle = (image: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.includes(image)
        ? prev.images.filter(img => img !== image)
        : [...prev.images, image]
    }))
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-cream-50 to-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  if (!user || !isAdminUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar />
      
      {/* Floating particles background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-8 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-gradient-to-br from-cyan-200/25 to-blue-200/25 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-8">
        {/* Enhanced Header with Stats */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-2xl border border-white/20">
          <div className="flex justify-between items-start">
            <div className="relative">
              <div className="absolute -top-2 -left-2 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-xl"></div>
              <h1 className="relative font-display text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                Cake Catalog Management
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                Manage your delicious cake offerings, pricing, and featured items
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100">
                  <div className="text-2xl font-bold text-emerald-600">{cakes.length}</div>
                  <div className="text-sm text-emerald-600">Total Cakes</div>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-4 border border-teal-100">
                  <div className="text-2xl font-bold text-teal-600">{cakes.filter(c => c.available).length}</div>
                  <div className="text-sm text-teal-600">Available</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-100">
                  <div className="text-2xl font-bold text-orange-600">{cakes.filter(c => c.featured).length}</div>
                  <div className="text-sm text-orange-600">Featured</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                  <div className="text-2xl font-bold text-purple-600">
                    ZMW {cakes.length > 0 ? Math.round(cakes.reduce((sum, c) => sum + c.base_price, 0) / cakes.length) : 0}
                  </div>
                  <div className="text-sm text-purple-600">Avg Price</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <Link href="/admin">
                <Button variant="outline" className="border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                  ← Back to Dashboard
                </Button>
              </Link>
              <Button 
                onClick={() => {
                  setShowAddForm(true)
                  setEditingCake(null)
                  setFormData({
                    name: '',
                    description: '',
                    base_price: 150,
                    category: 'Birthday',
                    images: [],
                    allergens: [],
                    available: true,
                    featured: false,
                    difficulty_level: 1,
                    preparation_time_hours: 24,
                    occasion_id: ''
                  })
                }}
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🎂 Add New Cake
              </Button>
              <Button 
                onClick={() => setShowChat(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🤖 AI Assistant
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { key: 'all', label: 'All Cakes', count: cakes.length, color: 'from-gray-500 to-gray-600', icon: '🎂' },
            { key: 'featured', label: 'Featured', count: cakes.filter(c => c.featured).length, color: 'from-yellow-500 to-orange-500', icon: '⭐' },
            { key: 'available', label: 'Available', count: cakes.filter(c => c.available).length, color: 'from-green-500 to-emerald-500', icon: '✅' },
            { key: 'birthday', label: 'Birthday', count: cakes.filter(c => c.category.toLowerCase() === 'birthday').length, color: 'from-pink-500 to-rose-500', icon: '🎉' },
            { key: 'wedding', label: 'Wedding', count: cakes.filter(c => c.category.toLowerCase() === 'wedding').length, color: 'from-purple-500 to-violet-500', icon: '👰' },
            { key: 'celebration', label: 'Celebration', count: cakes.filter(c => c.category.toLowerCase() === 'celebration').length, color: 'from-blue-500 to-indigo-500', icon: '🎊' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`relative px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                filter === tab.key 
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-black/20` 
                  : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white/90 border border-white/30 shadow-md'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  filter === tab.key 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="font-display text-2xl font-bold text-gray-800 mb-6">
                  {editingCake ? 'Edit Cake' : 'Add New Cake'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cake Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      >
                        <option value="Birthday">Birthday</option>
                        <option value="Wedding">Wedding</option>
                        <option value="Celebration">Celebration</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Price (ZMW)
                      </label>
                      <input
                        type="number"
                        min="50"
                        value={formData.base_price}
                        onChange={(e) => setFormData({ ...formData, base_price: parseInt(e.target.value) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level (1-5)
                      </label>
                      <select
                        value={formData.difficulty_level}
                        onChange={(e) => setFormData({ ...formData, difficulty_level: parseInt(e.target.value) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      >
                        {[1,2,3,4,5].map(level => (
                          <option key={level} value={level}>{level} {'⭐'.repeat(level)}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prep Time (Hours)
                      </label>
                      <input
                        type="number"
                        min="12"
                        max="72"
                        value={formData.preparation_time_hours}
                        onChange={(e) => setFormData({ ...formData, preparation_time_hours: parseInt(e.target.value) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Occasion (Optional)
                    </label>
                    <select
                      value={formData.occasion_id}
                      onChange={(e) => setFormData({ ...formData, occasion_id: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    >
                      <option value="">No specific occasion</option>
                      {occasions.map(occasion => (
                        <option key={occasion.id} value={occasion.id}>
                          {occasion.icon} {occasion.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Select Images
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {availableImages.map(image => (
                        <div 
                          key={image}
                          className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                            formData.images.includes(image) 
                              ? 'border-gray-500 shadow-lg' 
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                          onClick={() => handleImageToggle(image)}
                        >
                          <img 
                            src={`/images/catalogue/${image}`} 
                            alt={image}
                            className="w-full h-20 object-cover"
                          />
                          {formData.images.includes(image) && (
                            <div className="absolute inset-0 bg-gray-600/50 flex items-center justify-center">
                              <span className="text-white text-xl">✓</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Selected: {formData.images.length} image(s)
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.available}
                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Available for order</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Featured cake</span>
                    </label>
                  </div>
                  
                  <div className="flex space-x-4 pt-6">
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                    >
                      {editingCake ? 'Update Cake' : 'Add Cake'}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false)
                        setEditingCake(null)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Cakes Grid */}
        {filteredCakes.length === 0 ? (
          <Card variant="premium" className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50"></div>
            <div className="relative p-16 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative text-8xl mb-8 animate-bounce">🎂</div>
              </div>
              <h3 className="font-display text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
                No Cakes Found
              </h3>
              <p className="text-gray-600 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                {filter === 'all' 
                  ? "Your cake catalog is empty. Add your first delicious cake to get started!"
                  : `No ${filter} cakes found. Try adjusting your filter or add some new cakes.`
                }
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                ✨ Add Your First Cake
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCakes.map((cake, index) => (
              <Card key={cake.id} variant="premium" className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] group">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative">
                  <div className="relative overflow-hidden rounded-t-2xl">
                    {cake.images && cake.images.length > 0 ? (
                      <img 
                        src={`/images/catalogue/${cake.images[0]}`} 
                        alt={cake.name}
                        className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                        <span className="text-6xl animate-pulse">🎂</span>
                      </div>
                    )}
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  {/* Status badges */}
                  <div className="absolute top-4 right-4 flex flex-col space-y-2">
                    {cake.featured && (
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border border-white/20">
                        ⭐ Featured
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border border-white/20 ${
                      cake.available 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white' 
                        : 'bg-gradient-to-r from-red-400 to-rose-400 text-white'
                    }`}>
                      {cake.available ? '✅ Available' : '❌ Unavailable'}
                    </span>
                  </div>
                  
                  {/* Difficulty indicator */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20 shadow-lg">
                      <span className="text-xs font-bold text-gray-700">{'⭐'.repeat(cake.difficulty_level)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1">
                        {cake.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          cake.category === 'Birthday' ? 'bg-pink-100 text-pink-700' :
                          cake.category === 'Wedding' ? 'bg-purple-100 text-purple-700' :
                          cake.category === 'Celebration' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {cake.category === 'Birthday' ? '🎉' : cake.category === 'Wedding' ? '👰' : cake.category === 'Celebration' ? '🎊' : '🎂'} {cake.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        ZMW {cake.base_price}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{cake.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-100">
                      <div className="text-xs text-orange-600 font-medium">Difficulty</div>
                      <div className="text-sm font-bold text-orange-700">{'⭐'.repeat(cake.difficulty_level)}</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
                      <div className="text-xs text-blue-600 font-medium">Prep Time</div>
                      <div className="text-sm font-bold text-blue-700">{cake.preparation_time_hours}h</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(cake)}
                      className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-all duration-200 transform hover:scale-105"
                    >
                      ✎️ Edit
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => toggleAvailability(cake.id, cake.available)}
                      className={`transition-all duration-200 transform hover:scale-105 ${
                        cake.available 
                          ? 'border-orange-200 text-orange-600 hover:bg-orange-50' 
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {cake.available ? '🙅 Disable' : '✅ Enable'}
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFeatured(cake.id, cake.featured)}
                      className={`transition-all duration-200 transform hover:scale-105 ${
                        cake.featured 
                          ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50' 
                          : 'border-purple-200 text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      {cake.featured ? '👎 Unfeature' : '⭐ Feature'}
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(cake.id)}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 transition-all duration-200 transform hover:scale-105"
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {/* CopilotKit Chat Sidebar */}
        {showChat && (
          <CopilotSidebar
            instructions="You are an AI assistant for Destiny Bakes catalog management. Help manage the cake catalog, add new cakes, provide insights about pricing and categories, and assist with inventory decisions. You have access to all catalog data and can perform catalog management actions. Be helpful, creative, and focused on optimizing the cake offerings."
            defaultOpen={true}
            onSetOpen={setShowChat}
            clickOutsideToClose={true}
          >
            <CopilotChat
              instructions="Help manage the cake catalog efficiently. You can add new cakes, provide analytics about the catalog, suggest pricing strategies, and offer insights about cake categories and features. Use the available actions to perform tasks directly."
              className="h-full"
            />
          </CopilotSidebar>
        )}
      </div>
    </div>
  )
}