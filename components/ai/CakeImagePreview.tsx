'use client'

import { useState } from 'react'
import Image from 'next/image'
import { generateCakeImages, type CakeImagePreview, type ImageStyle, IMAGE_STYLES } from '@/lib/image-generation'
import type { CakeConfig } from '@/types/database'

interface CakeImagePreviewProps {
  cakeSpecs: Partial<CakeConfig>
  onImageSelect?: (image: CakeImagePreview) => void
  className?: string
}

export function CakeImagePreview({ cakeSpecs, onImageSelect, className = '' }: CakeImagePreviewProps) {
  const [images, setImages] = useState<CakeImagePreview[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('classic')
  const [error, setError] = useState<string>('')

  const handleGenerateImages = async () => {
    if (!cakeSpecs.flavor || !cakeSpecs.size || !cakeSpecs.shape) {
      setError('Please complete your cake design (flavor, size, and shape) before generating images.')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const result = await generateCakeImages(cakeSpecs, selectedStyle)
      
      if (result.success) {
        setImages(result.images)
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
    onImageSelect?.(image)
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
                className="group cursor-pointer"
                onClick={() => handleImageClick(image)}
              >
                <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <div className="aspect-square relative">
                    <Image
                      src={image.url}
                      alt={`Cake preview ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white rounded-full p-3 shadow-lg">
                          <span className="text-primary-600 font-semibold">Select This Design</span>
                        </div>
                      </div>
                    </div>
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
    </div>
  )
}