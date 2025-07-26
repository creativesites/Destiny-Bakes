import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">🎂</span>
            </div>
            <span className="font-display text-2xl font-bold text-gradient-pink">
              Destiny Bakes
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/catalog" className="hover:text-primary-600 transition-colors">
              Catalog
            </Link>
            <Link href="/custom-cake" className="hover:text-primary-600 transition-colors">
              Custom Design
            </Link>
            <Link href="/about" className="hover:text-primary-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-primary-600 transition-colors">
              Contact
            </Link>
            <Link href="/signin" className="btn-primary">
              Order Now
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="font-display text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-gradient-pink">Custom Cakes</span>
                <br />
                <span className="text-gray-800">Made with</span>
                <br />
                <span className="text-gradient-gold font-script text-6xl lg:text-8xl">Love</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-lg text-balance">
                Experience the magic of AI-powered cake design. From birthday celebrations to wedding moments, 
                we create edible masterpieces that tell your story.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/cake-designer" className="btn-primary text-center">
                🎨 Design Your Cake
              </Link>
              <Link href="/catalog" className="btn-secondary text-center">
                Browse Catalog
              </Link>
            </div>
            
            <div className="flex items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Fresh Daily</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                <span>AI-Powered Design</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-accent-500 rounded-full"></span>
                <span>Local Delivery</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden cake-shadow">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-accent-100 animate-pulse rounded-3xl flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-6xl animate-cake-bounce">🎂</div>
                  <p className="text-gray-600 font-medium">Beautiful cake showcase coming soon</p>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-accent-200 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-2xl">✨</span>
            </div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center animate-bounce" style={{animationDelay: '0.5s'}}>
              <span className="text-xl">💕</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-display text-4xl font-bold text-gray-800">
              Why Choose Destiny Bakes?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine traditional baking expertise with cutting-edge AI technology 
              to create cakes that are both delicious and visually stunning.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-elegant text-center space-y-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="font-display text-2xl font-semibold">AI-Powered Design</h3>
              <p className="text-gray-600">
                Our intelligent design assistant helps you create the perfect cake 
                with personalized recommendations and instant previews.
              </p>
            </div>
            
            <div className="card-elegant text-center space-y-4">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🏠</span>
              </div>
              <h3 className="font-display text-2xl font-semibold">Home-Made Quality</h3>
              <p className="text-gray-600">
                Every cake is lovingly crafted in our home kitchen in Chirundu, 
                using only the finest local and imported ingredients.
              </p>
            </div>
            
            <div className="card-elegant text-center space-y-4">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="font-display text-2xl font-semibold">Local Delivery</h3>
              <p className="text-gray-600">
                Fresh delivery throughout Chirundu and surrounding areas. 
                Real-time tracking keeps you updated on your order progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="font-display text-4xl lg:text-5xl font-bold">
              Ready to Create Your
              <span className="text-gradient-pink"> Dream Cake</span>?
            </h2>
            
            <p className="text-xl text-gray-600">
              Start your cake journey today with our AI-powered design tools. 
              From concept to delivery, we make every step magical.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cake-designer" className="btn-primary text-lg px-8 py-4">
                🎨 Start Designing Now
              </Link>
              <Link href="/catalog" className="btn-secondary text-lg px-8 py-4">
                Browse Our Creations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎂</span>
                <span className="font-display text-xl font-bold">Destiny Bakes</span>
              </div>
              <p className="text-gray-400">
                Creating magical moments with custom cakes in Chirundu, Zambia.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/catalog" className="block text-gray-400 hover:text-white transition-colors">
                  Catalog
                </Link>
                <Link href="/cake-designer" className="block text-gray-400 hover:text-white transition-colors">
                  Custom Design
                </Link>
                <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>📍 Chirundu, Zambia</p>
                <p>📞 +260 XXX XXXXX</p>
                <p>✉️ info@destinybakes.zm</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Facebook
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Instagram
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Destiny Bakes. Made with ❤️ in Zambia.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}