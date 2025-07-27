'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'

interface PreviewImage {
  id: string
  image_url: string
  description: string
  specifications: any
  ai_prompt: string
  price: number
  status: 'pending' | 'approved' | 'rejected'
  reuse_count: number
  hash: string
  generated_at: string
  order_id?: string
  ai_conversations?: {
    user_id: string
    user_profiles?: {
      full_name: string
    }
  }
}

export default function AdminPreviewImagesPage() {
  const { user } = useUser()
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [editingImage, setEditingImage] = useState<PreviewImage | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ]

  useEffect(() => {
    fetchPreviewImages()
  }, [])

  const fetchPreviewImages = async () => {
    try {
      const response = await fetch('/api/preview-images')
      const result = await response.json()
      
      if (result.success) {
        setPreviewImages(result.previews)
      }
    } catch (error) {
      console.error('Error fetching preview images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (imageId: string, status: string) => {
    try {
      const response = await fetch('/api/preview-images', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          previewId: imageId,
          status,
          approvedBy: user?.id
        }),
      })

      if (response.ok) {
        setPreviewImages(prev => prev.map(image => 
          image.id === imageId 
            ? { ...image, status: status as any }
            : image
        ))
      } else {
        alert('Failed to update image status')
      }
    } catch (error) {
      console.error('Error updating image:', error)
      alert('Error updating image')
    }
  }

  const handleEditImage = (image: PreviewImage) => {
    setEditingImage(image)
    setShowEditDialog(true)
  }

  const handleSaveEdit = async (updatedData: any) => {
    if (!editingImage) return

    try {
      // For now, we'll just update the status through the PATCH endpoint
      // In a full implementation, you might want to add more fields to edit
      const response = await fetch('/api/preview-images', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          previewId: editingImage.id,
          status: updatedData.status
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setPreviewImages(prev => prev.map(image => 
          image.id === editingImage.id ? { ...image, ...result.preview } : image
        ))
        setShowEditDialog(false)
        setEditingImage(null)
      } else {
        alert('Failed to update image')
      }
    } catch (error) {
      console.error('Error updating image:', error)
      alert('Error updating image')
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this preview image? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/preview-images?id=${imageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPreviewImages(prev => prev.filter(image => image.id !== imageId))
      } else {
        alert('Failed to delete image')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Error deleting image')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredImages = previewImages.filter(image => {
    return selectedStatus === 'all' || image.status === selectedStatus
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Preview Images Management</h1>
        <p className="text-gray-600">Review, approve, and manage AI-generated cake preview images.</p>
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

          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredImages.length} of {previewImages.length} images
            </div>
          </div>

          <div className="flex items-end justify-end">
            <button
              onClick={fetchPreviewImages}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{previewImages.length}</div>
          <div className="text-sm text-gray-600">Total Images</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {previewImages.filter(img => img.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {previewImages.filter(img => img.status === 'approved').length}
          </div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {previewImages.reduce((sum, img) => sum + img.reuse_count, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Reuses</div>
        </div>
      </div>

      {/* Preview Images Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredImages.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="aspect-square relative">
              <Image
                src={image.image_url}
                alt={image.description || 'Cake preview'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(image.status)}`}>
                  {image.status}
                </span>
              </div>
              <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                {image.reuse_count} reuses
              </div>
              {image.order_id && (
                <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  Ordered
                </div>
              )}
            </div>

            <div className="p-4">
              {image.description && (
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                  {image.description}
                </h3>
              )}

              <div className="text-xs text-gray-500 mb-3">
                Generated: {new Date(image.generated_at).toLocaleDateString()}
                <br />
                User: {image.ai_conversations?.user_profiles?.full_name || 'Unknown'}
                {image.price && (
                  <>
                    <br />
                    Price: K{image.price}
                  </>
                )}
              </div>

              {image.ai_prompt && (
                <div className="bg-gray-50 rounded p-2 mb-3">
                  <div className="text-xs font-medium text-gray-700 mb-1">AI Prompt:</div>
                  <div className="text-xs text-gray-600 line-clamp-3">
                    {image.ai_prompt}
                  </div>
                </div>
              )}

              {image.specifications && (
                <div className="bg-blue-50 rounded p-2 mb-3">
                  <div className="text-xs font-medium text-blue-700 mb-1">Specifications:</div>
                  <div className="text-xs text-blue-600">
                    {Object.entries(image.specifications.cakeSpecs || {}).map(([key, value]) => (
                      <div key={key}>{key}: {String(value)}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {image.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(image.id, 'approved')}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(image.id, 'rejected')}
                      className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {image.status === 'approved' && (
                  <button
                    onClick={() => handleStatusUpdate(image.id, 'pending')}
                    className="w-full bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700"
                  >
                    Mark as Pending
                  </button>
                )}

                {image.status === 'rejected' && (
                  <button
                    onClick={() => handleStatusUpdate(image.id, 'approved')}
                    className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                  >
                    Approve
                  </button>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditImage(image)}
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteImage(image.id)}
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

      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No images found</h3>
          <p className="text-gray-600">
            No preview images match your current filter criteria.
          </p>
        </div>
      )}

      {/* Edit Image Dialog */}
      {showEditDialog && editingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Preview Image</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleSaveEdit({
                status: formData.get('status')
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    name="status" 
                    required 
                    defaultValue={editingImage.status}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="bg-gray-50 rounded p-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Current Details:</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Reuse Count: {editingImage.reuse_count}</div>
                    <div>Generated: {new Date(editingImage.generated_at).toLocaleString()}</div>
                    <div>Hash: {editingImage.hash.substring(0, 8)}...</div>
                  </div>
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