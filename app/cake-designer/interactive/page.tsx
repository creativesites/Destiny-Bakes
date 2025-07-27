'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Navbar } from '@/components/layout/Navbar'
import { CakeDesignAssistant } from '@/components/ai/CakeDesignAssistant'
import { CakeDesignerStateMachine } from '@/components/ai/CakeDesignerStateMachine'
import { CakeImagePreview } from '@/components/ai/CakeImagePreview'
import type { CakeConfig } from '@/types/database'
import type { CakeImagePreview as CakeImageType } from '@/lib/image-generation'
import Link from 'next/link'
// import { CakeVisualizer } from '@/components/ai/CakeVisualizer'

const FLAVORS = [
  { name: 'Vanilla', emoji: '🤍', description: 'Classic vanilla sponge with buttercream' },
  { name: 'Strawberry', emoji: '🍓', description: 'Fresh strawberry with cream cheese frosting' },
  { name: 'Chocolate', emoji: '🍫', description: 'Rich chocolate with chocolate ganache' },
  { name: 'Choco-mint', emoji: '🍃', description: 'Chocolate base with refreshing mint' },
  { name: 'Mint', emoji: '🌿', description: 'Cool mint flavor with light frosting' },
  { name: 'Banana', emoji: '🍌', description: 'Moist banana cake with caramel notes' },
  { name: 'Fruit', emoji: '🍊', description: 'Mixed fruit medley with citrus hints' },
]

const SIZES = [
  { size: '4"', servings: '2-4 people', price: 45 },
  { size: '6"', servings: '6-8 people', price: 65 },
  { size: '8"', servings: '10-12 people', price: 85 },
  { size: '10"', servings: '15-20 people', price: 120 },
]

const SHAPES = [
  { name: 'Round', emoji: '⭕', description: 'Classic round shape, perfect for any occasion' },
  { name: 'Square', emoji: '⬜', description: 'Modern square design, great for elegant presentations' },
  { name: 'Heart', emoji: '💖', description: 'Romantic heart shape, ideal for special moments' },
]

interface CatalogCake {
  id: string
  name: string
  description: string
  base_price: number
  category: string
  images: string[]
  available: boolean
  featured?: boolean
  difficulty_level?: number
}

export default function InteractiveCakeDesigner() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [cakeConfig, setCakeConfig] = useState<Partial<CakeConfig>>({})
  const [currentStep, setCurrentStep] = useState(0) // Start with step 0 for catalogue selection
  const [totalPrice, setTotalPrice] = useState(0)
  const [aiPreview, setAiPreview] = useState('')
  const [showAI, setShowAI] = useState(false)
  const [aiStage, setAiStage] = useState('welcome')
  const [selectedImage, setSelectedImage] = useState<CakeImageType | null>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [catalogCakes, setCatalogCakes] = useState<CatalogCake[]>([])
  const [selectedCatalogCake, setSelectedCatalogCake] = useState<CatalogCake | null>(null)
  const [showCatalogStep, setShowCatalogStep] = useState(true)

  // Fetch catalog cakes
  useEffect(() => {
    if (isLoaded && user) {
      fetchCatalogCakes()
    }
  }, [isLoaded, user])

  const fetchCatalogCakes = async () => {
    try {
      const response = await fetch('/api/cakes?available=true&featured=true')
      if (response.ok) {
        const data = await response.json()
        setCatalogCakes(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching catalog cakes:', error)
    }
  }

  // Calculate price whenever config changes
  useEffect(() => {
    if (cakeConfig.size && cakeConfig.flavor) {
      const basePrices = {
        "4\"": 45,
        "6\"": 65,
        "8\"": 85,
        "10\"": 120
      }
      
      const flavorMultipliers = {
        "Vanilla": 1.0,
        "Strawberry": 1.1,
        "Chocolate": 1.1,
        "Choco-mint": 1.2,
        "Mint": 1.1,
        "Banana": 1.1,
        "Fruit": 1.3
      }

      const size = cakeConfig.size as keyof typeof basePrices
      const flavor = cakeConfig.flavor as keyof typeof flavorMultipliers
      
      let basePrice = basePrices[size] || 65
      let flavorMultiplier = flavorMultipliers[flavor] || 1.0
      let layerMultiplier = (cakeConfig.layers || 1) > 1 ? 1.2 : 1.0
      let tierMultiplier = (cakeConfig.tiers || 1) > 1 ? 1.3 : 1.0
      
      const total = Math.round(basePrice * flavorMultiplier * layerMultiplier * tierMultiplier)
      setTotalPrice(total)
    }
  }, [cakeConfig])

  const handleCakeUpdate = (updates: Partial<CakeConfig>) => {
    setCakeConfig(prev => ({ ...prev, ...updates }))
  }

  const handleStepComplete = () => {
    setCurrentStep(prev => Math.min(prev + 1, 6)) // Updated to handle 6 steps (0-5)
  }

  const handleCatalogSelection = (cake: CatalogCake | null) => {
    setSelectedCatalogCake(cake)
    if (cake) {
      // Pre-fill some config based on cake name/description
      const inferredFlavor = cake.name.toLowerCase().includes('vanilla') ? 'Vanilla' :
                            cake.name.toLowerCase().includes('chocolate') ? 'Chocolate' :
                            cake.name.toLowerCase().includes('strawberry') ? 'Strawberry' : 'Vanilla'
      
      setCakeConfig(prev => ({
        ...prev,
        catalogueDesign: cake.id,
        flavor: inferredFlavor
      }))
    }
    setCurrentStep(1) // Move to flavor selection
  }

  const handleSkipCatalog = () => {
    setShowCatalogStep(false)
    setCurrentStep(1) // Move to flavor selection
  }

  const handleImageSelect = (image: CakeImageType) => {
    setSelectedImage(image)
    // Add to selected images if not already selected
    if (!selectedImages.includes(image.id)) {
      setSelectedImages(prev => [...prev, image.id])
    }
    console.log('Selected cake image:', image)
  }

  const handlePlaceOrder = () => {
    setShowOrderDialog(true)
  }

  const handleOrderSubmit = async (orderData: any) => {
    setIsPlacingOrder(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cake_config: cakeConfig,
          total_amount: totalPrice,
          delivery_date: orderData.deliveryDate,
          delivery_time: orderData.deliveryTime,
          delivery_address: orderData.deliveryAddress,
          special_instructions: orderData.specialInstructions,
          selected_images: selectedImages
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setOrderPlaced(true)
        setShowOrderDialog(false)
        // Redirect to order confirmation page
        router.push(`/order-confirmation/${result.data.id}`)
      } else {
        alert('Failed to place order: ' + result.error)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Error placing order. Please try again.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const isStepComplete = (step: number) => {
    switch (step) {
      case 0: return true // Catalog selection is optional
      case 1: return !!cakeConfig.flavor
      case 2: return !!cakeConfig.size && !!cakeConfig.shape
      case 3: return !!cakeConfig.layers && !!cakeConfig.tiers
      case 4: return true // Customization is optional
      case 5: return true // Final step
      default: return false
    }
  }

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin text-4xl">🎂</div>
    </div>
  }

  if (!user) {
    return <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-4xl font-bold mb-4">Please Sign In</h1>
        <p className="text-xl text-gray-600 mb-8">You need to be signed in to use the cake designer.</p>
        <Link href="/sign-in" className="btn-primary">Sign In to Continue</Link>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-gray-800 mb-4">
            Design Your Perfect Cake
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Create a custom cake with our step-by-step designer or chat with our AI assistant
          </p>
          
          {/* AI Assistant Toggle */}
          <div className="flex justify-center space-x-4 mb-8">
            <button 
              onClick={() => setShowAI(false)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                !showAI ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎨 Step-by-Step Designer
            </button>
            <button 
              onClick={() => setShowAI(true)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                showAI ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🤖 Chat with AI Assistant
            </button>
          </div>

          {/* AI Stage Indicator */}
          {aiStage !== 'welcome' && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6 text-center">
              <p className="text-primary-800">
                <strong>AI Assistant Stage:</strong> {' '}
                {aiStage === 'flavorSelection' && '🍰 Flavor Selection'}
                {aiStage === 'sizeAndShape' && '📏 Size & Shape'}
                {aiStage === 'layersAndTiers' && '🏗️ Layers & Tiers'}
                {aiStage === 'customization' && '✨ Customization'}
                {aiStage === 'preview' && '🎂 Preview & Order'}
                {aiStage === 'orderComplete' && '🎉 Order Complete'}
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[0, 1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= step 
                    ? 'bg-primary-500 text-white' 
                    : isStepComplete(step + 1)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {isStepComplete(step + 1) && currentStep > step ? '✓' : step + 1}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-primary-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Flavor</span>
            <span>Size & Shape</span>
            <span>Structure</span>
            <span>Customize</span>
            <span>Review</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Designer */}
          <div className="lg:col-span-2">
            <div className="card-elegant">
              {/* Step 0: Catalog Selection (Optional) */}
              {currentStep === 0 && showCatalogStep && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="font-display text-3xl font-bold text-gray-800 mb-4">
                      🎨 Start Your Creation Journey
                    </h2>
                    <p className="text-xl text-gray-600 mb-2">
                      Choose your path to the perfect cake
                    </p>
                    <p className="text-gray-500">
                      Start with one of our signature designs or create something completely unique
                    </p>
                  </div>

                  {/* Path Selection */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-6 transition-all duration-300 group-hover:border-primary-300 group-hover:shadow-xl">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🎂</span>
                          </div>
                          <h3 className="font-display text-xl font-bold text-gray-800 mb-2">
                            Browse Our Collection
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Start with one of our beautifully crafted signature cakes and customize it to your liking
                          </p>
                          <div className="text-sm text-primary-600 font-medium">
                            {catalogCakes.length} featured cakes available
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-secondary-500/20 to-primary-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative bg-white border-2 border-gray-200 rounded-2xl p-6 transition-all duration-300 group-hover:border-secondary-300 group-hover:shadow-xl">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">✨</span>
                          </div>
                          <h3 className="font-display text-xl font-bold text-gray-800 mb-2">
                            Create from Scratch
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Design your cake from the ground up with complete freedom over every detail
                          </p>
                          <button
                            onClick={handleSkipCatalog}
                            className="btn-secondary w-full"
                          >
                            Start Creating
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Featured Cakes Collection */}
                  {catalogCakes.length > 0 && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="font-display text-2xl font-semibold text-gray-800 mb-2">
                          ✨ Our Signature Collection
                        </h3>
                        <p className="text-gray-600">
                          Choose a cake below to customize, or explore all options
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {catalogCakes.slice(0, 6).map((cake) => (
                          <div
                            key={cake.id}
                            onClick={() => handleCatalogSelection(cake)}
                            className={`group relative cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                              selectedCatalogCake?.id === cake.id ? 'scale-105' : ''
                            }`}
                          >
                            {/* Selection Indicator */}
                            {selectedCatalogCake?.id === cake.id && (
                              <div className="absolute -top-2 -right-2 z-10">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            )}

                            {/* Glow Effect */}
                            <div className={`absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-2xl blur-xl transition-opacity duration-300 ${
                              selectedCatalogCake?.id === cake.id 
                                ? 'opacity-75' 
                                : 'opacity-0 group-hover:opacity-50'
                            }`}></div>

                            {/* Card Content */}
                            <div className={`relative bg-white rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                              selectedCatalogCake?.id === cake.id
                                ? 'border-primary-500 shadow-xl'
                                : 'border-gray-200 group-hover:border-primary-300 group-hover:shadow-lg'
                            }`}>
                              {/* Image */}
                              <div className="relative h-48 overflow-hidden">
                                {cake.images && cake.images[0] ? (
                                  <img
                                    src={`/images/catalogue/${cake.images[0]}`}
                                    alt={cake.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                                    <span className="text-6xl opacity-50">🎂</span>
                                  </div>
                                )}
                                
                                {/* Featured Badge */}
                                {cake.featured && (
                                  <div className="absolute top-3 left-3">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                                      ⭐ Featured
                                    </span>
                                  </div>
                                )}

                                {/* Price Badge */}
                                <div className="absolute top-3 right-3">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-white/90 backdrop-blur-sm text-gray-800 shadow-lg">
                                    K{cake.base_price}
                                  </span>
                                </div>

                                {/* Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <span className="text-sm font-medium text-gray-800">
                                      Click to Select
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Content */}
                              <div className="p-4">
                                <h3 className="font-display text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                                  {cake.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {cake.description}
                                </p>
                                
                                {/* Category & Features */}
                                <div className="flex items-center justify-between">
                                  <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                                    {cake.category}
                                  </span>
                                  {cake.difficulty_level && (
                                    <div className="flex items-center space-x-1">
                                      {[...Array(5)].map((_, i) => (
                                        <svg
                                          key={i}
                                          className={`w-3 h-3 ${
                                            i < (cake.difficulty_level || 0) 
                                              ? 'text-yellow-400' 
                                              : 'text-gray-200'
                                          }`}
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* View All Cakes Link */}
                      <div className="text-center">
                        <Link 
                          href="/catalogue" 
                          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        >
                          <span>View All {catalogCakes.length} Cakes</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                      </div>

                      {/* Action Buttons */}
                      {selectedCatalogCake && (
                        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 border border-primary-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img
                                src={`/images/catalogue/${selectedCatalogCake.images?.[0] || 'default.jpg'}`}
                                alt={selectedCatalogCake.name}
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                                  if (nextElement) {
                                    nextElement.style.display = 'flex'
                                  }
                                }}
                              />
                              <div className="w-16 h-16 bg-primary-100 rounded-lg hidden items-center justify-center">
                                <span className="text-2xl">🎂</span>
                              </div>
                              <div>
                                <h4 className="font-display text-lg font-bold text-gray-800">
                                  {selectedCatalogCake.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Starting from K{selectedCatalogCake.base_price}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setCurrentStep(1)}
                              className="btn-primary px-8"
                            >
                              Customize This Cake
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Loading State */}
                  {catalogCakes.length === 0 && (
                    <div className="text-center py-12">
                      <div className="animate-spin text-4xl mb-4">🎂</div>
                      <p className="text-gray-600">Loading our beautiful cakes...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 1: Flavor Selection */}
              {currentStep === 1 && (
                <div>
                  {selectedCatalogCake ? (
                    <div className="mb-6">
                      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 border border-primary-200 mb-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <img
                            src={`/images/catalogue/${selectedCatalogCake.images?.[0] || 'default.jpg'}`}
                            alt={selectedCatalogCake.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                              if (nextElement) {
                                nextElement.style.display = 'flex'
                              }
                            }}
                          />
                          <div className="w-16 h-16 bg-primary-100 rounded-lg hidden items-center justify-center">
                            <span className="text-2xl">🎂</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-display text-lg font-bold text-gray-800">
                              Customizing: {selectedCatalogCake.name}
                            </h3>
                            <p className="text-sm text-gray-600">{selectedCatalogCake.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Base Price</div>
                            <div className="text-lg font-bold text-primary-600">K{selectedCatalogCake.base_price}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          💡 You can still customize all aspects of this cake including flavor, size, and decorations.
                        </div>
                      </div>
                      <h2 className="font-display text-2xl font-semibold mb-6">
                        Step 1: Customize Your Flavor 🍰
                      </h2>
                    </div>
                  ) : (
                    <h2 className="font-display text-2xl font-semibold mb-6">
                      Step 1: Choose Your Flavor 🍰
                    </h2>
                  )}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {FLAVORS.map((flavor) => (
                      <button
                        key={flavor.name}
                        onClick={() => {
                          handleCakeUpdate({ flavor: flavor.name as CakeConfig['flavor'] })
                          handleStepComplete()
                        }}
                        className={`p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                          cakeConfig.flavor === flavor.name
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{flavor.emoji}</div>
                        <h3 className="font-semibold text-lg mb-1">{flavor.name}</h3>
                        <p className="text-sm text-gray-600">{flavor.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Size & Shape */}
              {currentStep === 2 && (
                <div>
                  <h2 className="font-display text-2xl font-semibold mb-6">
                    Step 2: Size & Shape 📏
                  </h2>
                  
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-4">Choose Size:</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {SIZES.map((sizeOption) => (
                        <button
                          key={sizeOption.size}
                          onClick={() => handleCakeUpdate({ size: sizeOption.size as CakeConfig['size'] })}
                          className={`p-3 border-2 rounded-lg transition-all text-left ${
                            cakeConfig.size === sizeOption.size
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="font-semibold">{sizeOption.size} - {sizeOption.servings}</div>
                          <div className="text-sm text-gray-600">Starting at K{sizeOption.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-4">Choose Shape:</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      {SHAPES.map((shape) => (
                        <button
                          key={shape.name}
                          onClick={() => handleCakeUpdate({ shape: shape.name as CakeConfig['shape'] })}
                          className={`p-4 border-2 rounded-lg transition-all text-center ${
                            cakeConfig.shape === shape.name
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">{shape.emoji}</div>
                          <h4 className="font-semibold">{shape.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{shape.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {cakeConfig.size && cakeConfig.shape && (
                    <button
                      onClick={handleStepComplete}
                      className="btn-primary w-full"
                    >
                      Continue to Structure Design →
                    </button>
                  )}
                </div>
              )}

              {/* Step 3: Layers & Tiers */}
              {currentStep === 3 && (
                <div>
                  <h2 className="font-display text-2xl font-semibold mb-6">
                    Step 3: Layers & Tiers 🏗️
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Number of Layers:</h3>
                      {[1, 2, 3].map((layers) => (
                        <button
                          key={layers}
                          onClick={() => handleCakeUpdate({ layers: layers as CakeConfig['layers'] })}
                          className={`block w-full p-3 border-2 rounded-lg mb-2 transition-all text-left ${
                            cakeConfig.layers === layers
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="font-semibold">{layers} Layer{layers > 1 ? 's' : ''}</div>
                          <div className="text-sm text-gray-600">
                            {layers === 1 && 'Classic single layer'}
                            {layers === 2 && 'Double the flavor variety'}
                            {layers === 3 && 'Maximum flavor combination'}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-4">Number of Tiers:</h3>
                      {[1, 2, 3].map((tiers) => (
                        <button
                          key={tiers}
                          onClick={() => handleCakeUpdate({ tiers: tiers as CakeConfig['tiers'] })}
                          className={`block w-full p-3 border-2 rounded-lg mb-2 transition-all text-left ${
                            cakeConfig.tiers === tiers
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="font-semibold">{tiers} Tier{tiers > 1 ? 's' : ''}</div>
                          <div className="text-sm text-gray-600">
                            {tiers === 1 && 'Single tier elegance'}
                            {tiers === 2 && 'Two-tier grandeur'}
                            {tiers === 3 && 'Three-tier masterpiece'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {cakeConfig.layers && cakeConfig.tiers && (
                    <button
                      onClick={handleStepComplete}
                      className="btn-primary w-full"
                    >
                      Continue to Customization →
                    </button>
                  )}
                </div>
              )}

              {/* Step 4: Customization */}
              {currentStep === 4 && (
                <div>
                  <h2 className="font-display text-2xl font-semibold mb-6">
                    Step 4: Customize Your Cake ✨
                  </h2>
                  
                  <div className="space-y-6 mb-6">
                    <div>
                      <label className="block font-semibold mb-2">Special Message (Optional):</label>
                      <input
                        type="text"
                        placeholder="Happy Birthday Sarah!"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        onChange={(e) => handleCakeUpdate({ 
                          customization: { 
                            ...cakeConfig.customization, 
                            message: e.target.value 
                          } 
                        })}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">Color Preferences (Optional):</label>
                      <input
                        type="text"
                        placeholder="Pink and gold, pastels, bright colors..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        onChange={(e) => handleCakeUpdate({ 
                          customization: { 
                            ...cakeConfig.customization, 
                            colors: e.target.value.split(',').map(c => c.trim()) 
                          } 
                        })}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">Special Decorations (Optional):</label>
                      <input
                        type="text"
                        placeholder="Flowers, butterflies, sports theme..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        onChange={(e) => handleCakeUpdate({ 
                          customization: { 
                            ...cakeConfig.customization, 
                            decorations: e.target.value.split(',').map(d => d.trim()) 
                          } 
                        })}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">Occasion:</label>
                      <input
                        type="text"
                        placeholder="Birthday party, wedding, anniversary..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        onChange={(e) => handleCakeUpdate({ occasion: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleStepComplete}
                    className="btn-primary w-full"
                  >
                    Review Your Design →
                  </button>
                </div>
              )}

              {/* Step 5: Review */}
              {currentStep === 5 && (
                <div>
                  <h2 className="font-display text-2xl font-semibold mb-6">
                    Step 5: Review Your Design 🎂
                  </h2>
                  
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-lg mb-4">Your Custom Cake:</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Flavor:</strong> {cakeConfig.flavor}</p>
                        <p><strong>Size:</strong> {cakeConfig.size}</p>
                        <p><strong>Shape:</strong> {cakeConfig.shape}</p>
                      </div>
                      <div>
                        <p><strong>Layers:</strong> {cakeConfig.layers}</p>
                        <p><strong>Tiers:</strong> {cakeConfig.tiers}</p>
                        <p><strong>Occasion:</strong> {cakeConfig.occasion || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    {cakeConfig.customization?.message && (
                      <p className="mt-3"><strong>Message:</strong> "{cakeConfig.customization.message}"</p>
                    )}
                    
                    
                    {aiPreview && (
                      <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                        <h4 className="font-semibold mb-2">AI Preview:</h4>
                        <p className="text-sm">{aiPreview}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="btn-secondary flex-1"
                    >
                      ← Start Over
                    </button>
                    <button 
                      className="btn-primary flex-1"
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder || !cakeConfig.flavor || !cakeConfig.size || !cakeConfig.shape}
                    >
                      {isPlacingOrder ? 'Placing Order...' : `Place Order - K${totalPrice}`}
                    </button>
                  </div>
                  {/* AI Image Generation Section */}
                  {(cakeConfig.flavor && cakeConfig.size && cakeConfig.shape) && (
                      <div className="mb-12 mt-12">
                        <CakeImagePreview 
                          cakeSpecs={cakeConfig}
                          onImageSelect={handleImageSelect}
                          conversationId={user?.id}
                        />
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Display */}
            <div className="card-elegant">
              <h3 className="font-display text-xl font-semibold mb-4">💰 Current Price</h3>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                K{totalPrice.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600">
                Final price includes all selected options
              </p>
            </div>

            {/* Design Summary */}
            <div className="card-elegant">
              <h3 className="font-display text-xl font-semibold mb-4">🎂 Your Design</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Flavor:</span>
                  <span className="font-medium">{cakeConfig.flavor || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="font-medium">{cakeConfig.size || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shape:</span>
                  <span className="font-medium">{cakeConfig.shape || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Layers:</span>
                  <span className="font-medium">{cakeConfig.layers || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiers:</span>
                  <span className="font-medium">{cakeConfig.tiers || '—'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-elegant">
              <h3 className="font-display text-xl font-semibold mb-4">⚡ Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-secondary text-sm">
                  Save Design
                </button>
                <button className="w-full btn-secondary text-sm">
                  Share with Friend
                </button>
                <Link href="/catalog" className="block w-full btn-secondary text-sm text-center">
                  Browse Templates
                </Link>
              </div>
            </div>

            {/* Tips */}
            <div className="card-elegant">
              <h3 className="font-display text-xl font-semibold mb-4">💡 Designer Tips</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>🎨 Use our AI assistant for personalized recommendations</p>
                <p>📏 Larger cakes allow for more decorative details</p>
                <p>🍰 Multiple layers add flavor variety</p>
                <p>⏰ Order 48 hours in advance for best results</p>
              </div>
            </div>
          </div>
        </div>

        
      </div>

      {/* AI State Machine */}
      <CakeDesignerStateMachine
        onCakeUpdate={handleCakeUpdate}
        onPriceUpdate={setTotalPrice}
        onStageChange={setAiStage}
      />

      {/* AI Assistant */}
      <CakeDesignAssistant
        onCakeUpdate={handleCakeUpdate}
        onPriceUpdate={setTotalPrice}
        onPreviewGenerated={setAiPreview}
      />

      {/* Order Placement Dialog */}
      {showOrderDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Complete Your Order</h3>
            
            {orderPlaced ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <h4 className="text-xl font-semibold text-green-600 mb-2">Order Placed Successfully!</h4>
                <p className="text-gray-600 mb-4">
                  Your cake order has been received and will be processed shortly.
                </p>
                <button
                  onClick={() => setShowOrderDialog(false)}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleOrderSubmit({
                  deliveryDate: formData.get('deliveryDate'),
                  deliveryTime: formData.get('deliveryTime'),
                  deliveryAddress: {
                    street: formData.get('street'),
                    city: formData.get('city'),
                    phone: formData.get('phone')
                  },
                  specialInstructions: formData.get('specialInstructions')
                })
              }}>
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-2">Order Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Flavor:</span>
                      <span>{cakeConfig.flavor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{cakeConfig.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shape:</span>
                      <span>{cakeConfig.shape}</span>
                    </div>
                    {cakeConfig.layers && (
                      <div className="flex justify-between">
                        <span>Layers:</span>
                        <span>{cakeConfig.layers}</span>
                      </div>
                    )}
                    {selectedImages.length > 0 && (
                      <div className="flex justify-between">
                        <span>Selected Images:</span>
                        <span>{selectedImages.length}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Total:</span>
                      <span>K{totalPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                      <input
                        name="deliveryDate"
                        type="date"
                        required
                        min={new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                      <select name="deliveryTime" required className="w-full border border-gray-300 rounded-lg px-3 py-2">
                        <option value="">Select time</option>
                        <option value="morning">Morning (9AM - 12PM)</option>
                        <option value="afternoon">Afternoon (12PM - 5PM)</option>
                        <option value="evening">Evening (5PM - 8PM)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                    <input
                      name="street"
                      type="text"
                      required
                      placeholder="Street address"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
                    />
                    <input
                      name="city"
                      type="text"
                      required
                      placeholder="City"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input
                      name="phone"
                      type="tel"
                      required
                      placeholder="Phone number"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions (Optional)</label>
                    <textarea
                      name="specialInstructions"
                      rows={3}
                      placeholder="Any special requests or messages for the cake..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowOrderDialog(false)}
                    className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                    disabled={isPlacingOrder}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? 'Placing Order...' : `Place Order - K${totalPrice}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}