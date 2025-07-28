'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  SignInButton, 
  SignUpButton, 
  UserButton, 
  SignedIn, 
  SignedOut,
  useUser 
} from '@clerk/nextjs'
import Image from 'next/image'
import { isAdmin, getAdminStats, AdminStats, setSelfAsAdmin } from '@/lib/admin-client'

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, isLoaded } = useUser()
  const [isAdminUser, setIsAdminUser] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserRole()
    }
  }, [isLoaded, user])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isLoaded || !user) return

      try {
        const adminStatus = await isAdmin(user.id)
        setIsAdminUser(adminStatus)
        
        
      } catch (error) {
        console.error('Error checking admin access:', error)
      } 
    }

    checkAdminAccess()
  }, [user, isLoaded])

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.data?.role || 'customer')
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole('customer')
    }
  }

  return (
    <>
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/20 shadow-lg shadow-black/5' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24">
            
            {/* Left Navigation - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-8 flex-1 justify-start">
              <NavLink href="/catalogue" className="hover:text-purple-600">Our Cakes</NavLink>
              <NavLink href="/cake-designer" className="hover:text-purple-600">Design Your Cake</NavLink>
            </div>

            {/* Centered Logo - Always centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link href="/" className="relative group">
                <div className="transform transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-1">
                  <div className="relative">
                    <Image 
                      src="/images/logo-transparent-bg.png" 
                      alt="Destiny Bakes Logo" 
                      width={100} 
                      height={100}
                      className="drop-shadow-2xl"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right Navigation - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-6 flex-1 justify-end">
              <SignedOut>
                <div className="flex items-center space-x-4">
                  <SignInButton mode="modal">
                    <button className="nav-button-secondary">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="nav-button-primary">
                      <span>Order Now</span>
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
              
              <SignedIn>
                <div className="flex items-center space-x-4">
                  <NavLink href="/dashboard">Dashboard</NavLink>
                  {isAdminUser && (
                    <NavLink href="/admin" className="admin-link">
                      Admin
                    </NavLink>
                  )}
                  <div className="relative group">
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: "w-11 h-11 rounded-full ring-2 ring-transparent group-hover:ring-purple-200 transition-all duration-300 transform group-hover:scale-110"
                        }
                      }}
                      userProfileMode="modal"
                      afterSignOutUrl="/"
                    />
                  </div>
                </div>
              </SignedIn>
            </div>
            
            {/* Mobile Menu Button - Visible only on mobile */}
            <button 
              className="lg:hidden relative w-10 h-10 flex items-center justify-center group z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 relative flex flex-col justify-center items-center">
                <span className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ease-out ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1.5'
                }`}></span>
                <span className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ease-out ${
                  isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}></span>
                <span className={`block h-0.5 w-6 bg-gray-700 transition-all duration-300 ease-out ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1.5'
                }`}></span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu - Slides down */}
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200/20 pt-20">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                <MobileNavLink href="/catalogue" onClick={() => setIsMobileMenuOpen(false)}>
                  Our Cakes
                </MobileNavLink>
                <MobileNavLink href="/cake-designer" onClick={() => setIsMobileMenuOpen(false)}>
                  Design Your Cake
                </MobileNavLink>
                
                <SignedOut>
                  <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200/30">
                    <SignInButton mode="modal">
                      <button className="mobile-nav-button-secondary" onClick={() => setIsMobileMenuOpen(false)}>
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="mobile-nav-button-primary" onClick={() => setIsMobileMenuOpen(false)}>
                        Order Now
                      </button>
                    </SignUpButton>
                  </div>
                </SignedOut>
                
                <SignedIn>
                  <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200/30">
                    <MobileNavLink href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      Dashboard
                    </MobileNavLink>
                    {userRole === 'admin' && (
                      <MobileNavLink href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                        Admin
                      </MobileNavLink>
                    )}
                    <div className="flex items-center space-x-3 py-2">
                      <UserButton 
                        appearance={{
                          elements: {
                            avatarBox: "w-10 h-10"
                          }
                        }}
                        afterSignOutUrl="/"
                      />
                      <span className="text-sm text-gray-600 font-medium">
                        Welcome, {user?.firstName}!
                      </span>
                    </div>
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-20 lg:h-24"></div>

      <style jsx global>{`
        /* Primary button styles */
        .nav-button-primary {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: linear-gradient(to right, #9333ea, #ec4899);
          color: white;
          padding: 0.625rem 1.5rem;
          border-radius: 9999px;
          font-weight: 500;
          transition: all 0.3s ease-out;
          overflow: hidden;
          z-index: 1;
        }
        
        .nav-button-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to right, #7e22ce, #db2777);
          opacity: 0;
          transition: opacity 0.3s ease-out;
          z-index: -1;
        }
        
        .nav-button-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 25px -5px rgba(147, 51, 234, 0.25);
        }
        
        .nav-button-primary:hover::before {
          opacity: 1;
        }
        
        .nav-button-primary:active {
          transform: scale(0.95);
        }
        
        /* Secondary button styles */
        .nav-button-secondary {
          position: relative;
          padding: 0.5rem 1rem;
          color: #374151;
          font-weight: 500;
          transition: all 0.3s ease-out;
        }
        
        .nav-button-secondary:hover {
          color: #9333ea;
        }
        
        .nav-button-secondary::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(to right, #9333ea, #ec4899);
          transition: all 0.3s ease-out;
          transform: translateX(-50%);
        }
        
        .nav-button-secondary:hover::after {
          width: 100%;
        }
        
        /* Mobile button styles */
        .mobile-nav-button-primary {
          width: 100%;
          background: linear-gradient(to right, #9333ea, #ec4899);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 500;
          transition: all 0.3s ease-out;
        }
        
        .mobile-nav-button-primary:active {
          transform: scale(0.95);
        }
        
        .mobile-nav-button-secondary {
          width: 100%;
          border: 2px solid #e5e7eb;
          color: #374151;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 500;
          transition: all 0.3s ease-out;
        }
        
        .mobile-nav-button-secondary:hover {
          border-color: #d8b4fe;
          color: #9333ea;
        }
        
        /* Admin link specific style */
        .admin-link {
          color: #9333ea;
          font-weight: 600;
          position: relative;
        }
        
        .admin-link:hover {
          color: #7e22ce;
        }
      `}</style>
    </>
  )
}

// Navigation Link Component
function NavLink({ 
  href, 
  children, 
  className = "",
  onClick
}: { 
  href: string; 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link 
      href={href} 
      className={`relative group text-gray-700 font-medium transition-all duration-300 hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 ${className}`}
      onClick={onClick}
    >
      <span className="relative inline-block">
        {children}
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 ease-out group-hover:w-full"></span>
      </span>
    </Link>
  )
}

// Mobile Navigation Link Component
function MobileNavLink({ 
  href, 
  children, 
  onClick 
}: { 
  href: string; 
  children: React.ReactNode; 
  onClick?: () => void 
}) {
  return (
    <Link 
      href={href} 
      onClick={onClick} 
      className="block py-3 px-4 text-gray-700 font-medium rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 active:translate-x-1"
    >
      {children}
    </Link>
  )
}