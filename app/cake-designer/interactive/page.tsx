'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Navbar } from '@/components/layout/Navbar'
import { CakeDesignAssistant } from '@/components/ai/CakeDesignAssistant'
import { CakeDesignerStateMachine } from '@/components/ai/CakeDesignerStateMachine'
import { CakeImagePreview } from '@/components/ai/CakeImagePreview'
import type { CakeConfig } from '@/types/database'
import type { CakeImagePreview as CakeImageType } from '@/lib/image-generation'
import Link from 'next/link'

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

export default function InteractiveCakeDesigner() {
  const { user, isLoaded } = useUser()
  const [cakeConfig, setCakeConfig] = useState<Partial<CakeConfig>>({})
  const [currentStep, setCurrentStep] = useState(1)
  const [totalPrice, setTotalPrice] = useState(0)
  const [aiPreview, setAiPreview] = useState('')
  const [showAI, setShowAI] = useState(false)
  const [aiStage, setAiStage] = useState('welcome')
  const [selectedImage, setSelectedImage] = useState<CakeImageType | null>(null)

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
    setCurrentStep(prev => Math.min(prev + 1, 5))
  }

  const handleImageSelect = (image: CakeImageType) => {
    setSelectedImage(image)
    // You could also trigger a callback or update the cake configuration
    console.log('Selected cake image:', image)
  }

  const isStepComplete = (step: number) => {
    switch (step) {
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
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  currentStep >= step 
                    ? 'bg-primary-500 text-white' 
                    : isStepComplete(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {isStepComplete(step) && currentStep > step ? '✓' : step}
                </div>
                {step < 5 && (
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
              {/* Step 1: Flavor Selection */}
              {currentStep === 1 && (
                <div>
                  <h2 className="font-display text-2xl font-semibold mb-6">
                    Step 1: Choose Your Flavor 🍰
                  </h2>
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
                    <button className="btn-primary flex-1">
                      Place Order - K{totalPrice}
                    </button>
                  </div>
                  {/* AI Image Generation Section */}
                  {(cakeConfig.flavor && cakeConfig.size && cakeConfig.shape) && (
                      <div className="mb-12 mt-12">
                        <CakeImagePreview 
                          cakeSpecs={cakeConfig}
                          onImageSelect={handleImageSelect}
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
    </div>
  )
}