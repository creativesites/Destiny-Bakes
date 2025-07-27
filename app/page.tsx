'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import { CopilotPopup } from '@copilotkit/react-ui'
import Image from 'next/image'

interface CatalogCake {
  id: string
  name: string
  description: string
  base_price: number
  images: string[]
  featured: boolean
  category: string
}

export default function HomePage() {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [featuredCakes, setFeaturedCakes] = useState<CatalogCake[]>([])
  const [catalogCakes, setCatalogCakes] = useState<CatalogCake[]>([])
  const [loadingCakes, setLoadingCakes] = useState(true)
  const sliderInterval = useRef<NodeJS.Timeout>()

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Design',
      description: 'Our intelligent design assistant helps you create the perfect cake with personalized recommendations and instant previews.',
      color: 'from-purple-400 to-purple-600',
      bg: 'bg-purple-50',
      image: '/images/icons/cupcake.png',
    },
    {
      icon: '🏠',
      title: 'Home-Made Quality',
      description: 'Every cake is lovingly crafted in our home kitchen in Chirundu, using only the finest local and imported ingredients.',
      color: 'from-rose-400 to-rose-600',
      bg: 'bg-rose-50',
      image: '/images/icons/cake.png',
    },
    {
      icon: '🚚',
      title: 'Local Delivery',
      description: 'Fresh delivery throughout Chirundu and surrounding areas. Real-time tracking keeps you updated on your order progress.',
      color: 'from-emerald-400 to-emerald-600',
      bg: 'bg-emerald-50',
      image: '/images/icons/food-delivery.png',
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
        description: "The page to navigate to (cake-designer, catalogue, about, contact)",
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
      availableActions: ["Order custom cake", "Browse catalogue", "Contact us"],
      specialOffers: "20% off first orders this month",
      location: "Chirundu, Zambia",
      businessHours: "Monday-Saturday 8AM-6PM"
    }
  })

  // Animation on mount
  useEffect(() => {
    setIsVisible(true)
    fetchFeaturedCakes()
    
    // Auto-rotate slider
    sliderInterval.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % (featuredCakes.length || 1))
    }, 5000)
    
    // Rotate features
    const featureInterval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length)
    }, 3000)
    
    return () => {
      clearInterval(sliderInterval.current)
      clearInterval(featureInterval)
    }
  }, [featuredCakes.length])



  const fetchFeaturedCakes = async () => {
    try {
      const response = await fetch('/api/cakes?featured=true')
      if (response.ok) {
        const data = await response.json()
        const cakes = data.data || []
        setFeaturedCakes(cakes.slice(0, 4)) // Limit to 4 for slider
        setCatalogCakes(cakes.slice(0, 8)) // Show 8 for catalogue section
      }
    } catch (error) {
      console.error('Error fetching featured cakes:', error)
    } finally {
      setLoadingCakes(false)
    }
  }

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
                <h1 className="font-display text-6xl lg:text-6xl font-bold leading-tight">
                  <span className="premium-gradient-text sparkle-effect">Custom Cakes</span>
                  <br />
                  <span className="text-gray-800 text-shadow-premium">Made with</span>
                  <br />
                  <span className="font-script text-7xl lg:text-6xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">Love</span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-gray-700 max-w-lg text-balance leading-relaxed">
                  Experience the magic of AI-powered cake design. From birthday celebrations to wedding moments, 
                  we create edible masterpieces that tell your story.
                </p>
              </div>
              
              {/* Interactive CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6">
                
                <Link 
                  href="/cake-designer" className="destiny-hero-button bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transform transition-all duration-300 hover:bg-white/30 hover:scale-105 interactive-scale">
                  <div className="blob1"></div>
                  <div className="blob2"></div>
                  <div className="inner text-gray-800 font-semibold text-lg">🎨 Design Your Cake</div>
                </Link>

                
                <Link 
                  href="/catalogue" 
                  className="group px-8 py-4 bg-white/20 backdrop-blur-lg border border-white/30 text-gray-800 font-semibold rounded-2xl shadow-xl transform transition-all duration-300 hover:bg-white/30 hover:scale-105 interactive-scale"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span className="text-2xl">✨</span>
                    <span className="text-lg">Browse Catalogue</span>
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
            
            {/* Right Content - Featured Cakes Slider */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative w-full h-96 lg:h-[600px] premium-card rounded-3xl overflow-hidden group">
                {loadingCakes ? (
                  <>
                    {/* Loading State */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 animate-pulse">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="text-6xl animate-spin">🎂</div>
                          <p className="text-gray-600">Loading amazing cakes...</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : featuredCakes.length > 0 ? (
                  <>
                    {/* Cake Slider */}
                    <div className="relative w-full h-full">
                     
                      <div
                          key={featuredCakes[0].id}
                          className={`hero-right-card inset-0 transition-all duration-700 transform opacity-100 `}
                        >
                          <div className="bg">
                            {/* Cake Image */}
                          {featuredCakes[0].images && featuredCakes[0].images[0] ? (
                            <img
                              src={`/images/catalogue/${featuredCakes[0].images[0]}`}
                              alt={featuredCakes[0].name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          
                          {/* Fallback */}
                          <div className={`w-full h-full bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center ${
                            featuredCakes[0].images && featuredCakes[0].images[0] ? 'hidden' : ''
                          }`}>
                            <div className="text-center space-y-4">
                              <div className="text-8xl">🎂</div>
                              <p className="text-xl font-semibold text-gray-700">{featuredCakes[0].name}</p>
                            </div>
                          </div>
                          {/* Overlay with cake info */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                                    {featuredCakes[0].category}
                                  </span>
                                  <span className="text-2xl font-bold">K{featuredCakes[0].base_price}</span>
                                </div>
                                <h3 className="text-2xl font-bold">{featuredCakes[0].name}</h3>
                                <p className="text-white/90 text-sm line-clamp-2">{featuredCakes[0].description}</p>
                              </div>
                            </div>
                          </div>
                          </div>
                          <div className="blob"></div>
                          
                          
                          
                        </div>
                    </div>
                    
                    {/* Slider Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {featuredCakes.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentSlide 
                              ? 'bg-white scale-125 shadow-lg' 
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* Navigation Arrows */}
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredCakes.length) % featuredCakes.length)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 group"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">‹</span>
                    </button>
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredCakes.length)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 group"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">›</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* No Cakes State */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-6">
                          <div className="text-8xl lg:text-9xl animate-bounce filter drop-shadow-2xl">🎂</div>
                          <div className="space-y-2">
                            <p className="text-xl font-semibold text-gray-700">Beautiful Cakes Coming Soon</p>
                            <p className="text-gray-600">Check back for our featured creations</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Catalogue Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-cream-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full opacity-30 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-6 mb-16">
            <h2 className="font-display text-5xl lg:text-6xl font-bold">
              <span className="premium-gradient-text">Our Signature</span>
              <br />
              <span className="text-gray-800">Creations</span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore our collection of designer cakes, each crafted with passion and perfection. 
              From elegant celebrations to whimsical designs.
            </p>
          </div>
          
          {loadingCakes ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-3xl shadow-xl overflow-hidden animate-pulse">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : catalogCakes.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {catalogCakes.map((cake, index) => (
                  <div
                    key={cake.id}
                    className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      {cake.images && cake.images[0] ? (
                        <img
                          src={`/images/catalogue/${cake.images[0]}`}
                          alt={cake.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      
                      {/* Fallback */}
                      <div className={`w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center ${
                        cake.images && cake.images[0] ? 'hidden' : ''
                      }`}>
                        <span className="text-6xl opacity-50">🎂</span>
                      </div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                        {cake.category}
                      </div>
                      
                      {/* Featured Badge */}
                      {cake.featured && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          ⭐ Featured
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <Link 
                          href={`/catalogue`}
                          className="transform translate-y-8 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-gray-800 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-display text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                        {cake.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {cake.description}
                      </p>
                      
                      {/* Price and Action */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-500">Starting from</span>
                          <div className="text-2xl font-bold text-gray-800">
                            K{cake.base_price.toFixed(2)}
                          </div>
                        </div>
                        <Link 
                          href={`/cake-designer/interactive?catalogueDesign=${cake.id}`}
                          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          Order Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* View All Button */}
              <div className="text-center">
                <Link 
                  href="/catalogue" 
                  className="group inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold text-lg rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl"
                >
                  <span>View Full Catalogue</span>
                  <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-8xl mb-6 opacity-50">🍰</div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">Coming Soon!</h3>
              <p className="text-gray-600 text-lg mb-8">We're adding beautiful cakes to our catalogue. Check back soon!</p>
              <Link 
                href="/cake-designer" 
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <span>🎨</span>
                <span>Design Custom Cake</span>
              </Link>
            </div>
          )}
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
                <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center bg-white shadow-2xl p-2`}>
                  {/* <span className="text-4xl">{feature.icon}</span> */}
                  <Image src={feature.image} alt={feature.title} width={80} height={80} />
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
                href="/cake-designer"  className="destiny-get-started-btn-container">
                <div className="btn-back"></div>
                <div className="btn-front">
                  <p>🎨 Design Your Cake</p>
                  <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <g fill="#395d7a">
                        <path
                          d="M8 2.5a5.494 5.494 0 00-4.558 2.42.75.75 0 01-1.242-.84 7 7 0 110 7.841.75.75 0 111.242-.841A5.5 5.5 0 108 2.5z"
                        ></path>
                        <path
                          d="M7.245 4.695a.75.75 0 00-.05 1.06l1.36 1.495H1.75a.75.75 0 000 1.5h6.805l-1.36 1.495a.75.75 0 001.11 1.01l2.5-2.75a.75.75 0 000-1.01l-2.5-2.75a.75.75 0 00-1.06-.05z"
                        ></path>
                      </g>
                    </g>
                  </svg>
                </div>
              </Link>

              
              {/* <Link 
                href="/catalogue" 
                className="group px-10 py-5 bg-white/20 backdrop-blur-lg border-2 border-white/30 text-white font-bold text-xl rounded-2xl shadow-xl transform transition-all duration-300 hover:bg-white/30 hover:scale-105 interactive-scale"
              >
                <span className="flex items-center justify-center space-x-3">
                  <span className="text-3xl">✨</span>
                  <span>Browse Our Creations</span>
                </span>
              </Link> */}
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
              <Image 
                      src="/images/logo-transparent-bg.png" 
                      alt="Destiny Bakes Logo" 
                      width={60} 
                      height={60}
                      className="drop-shadow-2xl"
                      priority
                    />
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
                {['Catalogue', 'Custom Design', 'About Us', 'Contact'].map((link) => (
                  <Link 
                    key={link}
                    href={link === 'Catalogue' ? '/catalogue' : `/${link.toLowerCase().replace(' ', '-')}`} 
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
                  <span>+260 974 147 414</span>
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
              <span>&copy; 2025 Destiny Bakes.</span>
              <span>Developed by</span>
              <span className="text-red-500 animate-pulse">❤️</span>
              <span>Winston Zulu.</span>
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