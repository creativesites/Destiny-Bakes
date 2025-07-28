'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { isAdmin } from '@/lib/admin-client'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface AdminLayoutProps {
  children: React.ReactNode
}

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: '🏠' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/occasions', label: 'Occasions', icon: '🎉' },
  { href: '/admin/catalog', label: 'Catalog', icon: '🎂' },
  { href: '/admin/customers', label: 'Customers', icon: '👥' },
  { href: '/admin/pages', label: 'Pages', icon: '📄' },
  { href: '/admin/templates', label: 'Templates', icon: '🎨' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { href: '/admin/tracking', label: 'Tracking', icon: '📍' },
  { href: '/admin/preview-images', label: 'Preview Images', icon: '🖼️' },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isLoaded || !user) return

      try {
        const adminStatus = await isAdmin(user.id)
        setIsAdminUser(adminStatus)
        
        if (!adminStatus && pathname !== '/admin') {
          router.push('/admin')
        }
      } catch (error) {
        console.error('Error checking admin access:', error)
        router.push('/admin')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [user, isLoaded, pathname, router])

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-cream-50 to-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  // Let the main dashboard page handle admin setup
  if (pathname === '/admin') {
    return <>{children}</>
  }

  if (!isAdminUser) {
    router.push('/admin')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-cream-50 to-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          {sidebarOpen ? '✕' : '☰'}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/" className="flex items-center space-x-3">
              <div className="text-2xl">🎂</div>
              <div>
                <h1 className="font-display text-xl font-bold text-gray-800">
                  Destiny Bakes
                </h1>
                <p className="text-sm text-gray-500">Admin Panel</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.firstName?.[0] || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        <div className="min-h-screen p-4 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}