'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import { CopilotPopup } from '@copilotkit/react-ui'

export default function HomePage() {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Design',
      description: 'Our intelligent design assistant helps you create the perfect cake with personalized recommendations and instant previews.',
      color: 'from-purple-400 to-purple-600',
      bg: 'bg-purple-50',
    },
    {
      icon: '🏠',
      title: 'Home-Made Quality',
      description: 'Every cake is lovingly crafted in our home kitchen in Chirundu, using only the finest local and imported ingredients.',
      color: 'from-rose-400 to-rose-600',
      bg: 'bg-rose-50',
    },
    {
      icon: '🚚',
      title: 'Local Delivery',
      description: 'Fresh delivery throughout Chirundu and surrounding areas. Real-time tracking keeps you updated on your order progress.',
      color: 'from-emerald-400 to-emerald-600',
      bg: 'bg-emerald-50',
    },
  ]

  // CopilotKit actions for interactive homepage
  useCopilotAction({
    name: "navigateToPage",
    description: "Navigate user to different pages of the website",
    parameters: [
      {
        name: "page",
        type: "string",
        description: "The page to navigate to (cake-designer, catalog, about, contact)",
        required: true,
      },
    ],
    handler: async ({ page }) => {
      window.location.href = `/${page}`
      return `Navigating to ${page} page`
    },
  })

  useCopilotAction({
    name: "explainFeature",
    description: "Explain a specific feature of Destiny Bakes",
    parameters: [
      {
        name: "feature",
        type: "string",
        description: "The feature to explain (ai-design, quality, delivery, pricing)",
        required: true,
      },
    ],
    handler: async ({ feature }) => {
      const explanations = {
        "ai-design": "Our AI-powered cake designer uses advanced algorithms to help you visualize your perfect cake. It suggests flavors, decorations, and designs based on your preferences and occasion.",
        "quality": "We use only premium ingredients sourced locally and internationally. Each cake is made fresh to order in our certified home kitchen with love and attention to detail.",
        "delivery": "We offer same-day delivery within Chirundu and surrounding areas. Our delivery tracking system keeps you updated in real-time about your order status.",
        "pricing": "Our pricing is transparent and competitive. Custom cakes start from ZMW 150, with pricing based on size, complexity, and ingredients. We offer payment plans for larger orders."
      }
      return explanations[feature as keyof typeof explanations] || "Feature explanation not found."
    },
  })

  // Make homepage data available to CopilotKit
  useCopilotReadable({
    description: "Current homepage information",
    value: {
      currentSection: "homepage",
      availableActions: ["Order custom cake", "Browse catalog", "Contact us"],
      specialOffers: "20% off first orders this month",
      location: "Chirundu, Zambia",
      businessHours: "Monday-Saturday 8AM-6PM"
    }
  })

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />

      {/* Hero Section with Premium Design */}
      <section className="relative min-h-screen flex items-center premium-hero">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-20 animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 right-1/3 w-16 h-16 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full opacity-20 animate-float" style={{animationDelay: '0.5s'}}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="space-y-6">
                <h1 className="font-display text-6xl lg:text-8xl font-bold leading-tight">
                  <span className="premium-gradient-text sparkle-effect">Custom Cakes</span>
                  <br />
                  <span className="text-gray-800 text-shadow-premium">Made with</span>
                  <br />
                  <span className="font-script text-7xl lg:text-9xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">Love</span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-gray-700 max-w-lg text-balance leading-relaxed">
                  Experience the magic of AI-powered cake design. From birthday celebrations to wedding moments, 
                  we create edible masterpieces that tell your story.
                </p>
              </div>
              
              {/* Interactive CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6">
                <Link 
                  href="/cake-designer" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-semibold rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl shimmer-effect interactive-scale"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span className="text-2xl">🎨</span>
                    <span className="text-lg">Design Your Cake</span>
                  </span>
                </Link>
                
                <Link 
                  href="/catalog" 
                  className="group px-8 py-4 bg-white/20 backdrop-blur-lg border border-white/30 text-gray-800 font-semibold rounded-2xl shadow-xl transform transition-all duration-300 hover:bg-white/30 hover:scale-105 interactive-scale"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span className="text-2xl">✨</span>
                    <span className="text-lg">Browse Catalog</span>
                  </span>
                </Link>
              </div>
              
              {/* Status Indicators */}
              <div className="flex items-center space-x-8 text-sm">
                <div className="flex items-center space-x-3 premium-card px-4 py-2 rounded-full">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="font-medium">Fresh Daily</span>
                </div>
                <div className="flex items-center space-x-3 premium-card px-4 py-2 rounded-full">
                  <span className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></span>
                  <span className="font-medium">AI-Powered</span>
                </div>
                <div className="flex items-center space-x-3 premium-card px-4 py-2 rounded-full">
                  <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></span>
                  <span className="font-medium">Local Delivery</span>
                </div>
              </div>
            </div>
            
            {/* Right Content - Enhanced Cake Showcase */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative w-full h-96 lg:h-[600px] premium-card rounded-3xl overflow-hidden group">
                {/* Gradient Background with Animation */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 animate-gradient-shift">
                  <div className="absolute inset-0 bg-mesh opacity-30"></div>
                </div>
                
                {/* Cake Display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-6 transform transition-all duration-500 group-hover:scale-110">
                    <div className="text-8xl lg:text-9xl animate-cake-bounce filter drop-shadow-2xl">🎂</div>
                    <div className="space-y-2">
                      <p className="text-xl font-semibold text-gray-700">Beautiful Cake Showcase</p>
                      <p className="text-gray-600">AI-Generated Previews Coming Soon</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center animate-float shadow-2xl">
                  <span className="text-3xl">✨</span>
                </div>
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full flex items-center justify-center animate-float shadow-2xl" style={{animationDelay: '1s'}}>
                  <span className="text-2xl">💕</span>
                </div>
                <div className="absolute top-1/4 -left-4 w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center animate-float shadow-lg" style={{animationDelay: '2s'}}>
                  <span className="text-lg">🌟</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 aurora-bg opacity-50"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-6 mb-20">
            <h2 className="font-display text-5xl lg:text-6xl font-bold">
              <span className="premium-gradient-text">Why Choose</span>
              <br />
              <span className="text-gray-800">Destiny Bakes?</span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We combine traditional baking expertise with cutting-edge AI technology 
              to create cakes that are both delicious and visually stunning.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`premium-card p-8 text-center space-y-6 floating-card transition-all duration-500 ${
                  currentFeature === index ? 'scale-105 glow-shadow' : ''
                }`}
                style={{
                  animationDelay: `${index * 200}ms`
                }}
              >
                <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center bg-gradient-to-r ${feature.color} shadow-2xl`}>
                  <span className="text-4xl">{feature.icon}</span>
                </div>
                
                <h3 className="font-display text-2xl lg:text-3xl font-bold text-gray-800">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed text-lg">
                  {feature.description}
                </p>
                
                {/* Interactive Element */}
                <div className={`w-full h-1 rounded-full bg-gradient-to-r ${feature.color} opacity-20 transition-all duration-300 ${
                  currentFeature === index ? 'opacity-100' : ''
                }`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-10">
            <h2 className="font-display text-5xl lg:text-7xl font-bold text-white leading-tight">
              Ready to Create Your
              <br />
              <span className="font-script text-6xl lg:text-8xl bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Dream Cake</span>?
            </h2>
            
            <p className="text-xl lg:text-2xl text-white/90 leading-relaxed">
              Start your cake journey today with our AI-powered design tools. 
              From concept to delivery, we make every step magical.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Link 
                href="/cake-designer" 
                className="group px-10 py-5 bg-white text-purple-600 font-bold text-xl rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl interactive-scale"
              >
                <span className="flex items-center justify-center space-x-3">
                  <span className="text-3xl">🎨</span>
                  <span>Start Designing Now</span>
                </span>
              </Link>
              
              <Link 
                href="/catalog" 
                className="group px-10 py-5 bg-white/20 backdrop-blur-lg border-2 border-white/30 text-white font-bold text-xl rounded-2xl shadow-xl transform transition-all duration-300 hover:bg-white/30 hover:scale-105 interactive-scale"
              >
                <span className="flex items-center justify-center space-x-3">
                  <span className="text-3xl">✨</span>
                  <span>Browse Our Creations</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 lg:gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <span className="text-4xl">🎂</span>
                <span className="font-display text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Destiny Bakes
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Creating magical moments with custom cakes in Chirundu, Zambia. 
                Where technology meets tradition.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-display text-xl font-bold text-white">Quick Links</h4>
              <div className="space-y-3">
                {['Catalog', 'Custom Design', 'About Us', 'Contact'].map((link) => (
                  <Link 
                    key={link}
                    href={`/${link.toLowerCase().replace(' ', '-')}`} 
                    className="block text-gray-300 hover:text-pink-400 transition-colors duration-300 transform hover:translate-x-2"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-display text-xl font-bold text-white">Contact Info</h4>
              <div className="space-y-3 text-gray-300">
                <p className="flex items-center space-x-2">
                  <span>📍</span>
                  <span>Chirundu, Zambia</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>+260 XXX XXXXX</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span>✉️</span>
                  <span>info@destinybakes.zm</span>
                </p>
                <p className="flex items-center space-x-2">
                  <span>🕒</span>
                  <span>Mon-Sat 8AM-6PM</span>
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-display text-xl font-bold text-white">Follow Our Journey</h4>
              <div className="flex space-x-4">
                {['Facebook', 'Instagram', 'WhatsApp'].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300"
                  >
                    {social[0]}
                  </a>
                ))}
              </div>
              <div className="premium-card p-4 rounded-xl">
                <p className="text-sm text-gray-300 mb-2">Special Offer</p>
                <p className="font-bold text-pink-400">20% off first orders!</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 flex items-center justify-center space-x-2">
              <span>&copy; 2024 Destiny Bakes.</span>
              <span>Made with</span>
              <span className="text-red-500 animate-pulse">❤️</span>
              <span>in Zambia.</span>
            </p>
          </div>
        </div>
      </footer>

      {/* CopilotKit Popup with Enhanced Styling */}
      <CopilotPopup
        instructions="You are an AI assistant for Destiny Bakes, a premium home-based bakery in Chirundu, Zambia. Help customers with cake orders, design ideas, and information about our services. You can navigate users to different pages, explain features, and provide helpful guidance about custom cake ordering."
        labels={{
          title: "🎂 Destiny Bakes AI Assistant",
          initial: "Hi! I'm your personal cake design assistant. How can I help you create something magical today? ✨",
        }}
        className="copilot-popup-destiny"
      />
    </div>
  )
}