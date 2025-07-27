'use client'

import { useState } from 'react'
import Image from 'next/image'
import { generateCakeImages, type CakeImagePreview, type ImageStyle, IMAGE_STYLES } from '@/lib/image-generation'
import type { CakeConfig } from '@/types/database'

interface CakeImagePreviewProps {
  cakeSpecs: Partial<CakeConfig>
  onImageSelect?: (image: CakeImagePreview) => void
  onSaveAsTemplate?: (image: CakeImagePreview, templateData: any) => void
  conversationId?: string
  className?: string
}

export function CakeImagePreview({ cakeSpecs, onImageSelect, onSaveAsTemplate, conversationId, className = '' }: CakeImagePreviewProps) {
  const [images, setImages] = useState<CakeImagePreview[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('classic')
  const [error, setError] = useState<string>('')
  const [selectedImage, setSelectedImage] = useState<CakeImagePreview | null>(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareImage, setShareImage] = useState<CakeImagePreview | null>(null)

  const handleGenerateImages = async () => {
    if (!cakeSpecs.flavor || !cakeSpecs.size || !cakeSpecs.shape) {
      setError('Please complete your cake design (flavor, size, and shape) before generating images.')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const result = await generateCakeImages(cakeSpecs, selectedStyle, conversationId)
      
      if (result.success) {
        setImages(result.images)
        if (result.reused) {
          setError('✨ Found existing previews for this design! We\'re showing you the cached images.')
        }
      } else {
        setError(result.error || 'Failed to generate images')
      }
    } catch (err) {
      setError('Something went wrong while generating your cake images.')
      console.error('Image generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleImageClick = (image: CakeImagePreview) => {
    setSelectedImage(image)
    onImageSelect?.(image)
  }

  const handleSaveAsTemplate = (image: CakeImagePreview) => {
    setSelectedImage(image)
    setShowTemplateDialog(true)
  }

  const handleShareImage = (image: CakeImagePreview) => {
    setShareImage(image)
    setShowShareDialog(true)
  }

  const shareToSocial = async (platform: string) => {
    if (!shareImage) return

    const shareText = `Check out this amazing custom cake design from Destiny Bakes! 🎂✨`
    const shareUrl = `${window.location.origin}/cake-designer?template=${shareImage.id}`

    const shareData = {
      title: 'Destiny Bakes - Custom Cake Design',
      text: shareText,
      url: shareUrl
    }

    try {
      if (platform === 'native' && navigator.share) {
        await navigator.share(shareData)
      } else if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank')
      } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
      } else if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
      } else if (platform === 'copy') {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
    
    setShowShareDialog(false)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-start">
        <h3 className="font-display text-2xl font-semibold text-gray-800 mb-2">
          ✨ AI Cake Preview Generator
        </h3>
        <p className="text-gray-600">
          See your custom cake design come to life with AI-generated images
        </p>
      </div>

      {/* Style Selection */}
      <div className="space-y-3">
        <label className="block font-semibold text-gray-700">Choose Preview Style:</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(IMAGE_STYLES).map(([key, style]) => (
            <button
              key={key}
              onClick={() => setSelectedStyle(key as ImageStyle)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                selectedStyle === key
                  ? 'border-primary-500 bg-primary-50 text-primary-800'
                  : 'border-gray-200 hover:border-primary-300 text-gray-700'
              }`}
            >
              <div className="font-semibold text-sm">{style.name}</div>
              <div className="text-xs opacity-75">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={handleGenerateImages}
          disabled={isGenerating || !cakeSpecs.flavor || !cakeSpecs.size || !cakeSpecs.shape}
          className={`px-8 py-4 rounded-lg font-semibold transition-all ${
            isGenerating
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'btn-primary hover:shadow-lg transform hover:scale-105'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center space-x-2">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Creating Your Cake Images...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <span>🎨</span>
              <span>Generate Cake Images</span>
            </span>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <div className="flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Generated Images */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-lg text-gray-800 text-center">
            Your AI-Generated Cake Previews ✨
          </h4>
          
          <div className="grid md:grid-cols-3 gap-6">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`group relative ${selectedImage?.id === image.id ? 'ring-4 ring-primary-500 rounded-xl' : ''}`}
              >
                <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300">
                  <div className="aspect-square relative">
                    <Image
                      src={image.url}
                      alt={`Cake preview ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleImageClick(image)
                          }}
                          className="block w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                        >
                          Select This Design
                        </button>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSaveAsTemplate(image)
                            }}
                            className="flex-1 bg-white text-gray-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                          >
                            Save Template
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleShareImage(image)
                            }}
                            className="flex-1 bg-white text-gray-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                          >
                            Share
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Selected indicator */}
                    {selectedImage?.id === image.id && (
                      <div className="absolute top-2 right-2 bg-primary-600 text-white rounded-full p-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    {/* Reused indicator */}
                    {(image as any).reused && (
                      <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                        Cached
                      </div>
                    )}
                  </div>
                  
                  {/* Image Info */}
                  <div className="p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">
                        Design {index + 1}
                      </span>
                      <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                        {IMAGE_STYLES[selectedStyle].name}
                      </span>
                    </div>
                    
                    {image.revisedPrompt && (
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {image.revisedPrompt}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>💡 Click on any image to select it for your order</p>
          </div>
        </div>
      )}

      {/* Current Cake Specs Display */}
      {(cakeSpecs.flavor || cakeSpecs.size || cakeSpecs.shape) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Current Design:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Flavor:</span>
              <div className="font-medium">{cakeSpecs.flavor || '—'}</div>
            </div>
            <div>
              <span className="text-gray-600">Size:</span>
              <div className="font-medium">{cakeSpecs.size || '—'}</div>
            </div>
            <div>
              <span className="text-gray-600">Shape:</span>
              <div className="font-medium">{cakeSpecs.shape || '—'}</div>
            </div>
            <div>
              <span className="text-gray-600">Structure:</span>
              <div className="font-medium">
                {cakeSpecs.layers || '—'} layers, {cakeSpecs.tiers || '—'} tiers
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save as Template Dialog */}
      {showTemplateDialog && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Save as Template</h3>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const templateData = {
                name: formData.get('name'),
                description: formData.get('description'),
                category: formData.get('category'),
                tags: (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || []
              }
              
              try {
                const response = await fetch('/api/templates', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...templateData,
                    imageUrl: selectedImage.url,
                    specifications: { cakeSpecs, style: selectedStyle },
                    price: null,
                    difficultyLevel: 1,
                    storagePath: null
                  })
                })
                
                if (response.ok) {
                  alert('Template saved successfully!')
                  onSaveAsTemplate?.(selectedImage, templateData)
                } else {
                  alert('Failed to save template')
                }
              } catch (error) {
                alert('Error saving template')
              }
              
              setShowTemplateDialog(false)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., Elegant Strawberry Birthday Cake"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Describe this cake design..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" required className="w-full border border-gray-300 rounded-lg px-3 py-2">
                    <option value="">Select category</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Graduation">Graduation</option>
                    <option value="Baby Shower">Baby Shower</option>
                    <option value="Valentine">Valentine</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    name="tags"
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g., elegant, strawberry, pink, birthday"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTemplateDialog(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && shareImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Share with a Friend</h3>
            <p className="text-gray-600 mb-6">Share this amazing cake design with your friends and family!</p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => shareToSocial('whatsapp')}
                className="flex items-center justify-center space-x-2 border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50"
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => shareToSocial('facebook')}
                className="flex items-center justify-center space-x-2 border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50"
              >
                <span>📘</span>
                <span>Facebook</span>
              </button>
              <button
                onClick={() => shareToSocial('twitter')}
                className="flex items-center justify-center space-x-2 border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50"
              >
                <span>🐦</span>
                <span>Twitter</span>
              </button>
              <button
                onClick={() => shareToSocial('copy')}
                className="flex items-center justify-center space-x-2 border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50"
              >
                <span>📋</span>
                <span>Copy Link</span>
              </button>
            </div>
            
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={() => shareToSocial('native')}
                className="w-full mt-3 bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700"
              >
                Share via System
              </button>
            )}
            
            <button
              onClick={() => setShowShareDialog(false)}
              className="w-full mt-3 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}