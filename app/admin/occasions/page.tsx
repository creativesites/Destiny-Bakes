'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { isAdmin } from '@/lib/admin-client'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Occasion {
  id: string
  name: string
  description: string
  icon: string
  color_scheme: string[]
  default_decorations: string[]
  price_multiplier: number
  seasonal: boolean
  active: boolean
  created_at: string
}

export default function OccasionsManagement() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [occasions, setOccasions] = useState<Occasion[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingOccasion, setEditingOccasion] = useState<Occasion | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🎉',
    color_scheme: ['#ec4899', '#a855f7'],
    default_decorations: ['balloons', 'confetti'],
    price_multiplier: 1.0,
    seasonal: false,
    active: true
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

      await loadOccasions()
      setLoading(false)
    }

    checkAccess()
  }, [user, isLoaded, router])

  const loadOccasions = async () => {
    const { data, error } = await supabase
      .from('occasions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading occasions:', error)
      return
    }

    setOccasions(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingOccasion) {
      // Update existing occasion
      const { error } = await supabase
        .from('occasions')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingOccasion.id)

      if (error) {
        console.error('Error updating occasion:', error)
        alert('Failed to update occasion')
        return
      }
    } else {
      // Create new occasion
      const { error } = await supabase
        .from('occasions')
        .insert([formData])

      if (error) {
        console.error('Error creating occasion:', error)
        alert('Failed to create occasion')
        return
      }
    }

    setFormData({
      name: '',
      description: '',
      icon: '🎉',
      color_scheme: ['#ec4899', '#a855f7'],
      default_decorations: ['balloons', 'confetti'],
      price_multiplier: 1.0,
      seasonal: false,
      active: true
    })
    setShowAddForm(false)
    setEditingOccasion(null)
    await loadOccasions()
  }

  const handleEdit = (occasion: Occasion) => {
    setEditingOccasion(occasion)
    setFormData({
      name: occasion.name,
      description: occasion.description,
      icon: occasion.icon,
      color_scheme: occasion.color_scheme,
      default_decorations: occasion.default_decorations,
      price_multiplier: occasion.price_multiplier,
      seasonal: occasion.seasonal,
      active: occasion.active
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this occasion?')) return

    const { error } = await supabase
      .from('occasions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting occasion:', error)
      alert('Failed to delete occasion')
      return
    }

    await loadOccasions()
  }

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase
      .from('occasions')
      .update({ active: !active, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error toggling occasion status:', error)
      return
    }

    await loadOccasions()
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
    <div className="min-h-screen bg-gradient-to-br from-white via-cream-50 to-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">
              Occasions Management
            </h1>
            <p className="text-gray-600">
              Manage special occasions, themes, and seasonal offerings for your customers.
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Button 
              onClick={() => {
                setShowAddForm(true)
                setEditingOccasion(null)
                setFormData({
                  name: '',
                  description: '',
                  icon: '🎉',
                  color_scheme: ['#ec4899', '#a855f7'],
                  default_decorations: ['balloons', 'confetti'],
                  price_multiplier: 1.0,
                  seasonal: false,
                  active: true
                })
              }}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
            >
              Add New Occasion
            </Button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="font-display text-2xl font-bold text-gray-800 mb-6">
                  {editingOccasion ? 'Edit Occasion' : 'Add New Occasion'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Occasion Name
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
                        Icon (Emoji)
                      </label>
                      <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                        placeholder="🎉"
                      />
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Multiplier
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="3.0"
                      value={formData.price_multiplier}
                      onChange={(e) => setFormData({ ...formData, price_multiplier: parseFloat(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      1.0 = normal price, 1.5 = 50% higher for special occasions
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Decorations (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.default_decorations.join(', ')}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        default_decorations: e.target.value.split(',').map(s => s.trim())
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      placeholder="balloons, confetti, flowers"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.seasonal}
                        onChange={(e) => setFormData({ ...formData, seasonal: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Seasonal Occasion</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                  
                  <div className="flex space-x-4 pt-6">
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                    >
                      {editingOccasion ? 'Update Occasion' : 'Create Occasion'}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false)
                        setEditingOccasion(null)
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

        {/* Occasions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {occasions.map((occasion) => (
            <div 
              key={occasion.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{occasion.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{occasion.name}</h3>
                    <p className="text-sm text-gray-500">
                      {occasion.seasonal && '🌟 Seasonal'} 
                      {occasion.price_multiplier !== 1.0 && ` • ${occasion.price_multiplier}x price`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleActive(occasion.id, occasion.active)}
                    className={`w-8 h-8 rounded-full ${
                      occasion.active ? 'bg-green-500' : 'bg-gray-300'
                    } flex items-center justify-center text-white text-xs`}
                  >
                    {occasion.active ? '✓' : '○'}
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{occasion.description}</p>
              
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Default Decorations:</p>
                <div className="flex flex-wrap gap-2">
                  {occasion.default_decorations.map((decoration, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      {decoration}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(occasion)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(occasion.id)}
                  className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {occasions.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="font-display text-2xl font-bold text-gray-800 mb-4">
              No Occasions Yet
            </h3>
            <p className="text-gray-600 mb-8">
              Create your first occasion to help customers choose the perfect cake theme.
            </p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
            >
              Add Your First Occasion
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}