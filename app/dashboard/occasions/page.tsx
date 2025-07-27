'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Occasion {
  id: string
  name: string
  description: string
  date: string
  reminder_days: number
  cake_preferences: any
  notes: string
  recurring: boolean
  category: string
  created_at: string
}

const OCCASION_CATEGORIES = [
  { value: 'birthday', label: 'Birthday', icon: '🎂' },
  { value: 'anniversary', label: 'Anniversary', icon: '💕' },
  { value: 'wedding', label: 'Wedding', icon: '💒' },
  { value: 'graduation', label: 'Graduation', icon: '🎓' },
  { value: 'holiday', label: 'Holiday', icon: '🎄' },
  { value: 'celebration', label: 'Celebration', icon: '🎉' },
  { value: 'other', label: 'Other', icon: '✨' }
]

export default function ManageOccasionsPage() {
  const { user, isLoaded } = useUser()
  const [occasions, setOccasions] = useState<Occasion[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingOccasion, setEditingOccasion] = useState<Occasion | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    reminder_days: 7,
    category: 'birthday',
    notes: '',
    recurring: false,
    cake_preferences: {
      flavor: '',
      size: '',
      shape: '',
      budget: ''
    }
  })

  useEffect(() => {
    if (isLoaded && user) {
      fetchOccasions()
    }
  }, [isLoaded, user])

  const fetchOccasions = async () => {
    try {
      const response = await fetch('/api/occasions')
      if (response.ok) {
        const data = await response.json()
        setOccasions(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching occasions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingOccasion ? `/api/occasions/${editingOccasion.id}` : '/api/occasions'
      const method = editingOccasion ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchOccasions()
        setShowModal(false)
        setEditingOccasion(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving occasion:', error)
    }
  }

  const handleEdit = (occasion: Occasion) => {
    setEditingOccasion(occasion)
    setFormData({
      name: occasion.name,
      description: occasion.description,
      date: occasion.date,
      reminder_days: occasion.reminder_days,
      category: occasion.category,
      notes: occasion.notes,
      recurring: occasion.recurring,
      cake_preferences: occasion.cake_preferences || {
        flavor: '',
        size: '',
        shape: '',
        budget: ''
      }
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this occasion?')) return
    
    try {
      const response = await fetch(`/api/occasions/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchOccasions()
      }
    } catch (error) {
      console.error('Error deleting occasion:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      date: '',
      reminder_days: 7,
      category: 'birthday',
      notes: '',
      recurring: false,
      cake_preferences: {
        flavor: '',
        size: '',
        shape: '',
        budget: ''
      }
    })
  }

  const getDaysUntil = (date: string) => {
    const occasionDate = new Date(date)
    const today = new Date()
    const timeDiff = occasionDate.getTime() - today.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    if (daysDiff < 0) return { text: 'Past', color: 'gray' }
    if (daysDiff === 0) return { text: 'Today!', color: 'red' }
    if (daysDiff === 1) return { text: 'Tomorrow', color: 'orange' }
    if (daysDiff <= 7) return { text: `${daysDiff} days`, color: 'yellow' }
    if (daysDiff <= 30) return { text: `${daysDiff} days`, color: 'blue' }
    return { text: `${daysDiff} days`, color: 'gray' }
  }

  const getUpcomingOccasions = () => {
    return occasions
      .filter(occasion => {
        const occasionDate = new Date(occasion.date)
        const today = new Date()
        return occasionDate >= today
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">🎂</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p>Sign in to manage your special occasions and get cake reminders.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Occasions</h1>
            <p className="text-gray-600">Never miss a special moment - plan your celebrations ahead!</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => {
              resetForm()
              setEditingOccasion(null)
              setShowModal(true)
            }}
          >
            + Add Occasion
          </Button>
        </div>

        {/* Upcoming Occasions Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {getUpcomingOccasions().map((occasion) => {
            const daysUntil = getDaysUntil(occasion.date)
            const category = OCCASION_CATEGORIES.find(c => c.value === occasion.category)
            
            return (
              <Card key={occasion.id} className={`border-l-4 border-${daysUntil.color}-500`}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{category?.icon}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${daysUntil.color}-100 text-${daysUntil.color}-800`}>
                      {daysUntil.text}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{occasion.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{new Date(occasion.date).toLocaleDateString()}</p>
                  {occasion.description && (
                    <p className="text-xs text-gray-500">{occasion.description}</p>
                  )}
                </div>
              </Card>
            )
          })}
          
          {getUpcomingOccasions().length === 0 && (
            <Card className="md:col-span-3">
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-gray-600">No upcoming occasions. Add some to get started!</p>
              </div>
            </Card>
          )}
        </div>

        {/* All Occasions */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">All Occasions</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin text-3xl mb-2">📅</div>
                <p className="text-gray-600">Loading occasions...</p>
              </div>
            ) : occasions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No occasions yet</h3>
                <p className="text-gray-600 mb-6">Add your special dates and we'll remind you to order cakes!</p>
                <Button 
                  variant="primary"
                  onClick={() => {
                    resetForm()
                    setEditingOccasion(null)
                    setShowModal(true)
                  }}
                >
                  Add Your First Occasion
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {occasions.map((occasion) => {
                  const daysUntil = getDaysUntil(occasion.date)
                  const category = OCCASION_CATEGORIES.find(c => c.value === occasion.category)
                  
                  return (
                    <div key={occasion.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{category?.icon}</div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{occasion.name}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(occasion.date).toLocaleDateString()} • {category?.label}
                            </p>
                            {occasion.description && (
                              <p className="text-sm text-gray-500 mt-1">{occasion.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${daysUntil.color}-100 text-${daysUntil.color}-800`}>
                            {daysUntil.text}
                          </span>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(occasion)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(occasion.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {occasion.cake_preferences && Object.values(occasion.cake_preferences).some(v => v) && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-1">Cake Preferences:</p>
                          <div className="text-sm text-gray-600">
                            {occasion.cake_preferences.flavor && `${occasion.cake_preferences.flavor} flavor`}
                            {occasion.cake_preferences.size && ` • ${occasion.cake_preferences.size} size`}
                            {occasion.cake_preferences.shape && ` • ${occasion.cake_preferences.shape} shape`}
                            {occasion.cake_preferences.budget && ` • K${occasion.cake_preferences.budget} budget`}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-6">
                  {editingOccasion ? 'Edit Occasion' : 'Add New Occasion'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Sarah's Birthday"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        {OCCASION_CATEGORIES.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.icon} {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Brief description of the occasion"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remind me (days before)</label>
                      <select
                        value={formData.reminder_days}
                        onChange={(e) => setFormData({...formData, reminder_days: parseInt(e.target.value)})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value={1}>1 day</option>
                        <option value={3}>3 days</option>
                        <option value={7}>1 week</option>
                        <option value={14}>2 weeks</option>
                        <option value={30}>1 month</option>
                      </select>
                    </div>
                  </div>

                  {/* Cake Preferences */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-700 mb-3">Cake Preferences (Optional)</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Flavor</label>
                        <input
                          type="text"
                          value={formData.cake_preferences.flavor}
                          onChange={(e) => setFormData({
                            ...formData, 
                            cake_preferences: {...formData.cake_preferences, flavor: e.target.value}
                          })}
                          placeholder="Vanilla, Chocolate, etc."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Size</label>
                        <select
                          value={formData.cake_preferences.size}
                          onChange={(e) => setFormData({
                            ...formData, 
                            cake_preferences: {...formData.cake_preferences, size: e.target.value}
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="">Select size</option>
                          <option value="4 inch">4" (2-4 people)</option>
                          <option value="6 inch">6" (6-8 people)</option>
                          <option value="8 inch">8" (10-12 people)</option>
                          <option value="10 inch">10" (15-20 people)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Shape</label>
                        <select
                          value={formData.cake_preferences.shape}
                          onChange={(e) => setFormData({
                            ...formData, 
                            cake_preferences: {...formData.cake_preferences, shape: e.target.value}
                          })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="">Select shape</option>
                          <option value="Round">Round</option>
                          <option value="Square">Square</option>
                          <option value="Heart">Heart</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget (Kwacha)</label>
                        <input
                          type="number"
                          value={formData.cake_preferences.budget}
                          onChange={(e) => setFormData({
                            ...formData, 
                            cake_preferences: {...formData.cake_preferences, budget: e.target.value}
                          })}
                          placeholder="100"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Any additional notes or special requirements"
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="recurring"
                      checked={formData.recurring}
                      onChange={(e) => setFormData({...formData, recurring: e.target.checked})}
                      className="w-4 h-4 text-primary-600 mr-2"
                    />
                    <label htmlFor="recurring" className="text-sm text-gray-700">
                      Recurring annually (e.g., for birthdays)
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                    >
                      {editingOccasion ? 'Update Occasion' : 'Add Occasion'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}