'use client'
import { useState, useEffect } from 'react'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link' 
import { useUser } from '@clerk/nextjs'

interface Order {
  id: string
  order_number: string
  cake_config: any
  total_amount: number
  status: string
  delivery_date: string
  created_at: string
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (isLoaded && user) {
      fetchUserOrders()
    }
  }, [isLoaded, user])

  const fetchUserOrders = async () => {
    try {
      // First, ensure user profile exists
      let profileResponse = await fetch('/api/user/profile')
      
      if (!profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.needsCreation) {
          // Create profile
          profileResponse = await fetch('/api/user/profile', { method: 'POST' })
          if (!profileResponse.ok) {
            console.error('Failed to create user profile')
            return
          }
        }
      }

      // Now fetch orders
      const response = await fetch('/api/orders/user')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.data || [])
      } else {
        console.error('Failed to fetch orders:', await response.text())
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">🎂</div>
      </div>
    )
  }

  if (!user) {
    redirect('/sign-in')
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.fullName?.split(' ')[0]}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Ready to create something delicious today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link href="/cake-designer" className="card-elegant group hover:shadow-2xl transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="font-display text-xl font-semibold">Design New Cake</h3>
              <p className="text-gray-600">Create your perfect custom cake with AI assistance</p>
            </div>
          </Link>

          <Link href="/catalogue" className="card-elegant group hover:shadow-2xl transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="font-display text-xl font-semibold">Browse Catalogue</h3>
              <p className="text-gray-600">Explore our collection of signature cakes</p>
            </div>
          </Link>

          <Link href="/dashboard/orders" className="card-elegant group hover:shadow-2xl transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="font-display text-xl font-semibold">Track Orders</h3>
              <p className="text-gray-600">Monitor your order progress in real-time</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card-elegant">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-semibold">Recent Orders</h2>
                <Link href="/dashboard/orders" className="text-primary-600 hover:text-primary-700 font-medium">
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin text-3xl mb-2">🎂</div>
                  <p className="text-gray-600">Loading your orders...</p>
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🎂</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {order.cake_config?.flavor || 'Custom'} {order.cake_config?.shape || ''} Cake
                            </h3>
                            <p className="text-sm text-gray-600">Order #{order.order_number}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">K{order.total_amount.toFixed(2)}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'preparing' || order.status === 'baking' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Size: {order.cake_config?.size || 'N/A'} | Layers: {order.cake_config?.layers || 'N/A'}</span>
                        <span>Delivery: {order.delivery_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎂</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-6">Ready to create your first delicious cake?</p>
                  <Link href="/cake-designer" className="btn-primary">
                    Design Your First Cake
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Recommendations */}
            <div className="card-elegant">
              <h3 className="font-display text-xl font-semibold mb-4">✨ AI Recommendations</h3>
              <div className="space-y-3">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-800 font-medium">Perfect for this weekend!</p>
                  <p className="text-xs text-primary-600">Strawberry Birthday Cake based on your preferences</p>
                </div>
                <div className="p-3 bg-accent-50 rounded-lg">
                  <p className="text-sm text-accent-800 font-medium">Trending Now</p>
                  <p className="text-xs text-accent-600">Chocolate Fudge Delight - 40% of customers love it!</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card-elegant">
              <h3 className="font-display text-xl font-semibold mb-4">Your Sweet Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Orders Completed</span>
                  <span className="font-semibold">{orders.filter(o => o.status === 'delivered').length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Favorite Flavor</span>
                  <span className="font-semibold">🍓 Strawberry</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">{user.createdAt ? new Date(user.createdAt).getFullYear() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Upcoming Occasions */}
            <div className="card-elegant">
              <h3 className="font-display text-xl font-semibold mb-4">🎉 Upcoming Occasions</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">🎂</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Plan ahead for birthdays</p>
                    <p className="text-xs text-gray-600">Set reminders for special dates</p>
                  </div>
                </div>
                <Link href="/dashboard/occasions" className="btn-secondary w-full text-center text-sm">
                  Manage Occasions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}