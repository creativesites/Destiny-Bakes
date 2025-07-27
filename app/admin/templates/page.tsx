'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'

interface Template {
  id: string
  name: string
  description: string
  image_url: string
  specifications: any
  price: number
  category: string
  difficulty_level: number
  status: 'pending' | 'approved' | 'rejected' | 'featured'
  tags: string[]
  use_count: number
  is_public: boolean
  created_at: string
  created_by_profile?: {
    full_name: string
  }
  approved_by_profile?: {
    full_name: string
  }
}

export default function AdminTemplatesPage() {
  const { user } = useUser()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'pending', label: 'Pending Review', color: 'yellow' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'featured', label: 'Featured', color: 'blue' },
    { value: 'rejected', label: 'Rejected', color: 'red' }
  ]

  const categories = [
    'all', 'Birthday', 'Wedding', 'Anniversary', 'Graduation', 'Baby Shower', 'Valentine', 'Other'
  ]

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates?adminView=true')
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

  const handleStatusUpdate = async (templateId: string, status: string) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          status
        }),
      })

      if (response.ok) {
        setTemplates(prev => prev.map(template => 
          template.id === templateId 
            ? { ...template, status: status as any, approved_by_profile: { full_name: user?.fullName || 'Admin' } }
            : template
        ))
      } else {
        alert('Failed to update template status')
      }
    } catch (error) {
      console.error('Error updating template:', error)
      alert('Error updating template')
    }
  }

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setShowEditDialog(true)
  }

  const handleSaveEdit = async (updatedData: any) => {
    if (!editingTemplate) return

    try {
      const response = await fetch('/api/templates', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: editingTemplate.id,
          ...updatedData
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setTemplates(prev => prev.map(template => 
          template.id === editingTemplate.id ? result.template : template
        ))
        setShowEditDialog(false)
        setEditingTemplate(null)
      } else {
        alert('Failed to update template')
      }
    } catch (error) {
      console.error('Error updating template:', error)
      alert('Error updating template')
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/templates?id=${templateId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTemplates(prev => prev.filter(template => template.id !== templateId))
      } else {
        alert('Failed to delete template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Error deleting template')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'featured': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesStatus = selectedStatus === 'all' || template.status === selectedStatus
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesStatus && matchesCategory
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Template Management</h1>
        <p className="text-gray-600">Review, approve, and manage cake templates submitted by users.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredTemplates.length} of {templates.length} templates
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="aspect-video relative">
              <Image
                src={template.image_url}
                alt={template.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(template.status)}`}>
                  {template.status}
                </span>
              </div>
              <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                {template.use_count} uses
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                  {template.name}
                </h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2">
                  {template.category}
                </span>
              </div>

              {template.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {template.description}
                </p>
              )}

              <div className="text-xs text-gray-500 mb-3">
                Created by: {template.created_by_profile?.full_name || 'Unknown'}
                <br />
                {new Date(template.created_at).toLocaleDateString()}
              </div>

              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="text-xs text-gray-500">+{template.tags.length - 3}</span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {template.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(template.id, 'approved')}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(template.id, 'rejected')}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {template.status === 'approved' && (
                  <button
                    onClick={() => handleStatusUpdate(template.id, 'featured')}
                    className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    Feature Template
                  </button>
                )}

                {template.status === 'featured' && (
                  <button
                    onClick={() => handleStatusUpdate(template.id, 'approved')}
                    className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
                  >
                    Unfeature
                  </button>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No templates found</h3>
          <p className="text-gray-600">
            No templates match your current filter criteria.
          </p>
        </div>
      )}

      {/* Edit Template Dialog */}
      {showEditDialog && editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Template</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleSaveEdit({
                name: formData.get('name'),
                description: formData.get('description'),
                category: formData.get('category'),
                difficultyLevel: parseInt(formData.get('difficultyLevel') as string),
                tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [],
                isPublic: formData.get('isPublic') === 'on'
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={editingTemplate.name}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={editingTemplate.description}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    name="category" 
                    required 
                    defaultValue={editingTemplate.category}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                  <select 
                    name="difficultyLevel" 
                    defaultValue={editingTemplate.difficulty_level}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value={1}>Easy</option>
                    <option value={2}>Medium</option>
                    <option value={3}>Hard</option>
                    <option value={4}>Expert</option>
                    <option value={5}>Master</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    name="tags"
                    type="text"
                    defaultValue={editingTemplate.tags.join(', ')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    name="isPublic"
                    type="checkbox"
                    defaultChecked={editingTemplate.is_public}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Public Template</label>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}