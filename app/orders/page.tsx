'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { CopilotChat, useCopilotReadable, useCopilotAction } from '@copilotkit/react-ui'
import { CopilotSidebar } from '@copilotkit/react-ui'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Order } from '@/types/database'
import Link from 'next/link'

export default function OrdersPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showChat, setShowChat] = useState(false)
  const [selectedOrderForChat, setSelectedOrderForChat] = useState<Order | null>(null)

  // Make orders data available to Copilot
  useCopilotReadable({
    description: "Customer's order history and current orders",
    value: {
      totalOrders: orders.length,
      activeOrders: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)),
      recentOrders: orders.slice(0, 5),
      orderStatuses: orders.map(o => ({ orderNumber: o.order_number, status: o.status, amount: o.total_amount }))
    }
  })

  // Copilot action for order inquiries
  useCopilotAction({
    name: "getOrderDetails",
    description: "Get detailed information about a specific order by order number",
    parameters: [
      {
        name: "orderNumber",
        type: "string",
        description: "The order number to look up"
      }
    ],
    handler: async ({ orderNumber }) => {
      const order = orders.find(o => o.order_number === orderNumber)
      if (!order) {
        return { error: "Order not found. Please check the order number and try again." }
      }
      
      return {
        orderNumber: order.order_number,
        status: order.status,
        totalAmount: order.total_amount,
        paymentStatus: order.payment_status,
        deliveryDate: order.delivery_date,
        cakeDetails: order.cake_config,
        deliveryAddress: order.delivery_address,
        createdAt: order.created_at,
        lastUpdated: order.updated_at
      }
    }
  })

  // Copilot action for order support
  useCopilotAction({
    name: "getOrderSupport",
    description: "Provide support information for order-related questions",
    parameters: [
      {
        name: "question",
        type: "string",
        description: "The customer's question about their order"
      }
    ],
    handler: async ({ question }) => {
      return {
        supportInfo: "For immediate assistance with your order, you can:",
        options: [
          "Call our bakery directly at +260 974 147 414",
          "Send a WhatsApp message to +260 974 147 414",
          "Email us at orders@destinybakes.com",
          "Visit our location in Chirundu for in-person support"
        ],
        businessHours: "Monday - Saturday: 8:00 AM - 6:00 PM, Sunday: 10:00 AM - 4:00 PM",
        urgentMatter: "For urgent delivery changes or cancellations, please call immediately."
      }
    }
  })

  useEffect(() => {
    if (!isLoaded) return
    
    if (!user) {
      router.push('/sign-in')
      return
    }

    loadOrders()
  }, [user, isLoaded, router])

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      
      if (data.orders) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-purple-100 text-purple-800 border-purple-200',
      baking: 'bg-orange-100 text-orange-800 border-orange-200',
      decorating: 'bg-pink-100 text-pink-800 border-pink-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      out_for_delivery: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      preparing: '👨‍🍳',
      baking: '🔥',
      decorating: '🎨',
      ready: '📦',
      out_for_delivery: '🚚',
      delivered: '🎉',
      cancelled: '❌'
    }
    return icons[status as keyof typeof icons] || '📋'
  }

  const getStatusProgress = (status: string) => {
    const progressMap = {
      pending: 15,
      confirmed: 25,
      preparing: 40,
      baking: 60,
      decorating: 80,
      ready: 90,
      out_for_delivery: 95,
      delivered: 100,
      cancelled: 0
    }
    return progressMap[status as keyof typeof progressMap] || 0
  }

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-red-500'
    if (progress < 30) return 'bg-yellow-500'
    if (progress < 70) return 'bg-blue-500'
    if (progress < 100) return 'bg-purple-500'
    return 'bg-green-500'
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    if (filter === 'active') return !['delivered', 'cancelled'].includes(order.status)
    return order.status === filter
  })

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-cream-50 to-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
      <Navbar />
      
      {/* Floating particles background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-pink-200/30 to-rose-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-8 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-amber-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-gradient-to-br from-yellow-200/25 to-orange-200/25 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-8">
        {/* Enhanced Header with Animation */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-xl border border-white/20">
          <div className="flex justify-between items-center">
            <div className="relative">
              <div className="absolute -top-2 -left-2 w-24 h-24 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full blur-xl"></div>
              <h1 className="relative font-display text-5xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-3">
                My Orders
              </h1>
              <p className="text-gray-600 text-lg">
                Track your delicious cake orders and view your sweet history
              </p>
              <div className="flex items-center mt-3 space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm text-gray-500">{orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length} Active Orders</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-500">{orders.length} Total Orders</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <Link href="/cake-designer">
                <Button className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 hover:from-rose-600 hover:via-pink-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  🎂 Order New Cake
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => setShowChat(true)}
                className="border-2 border-rose-200 text-rose-600 hover:bg-rose-50 transition-all duration-300"
              >
                💬 Order Support
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Filter Tabs */}
        <div className="flex space-x-3 mb-8 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All Orders', count: orders.length, color: 'from-gray-500 to-gray-600', icon: '📋' },
            { key: 'active', label: 'Active', count: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length, color: 'from-blue-500 to-blue-600', icon: '⚡' },
            { key: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: 'from-yellow-500 to-orange-500', icon: '⏳' },
            { key: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length, color: 'from-green-500 to-green-600', icon: '✅' },
            { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length, color: 'from-emerald-500 to-green-600', icon: '🎉' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`relative px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 transform hover:scale-105 ${
                filter === tab.key 
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-black/20` 
                  : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white/90 border border-white/30 shadow-md'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  filter === tab.key 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Enhanced Orders List */}
        {filteredOrders.length === 0 ? (
          <Card variant="premium" className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-orange-50/50"></div>
            <div className="relative p-16 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative text-8xl mb-8 animate-bounce">🎂</div>
              </div>
              <h3 className="font-display text-3xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent mb-6">
                {filter === 'all' ? 'No Sweet Orders Yet' : `No ${filter} Orders`}
              </h3>
              <p className="text-gray-600 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                {filter === 'all' 
                  ? "Your cake journey awaits! Start by designing the perfect cake that matches your dreams."
                  : `You don't have any ${filter} orders at the moment. Check back soon!`
                }
              </p>
              <Link href="/cake-designer">
                <Button className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 hover:from-rose-600 hover:via-pink-600 hover:to-orange-600 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  ✨ Design Your First Cake
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {filteredOrders.map((order, index) => {
              const progress = getStatusProgress(order.status)
              const progressColor = getProgressColor(progress)
              
              return (
                <Card key={order.id} variant="premium" className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] group">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-rose-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Progress bar */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                    <div 
                      className={`h-full ${progressColor} transition-all duration-1000 ease-out`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="relative p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-rose-400/20 to-orange-400/20 rounded-full blur-md"></div>
                          <div className="relative w-16 h-16 bg-gradient-to-br from-rose-100 to-orange-100 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                            {getStatusIcon(order.status)}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-2xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Order #{order.order_number}
                          </h3>
                          <p className="text-gray-500 text-lg mt-1">
                            Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { 
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-4 py-2 rounded-2xl border-2 text-sm font-bold ${getStatusColor(order.status)} shadow-md`}>
                            {getStatusIcon(order.status)} {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <span className="font-bold text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          ZMW {order.total_amount}
                        </span>
                      </div>
                    </div>
                
                    {/* Enhanced Order Details */}
                    <div className="grid lg:grid-cols-3 gap-8 mb-6">
                      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-400 rounded-xl flex items-center justify-center text-white mr-3">
                            🎂
                          </div>
                          <h4 className="font-bold text-gray-800 text-lg">Cake Details</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Flavor:</span>
                            <span className="font-semibold text-gray-800">{order.cake_config.flavor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Size:</span>
                            <span className="font-semibold text-gray-800">{order.cake_config.size}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shape:</span>
                            <span className="font-semibold text-gray-800">{order.cake_config.shape}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Layers:</span>
                            <span className="font-semibold text-gray-800">{order.cake_config.layers}</span>
                          </div>
                          {order.cake_config.customization?.message && (
                            <div className="pt-2 border-t border-rose-200">
                              <span className="text-gray-600 text-sm">Message:</span>
                              <p className="font-semibold text-gray-800 italic mt-1">
                                "{order.cake_config.customization.message}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center text-white mr-3">
                            🚚
                          </div>
                          <h4 className="font-bold text-gray-800 text-lg">Delivery Info</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-semibold text-gray-800">
                              {new Date(order.delivery_date || '').toLocaleDateString('en-GB', { 
                                month: 'short', 
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time:</span>
                            <span className="font-semibold text-gray-800">{order.delivery_time?.replace('_', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 text-sm">Address:</span>
                            <p className="font-semibold text-gray-800 mt-1">{order.delivery_address.street}</p>
                            <p className="text-gray-600 text-sm">{order.delivery_address.area}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center text-white mr-3">
                            💳
                          </div>
                          <h4 className="font-bold text-gray-800 text-lg">Payment Status</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Status:</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              order.payment_status === 'paid' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}>
                              {order.payment_status === 'paid' ? '✅ PAID' : '⏳ PENDING'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Method:</span>
                            <span className="font-semibold text-gray-800">Airtel Money</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Updated:</span>
                            <span className="font-semibold text-gray-800 text-sm">
                              {new Date(order.updated_at).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                
                    {order.special_instructions && (
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 mb-6">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center text-white mr-3">
                            📝
                          </div>
                          <h5 className="font-bold text-amber-800">Special Instructions</h5>
                        </div>
                        <p className="text-amber-700 leading-relaxed italic">{order.special_instructions}</p>
                      </div>
                    )}
                
                    <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Last updated:</span> {new Date(order.updated_at).toLocaleDateString('en-GB')} at {new Date(order.updated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-sm text-gray-400">•</div>
                        <div className="text-sm text-gray-500">
                          Progress: <span className="font-bold text-gray-700">{progress}%</span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedOrderForChat(order)
                            setShowChat(true)
                          }}
                          className="border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                          💬 Ask about order
                        </Button>
                        <Link href={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                            👁️ View Details
                          </Button>
                        </Link>
                        {order.status === 'pending' && order.payment_status === 'pending' && (
                          <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            💳 Complete Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
        
        {/* CopilotKit Chat Sidebar */}
        {showChat && (
          <CopilotSidebar
            instructions="You are a helpful customer service assistant for Destiny Bakes. Help customers with their order inquiries, provide updates, and offer support. Be friendly, informative, and focused on cake orders. If a customer asks about a specific order, use the getOrderDetails action to fetch the information."
            defaultOpen={true}
            onSetOpen={setShowChat}
            clickOutsideToClose={true}
          >
            <CopilotChat
              instructions="Help the customer with their order-related questions. You can look up specific orders, provide general support information, and assist with any concerns they might have about their cake orders."
              className="h-full"
            />
          </CopilotSidebar>
        )}
      </div>
    </div>
  )
}