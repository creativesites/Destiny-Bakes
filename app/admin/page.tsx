'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { isAdmin, getAdminStats, AdminStats, setSelfAsAdmin } from '@/lib/admin-client'
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import { CopilotPopup } from '@copilotkit/react-ui'
import Link from 'next/link'

export default function AdminDashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [showSetupDialog, setShowSetupDialog] = useState(false)

  // CopilotKit actions for admin
  useCopilotAction({
    name: "navigateToAdminSection",
    description: "Navigate to different admin sections",
    parameters: [
      {
        name: "section",
        type: "string",
        description: "The admin section to navigate to (orders, occasions, customers, analytics)",
        required: true,
      },
    ],
    handler: async ({ section }) => {
      router.push(`/admin/${section}`)
      return `Navigating to ${section} section`
    },
  })

  useCopilotAction({
    name: "refreshStats",
    description: "Refresh admin dashboard statistics",
    parameters: [],
    handler: async () => {
      if (!user?.id) return "User not authenticated"
      const newStats = await getAdminStats(user.id)
      if (newStats) {
        setStats(newStats)
        return "Dashboard statistics refreshed successfully"
      }
      return "Failed to refresh statistics"
    },
  })

  // Make admin data available to CopilotKit
  useCopilotReadable({
    description: "Current admin dashboard information",
    value: {
      isAdmin: isAdminUser,
      stats,
      sections: ["Orders", "Occasions", "Customers", "Analytics"],
      userName: user?.firstName || 'Admin'
    }
  })

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isLoaded || !user) return

      try {
        const adminStatus = await isAdmin(user.id)
        setIsAdminUser(adminStatus)
        
        if (adminStatus) {
          const dashboardStats = await getAdminStats(user.id)
          setStats(dashboardStats)
        } else {
          // Check if this might be the first admin setup
          setShowSetupDialog(true)
        }
      } catch (error) {
        console.error('Error checking admin access:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAdminAccess()
  }, [user, isLoaded])

  const handleSetupAdmin = async () => {
    try {
      if (!user?.id) return
      const success = await setSelfAsAdmin(user.id, user)
      if (success) {
        setIsAdminUser(true)
        setShowSetupDialog(false)
        const dashboardStats = await getAdminStats(user.id)
        setStats(dashboardStats)
      } else {
        alert('Failed to set admin access. Please try again.')
      }
    } catch (error) {
      console.error('Error setting up admin:', error)
      alert('Error setting up admin access.')
    }
  }

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

  if (showSetupDialog && !isAdminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-cream-50 to-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="text-6xl mb-6">🛠️</div>
            <h1 className="font-display text-3xl font-bold text-gray-800 mb-4">
              Admin Setup
            </h1>
            <p className="text-gray-600 mb-8">
              It looks like you might be setting up admin access for the first time. 
              Would you like to set yourself as an admin?
            </p>
            <div className="space-y-4">
              <Button 
                onClick={handleSetupAdmin}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
              >
                Yes, Set Me As Admin
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                No, Go Back to Homepage
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-cream-50 to-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="font-display text-3xl font-bold text-gray-800 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-8">
              You don't have admin access to this dashboard. Please contact an administrator if you need access.
            </p>
            <Button onClick={() => router.push('/')}>
              Return to Homepage
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-cream-50 to-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-display text-5xl font-bold text-gray-800 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Welcome back, {user.firstName}! Manage your bakery operations from here.
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-2">📋</div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalOrders}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-2">⏳</div>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
              <div className="text-sm text-gray-600">Pending Orders</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-gray-800">ZMW {stats.totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalCustomers}</div>
              <div className="text-sm text-gray-600">Customers</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-gray-800">ZMW {stats.averageOrderValue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Avg Order</div>
            </div>
          </div>
        )}

        {/* Main Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Orders Management */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-6xl mb-6 text-center">📦</div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-4 text-center">
              Order Management
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              View, update, and track all customer orders and their status.
            </p>
            <Link href="/admin/orders">
              <Button className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800">
                Manage Orders
              </Button>
            </Link>
          </div>

          {/* Occasions Management */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-6xl mb-6 text-center">🎉</div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-4 text-center">
              Occasions
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Manage special occasions, themes, and seasonal offerings.
            </p>
            <Link href="/admin/occasions">
              <Button className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800">
                Manage Occasions
              </Button>
            </Link>
          </div>

          {/* Catalog Management */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-6xl mb-6 text-center">🎂</div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-4 text-center">
              Cake Catalog
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Manage cake offerings, pricing, and featured items.
            </p>
            <Link href="/admin/catalog">
              <Button className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800">
                Manage Catalog
              </Button>
            </Link>
          </div>

          {/* Customer Management */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-6xl mb-6 text-center">👥</div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-4 text-center">
              Customers
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              View customer profiles, orders history, and preferences.
            </p>
            <Link href="/admin/customers">
              <Button className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800">
                View Customers
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="font-display text-3xl font-bold text-gray-800 mb-8">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/admin/orders?status=pending">
              <div className="p-6 border-2 border-gray-200 rounded-2xl hover:border-gray-400 transition-all duration-300 hover:shadow-lg cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">⏰</div>
                  <div>
                    <h3 className="font-bold text-gray-800">Pending Orders</h3>
                    <p className="text-gray-600">Review new orders</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/orders?status=ready">
              <div className="p-6 border-2 border-gray-200 rounded-2xl hover:border-gray-400 transition-all duration-300 hover:shadow-lg cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">🎂</div>
                  <div>
                    <h3 className="font-bold text-gray-800">Ready for Pickup</h3>
                    <p className="text-gray-600">Cakes ready for delivery</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="/admin/analytics">
              <div className="p-6 border-2 border-gray-200 rounded-2xl hover:border-gray-400 transition-all duration-300 hover:shadow-lg cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">📈</div>
                  <div>
                    <h3 className="font-bold text-gray-800">View Analytics</h3>
                    <p className="text-gray-600">Business insights</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* CopilotKit Popup for Admin */}
      <CopilotPopup
        instructions={`You are the Admin Assistant for Destiny Bakes. Help ${user.firstName} manage their bakery operations by:

1. Providing insights about orders, customers, and business metrics
2. Guiding them through admin functions
3. Helping with order management and status updates
4. Offering suggestions for business improvements
5. Explaining features and navigation

Current admin: ${user.firstName}
Dashboard stats: ${JSON.stringify(stats)}
Available sections: Orders, Occasions, Catalog, Customers, Analytics

Be professional, helpful, and focus on efficient bakery management!`}
        labels={{
          title: "🏪 Admin Assistant - Destiny Bakes",
          initial: `Hello ${user.firstName}! I'm your admin assistant. I can help you manage orders, view analytics, and navigate the admin dashboard. What would you like to work on today?`,
        }}
        className="copilot-popup-destiny"
      />
    </div>
  )
}