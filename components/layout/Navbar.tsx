'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  SignInButton, 
  SignUpButton, 
  UserButton, 
  SignedIn, 
  SignedOut,
  useUser 
} from '@clerk/nextjs'

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useUser()

  return (
    <nav className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">🎂</span>
          </div>
          <span className="font-display text-2xl font-bold text-gradient-pink">
            Destiny Bakes
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/catalog" className="hover:text-primary-600 transition-colors">
            Catalog
          </Link>
          <Link href="/cake-designer" className="hover:text-primary-600 transition-colors">
            Custom Design
          </Link>
          <Link href="/about" className="hover:text-primary-600 transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-primary-600 transition-colors">
            Contact
          </Link>
          
          <SignedOut>
            <div className="flex items-center space-x-4">
              <SignInButton mode="modal">
                <button className="hover:text-primary-600 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn-primary">
                  Order Now
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
          
          <SignedIn>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="hover:text-primary-600 transition-colors">
                Dashboard
              </Link>
              {user?.publicMetadata?.role === 'admin' && (
                <Link href="/admin" className="hover:text-primary-600 transition-colors">
                  Admin
                </Link>
              )}
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
                userProfileMode="modal"
                afterSignOutUrl="/"
              />
            </div>
          </SignedIn>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
            />
          </svg>
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 py-4 border-t border-gray-200">
          <div className="flex flex-col space-y-4">
            <Link href="/catalog" className="hover:text-primary-600 transition-colors">
              Catalog
            </Link>
            <Link href="/cake-designer" className="hover:text-primary-600 transition-colors">
              Custom Design
            </Link>
            <Link href="/about" className="hover:text-primary-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-primary-600 transition-colors">
              Contact
            </Link>
            
            <SignedOut>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <SignInButton mode="modal">
                  <button className="text-left hover:text-primary-600 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn-primary text-center">
                    Order Now
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
            
            <SignedIn>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <Link href="/dashboard" className="hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
                {user?.publicMetadata?.role === 'admin' && (
                  <Link href="/admin" className="hover:text-primary-600 transition-colors">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Welcome, {user?.firstName}!</span>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8"
                      }
                    }}
                    afterSignOutUrl="/"
                  />
                </div>
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  )
}