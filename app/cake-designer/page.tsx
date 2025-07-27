'use client'

import { useState, useEffect } from 'react'
import { redirect, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import { CopilotPopup } from '@copilotkit/react-ui'
import Link from 'next/link'

import { CakeVisualizer } from '@/components/ai/CakeVisualizer'


interface CakeSpecs {
  occasion?: string
  flavor?: string
  size?: string
  shape?: string
  layers?: number
  tiers?: number
  servings?: number
  budget?: string
  catalogueDesign?: string
  photoUpload?: File | null
  photoPrint?: boolean
}

export default function CakeDesignerPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [selectedQuickStart, setSelectedQuickStart] = useState<string | null>(null)
  const [cakeSpecs, setCakeSpecs] = useState<CakeSpecs>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const quickStartOptions = [
    {
      id: 'birthday',
      icon: '🎂',
      title: 'Birthday Celebration',
      description: 'Perfect for birthday parties and personal celebrations',
      gradient: 'from-gray-200 to-gray-300',
      specs: { occasion: 'birthday', layers: 2, shape: 'Round' }
    },
    {
      id: 'wedding',
      icon: '💒',
      title: 'Wedding Elegance',
      description: 'Sophisticated designs for wedding celebrations',
      gradient: 'from-cream-200 to-cream-300',
      specs: { occasion: 'wedding', tiers: 3, shape: 'Round' }
    },
    {
      id: 'special',
      icon: '🎉',
      title: 'Special Occasion',
      description: 'Graduations, anniversaries, and milestone events',
      gradient: 'from-gray-100 to-gray-200',
      specs: { occasion: 'special', layers: 2, shape: 'Square' }
    },
    {
      id: 'custom',
      icon: '🎨',
      title: 'Custom Creation',
      description: 'Start from scratch with complete creative freedom',
      gradient: 'from-cream-100 to-cream-200',
      specs: {}
    }
  ]

  const flavors = [
    { name: 'Vanilla', emoji: '🤍', description: 'Classic vanilla sponge with buttercream', popular: true },
    { name: 'Strawberry', emoji: '🍓', description: 'Fresh strawberry with cream cheese frosting', popular: true },
    { name: 'Chocolate', emoji: '🍫', description: 'Rich chocolate with chocolate ganache', popular: true },
    { name: 'Choco-mint', emoji: '🍃', description: 'Chocolate base with refreshing mint', popular: false },
    { name: 'Mint', emoji: '🌿', description: 'Cool mint flavor with light frosting', popular: false },
    { name: 'Banana', emoji: '🍌', description: 'Moist banana cake with caramel notes', popular: false },
    { name: 'Fruit', emoji: '🍊', description: 'Mixed fruit medley with citrus hints', popular: false },
    { name: 'Red Velvet', emoji: '❤️', description: 'Classic red velvet with cream cheese', popular: true },
  ]

  const steps = [
    { title: 'Occasion', icon: '🎉', description: 'What are we celebrating?' },
    { title: 'Flavor', icon: '🍰', description: 'Choose your favorite taste' },
    { title: 'Size & Shape', icon: '📏', description: 'Perfect dimensions' },
    { title: 'Structure', icon: '🏗️', description: 'Layers and tiers' },
    { title: 'AI Preview', icon: '🤖', description: 'See your creation' }
  ]

  // CopilotKit actions for interactive cake design
  useCopilotAction({
    name: "selectQuickStart",
    description: "Help user select a quick start option for cake design",
    parameters: [
      {
        name: "option",
        type: "string",
        description: "The quick start option (birthday, wedding, special, custom)",
        required: true,
      },
    ],
    handler: async ({ option }) => {
      const selected = quickStartOptions.find(opt => opt.id === option)
      if (selected) {
        setSelectedQuickStart(option)
        setCakeSpecs(selected.specs)
        setCurrentStep(1)
        return `Selected ${selected.title}! Moving to flavor selection.`
      }
      return "Option not found. Please choose: birthday, wedding, special, or custom"
    },
  })

  useCopilotAction({
    name: "selectFlavor",
    description: "Help user select a cake flavor",
    parameters: [
      {
        name: "flavor",
        type: "string",
        description: "The cake flavor to select",
        required: true,
      },
    ],
    handler: async ({ flavor }) => {
      const selectedFlavor = flavors.find(f => f.name.toLowerCase() === flavor.toLowerCase())
      if (selectedFlavor) {
        setCakeSpecs(prev => ({ ...prev, flavor: selectedFlavor.name }))
        setCurrentStep(2)
        return `Great choice! ${selectedFlavor.name} cake selected. Now let's choose the size and shape.`
      }
      return `Flavor not available. Available flavors: ${flavors.map(f => f.name).join(', ')}`
    },
  })

  useCopilotAction({
    name: "updateCakeSpecs",
    description: "Update cake specifications like size, shape, layers, etc.",
    parameters: [
      {
        name: "specs",
        type: "object",
        description: "Object containing cake specifications to update",
        required: true,
      },
    ],
    handler: async ({ specs }) => {
      setCakeSpecs(prev => ({ ...prev, ...specs }))
      return `Updated cake specifications: ${Object.entries(specs).map(([key, value]) => `${key}: ${value}`).join(', ')}`
    },
  })

  useCopilotAction({
    name: "proceedToDesigner",
    description: "Navigate to the interactive cake designer with current specifications",
    parameters: [],
    handler: async () => {
      router.push('/cake-designer/interactive')
      return "Navigating to the interactive cake designer!"
    },
  })

  // Make current state available to CopilotKit
  useCopilotReadable({
    description: "Current cake design session information",
    value: {
      currentStep: steps[currentStep]?.title || 'Getting Started',
      selectedQuickStart,
      cakeSpecs,
      availableFlavors: flavors.map(f => f.name),
      userName: user?.firstName || 'there'
    }
  })

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    } else if (user) {
      setIsVisible(true)
    }
  }, [user, isLoaded, router])

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-cream-50 to-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />
      
      <div className="min-h-screen relative bg-gradient-to-br from-white via-cream-50 to-gray-50">
        {/* Subtle Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-gray-100/60 to-gray-200/60 rounded-full opacity-40 animate-float flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-cream-100/60 to-cream-200/60 rounded-full opacity-40 animate-float flex items-center justify-center" style={{animationDelay: '1s'}}>
          <span className="text-xl">🎂</span>
        </div>
        <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-gradient-to-r from-gray-50/60 to-gray-100/60 rounded-full opacity-40 animate-float flex items-center justify-center" style={{animationDelay: '2s'}}>
          <span className="text-xl">🌟</span>
        </div>
        <div className="absolute bottom-20 right-1/3 w-12 h-12 bg-gradient-to-r from-cream-50/60 to-cream-100/60 rounded-full opacity-40 animate-float flex items-center justify-center" style={{animationDelay: '0.5s'}}>
          <span className="text-sm">💫</span>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Enhanced Header */}
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative">
              <h1 className="font-display text-6xl lg:text-8xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 bg-clip-text text-transparent">AI-Powered</span>
                <br />
                <span className="text-gray-800 text-shadow-premium">Cake Designer</span>
              </h1>
              {/* Subtle sparkle effects */}
              <div className="absolute top-0 left-1/4 w-2 h-2 bg-gray-300 rounded-full animate-pulse opacity-60"></div>
              <div className="absolute top-10 right-1/3 w-1 h-1 bg-gray-400 rounded-full animate-pulse opacity-70" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-5 left-1/3 w-1.5 h-1.5 bg-gray-300 rounded-full animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
            </div>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Create your perfect custom cake with the help of our intelligent design assistant. 
              From flavor selection to final touches, we'll guide you every step of the way.
            </p>
          </div>

          {/* Enhanced Progress Steps */}
          <div className={`grid md:grid-cols-5 gap-6 mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 text-2xl font-bold shadow-lg transition-all duration-300 ${
                  currentStep >= index 
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white scale-110 shadow-xl' 
                    : 'bg-white border-2 border-gray-200 text-gray-500 shadow-md hover:shadow-lg'
                }`}>
                  {currentStep > index ? '✓' : step.icon}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 text-gray-700">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Enhanced Design Options */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Quick Start Options */}
            <div className={`bg-white rounded-3xl shadow-xl border border-gray-100 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="p-8">
                <h2 className="font-display text-3xl font-bold flex items-center space-x-3 mb-8">
                  <span className="text-4xl">🚀</span>
                  <span className="bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent">Quick Start</span>
                </h2>
                <div className="space-y-6">
                  {quickStartOptions.map((option) => (
                    <div 
                      key={option.id}
                      className={`relative overflow-hidden p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 hover:shadow-lg hover:scale-[1.02] ${
                        selectedQuickStart === option.id 
                          ? 'border-gray-400 shadow-lg scale-[1.02] bg-gray-50' 
                          : 'border-gray-150 hover:border-gray-300 bg-gray-25'
                      }`}
                      onClick={() => {
                        setSelectedQuickStart(option.id)
                        setCakeSpecs(option.specs)
                        setCurrentStep(1)
                      }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${option.gradient} opacity-5`}></div>
                      <div className="relative z-10 flex items-center space-x-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-r ${option.gradient} shadow-lg`}>
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-xl font-bold text-gray-800 mb-1">{option.title}</h3>
                          <p className="text-gray-600">{option.description}</p>
                        </div>
                        {selectedQuickStart === option.id && (
                          <div className="text-2xl text-gray-600">✓</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced AI Assistant */}
            <div className={`bg-white rounded-3xl shadow-xl border border-gray-100 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="p-8">
                <h2 className="font-display text-3xl font-bold flex items-center space-x-3 mb-8">
                  <span className="text-4xl">🤖</span>
                  <span className="bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent">AI Design Assistant</span>
                </h2>
                <div className="bg-gray-50/80 border border-gray-100 p-6 mb-6 rounded-2xl">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl">🤖</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong className="text-gray-800">Destiny AI:</strong> Hello {user.firstName}! I'm here to help you create the perfect cake. 
                        What's the occasion we're celebrating today? ✨
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {['Birthday Party', 'Wedding', 'Anniversary', 'Graduation'].map((occasion) => (
                          <button 
                            key={occasion}
                            className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-sm font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-300 hover:scale-105"
                            onClick={() => setCakeSpecs(prev => ({ ...prev, occasion: occasion.toLowerCase() }))}
                          >
                            {occasion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  {[
                    'Real-time design suggestions',
                    'Instant price calculations',
                    'Visual cake previews with xAI',
                    'Dietary restriction guidance',
                    'Personalized recommendations'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 text-gray-700">
                      <span className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full animate-pulse"></span>
                      <span className="font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full text-xl bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                  onClick={() => router.push('/cake-designer/interactive')}
                >
                  <span className="flex items-center justify-center space-x-3">
                    <span className="text-2xl">🎨</span>
                    <span>Start Designing with AI</span>
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Available Flavors */}
          <div className={`bg-white rounded-3xl shadow-xl border border-gray-100 mb-16 transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="p-8">
              <h2 className="font-display text-3xl font-bold flex items-center space-x-3 mb-8">
                <span className="text-4xl">🍰</span>
                <span className="bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent">Available Flavors</span>
              </h2>
              <div className="grid md:grid-cols-4 gap-6">
                {flavors.map((flavor) => (
                  <div 
                    key={flavor.name} 
                    className={`relative text-center p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 hover:shadow-lg hover:scale-105 ${
                      cakeSpecs.flavor === flavor.name 
                        ? 'border-gray-400 shadow-lg scale-105 bg-gray-50' 
                        : 'border-gray-150 hover:border-gray-300 bg-gray-25'
                    }`}
                    onClick={() => setCakeSpecs(prev => ({ ...prev, flavor: flavor.name }))}
                  >
                    {flavor.popular && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Popular
                      </div>
                    )}
                    <div className="text-5xl mb-4 transition-transform duration-300 hover:scale-125">
                      {flavor.emoji}
                    </div>
                    <h3 className="font-display text-xl font-bold text-gray-800 mb-2">{flavor.name}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{flavor.description}</p>
                    {cakeSpecs.flavor === flavor.name && (
                      <div className="mt-3 text-2xl text-gray-600">✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced CTA Section */}
          <div className={`text-center transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative inline-block">
              <div className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-3xl p-12 text-white shadow-2xl">
                <h2 className="font-display text-4xl lg:text-5xl font-bold mb-6">
                  Ready to Create Magic? ✨
                </h2>
                <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
                  Let our AI assistant guide you through creating the perfect cake for your special moment.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button 
                    variant="glass" 
                    size="xl"
                    className="bg-white text-gray-800 hover:bg-gray-50 border-0"
                    onClick={() => router.push('/cake-designer/interactive')}
                  >
                    <span className="flex items-center space-x-3">
                      <span className="text-3xl">🤖</span>
                      <span>Start with AI Assistant</span>
                    </span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="xl"
                    className="border-2 border-white text-white hover:bg-white hover:text-gray-800"
                    onClick={() => router.push('/catalogue')}
                  >
                    <span className="flex items-center space-x-3">
                      <span className="text-3xl">✨</span>
                      <span>Browse Catalogue Designs</span>
                    </span>
                  </Button>
                </div>
              </div>
              {/* Subtle corner decorations */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-gray-200 rounded-full opacity-60"></div>
              <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-gray-300 rounded-full opacity-50"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CopilotKit Popup */}
      <CopilotPopup
        instructions={`You are Destiny AI, the intelligent cake design assistant for Destiny Bakes in Chirundu, Zambia. Help ${user.firstName} create their perfect custom cake by:

1. Understanding their celebration and preferences
2. Guiding them through flavor, size, and design choices
3. Providing personalized recommendations based on their needs
4. Using the available actions to update their cake specifications
5. Being enthusiastic and helpful throughout the process

Current user: ${user.firstName}
Current specs: ${JSON.stringify(cakeSpecs)}
Available flavors: ${flavors.map(f => f.name).join(', ')}

Be conversational, friendly, and focus on making their cake design experience magical!`}
        labels={{
          title: "🎂 Destiny AI - Your Cake Design Assistant",
          initial: `Hi ${user.firstName}! I'm Destiny AI, your personal cake design assistant. I'm here to help you create the perfect cake for your special celebration. What occasion are we designing for today? ✨`,
        }}
        className="copilot-popup-destiny"
      />
    </div>
  )
}