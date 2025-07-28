'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { CopilotChat } from '@copilotkit/react-ui'
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core"
import { CopilotSidebar } from '@copilotkit/react-ui'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { isAdmin } from '@/lib/admin-client'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types/database'
import Link from 'next/link'

export default function AdminOrdersPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [updateData, setUpdateData] = useState({
    status: '',
    notes: '',
    estimated_completion: ''
  })
  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    { value: 'preparing', label: 'Preparing', color: 'bg-purple-100 text-purple-800', icon: '👨‍🍳' },
    { value: 'baking', label: 'Baking', color: 'bg-orange-100 text-orange-800', icon: '🔥' },
    { value: 'decorating', label: 'Decorating', color: 'bg-pink-100 text-pink-800', icon: '🎨' },
    { value: 'ready', label: 'Ready', color: 'bg-green-100 text-green-800', icon: '📦' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-800', icon: '🚚' },
    { value: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-800', icon: '🎉' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' }
  ]

  // Make orders data available to Copilot
  useCopilotReadable({
    description: "All orders in the system with detailed information for admin management",
    value: {
      totalOrders: orders.length,
      ordersByStatus: orderStatuses.map(status => ({
        status: status.value,
        count: orders.filter(o => o.status === status.value).length,
        orders: orders.filter(o => o.status === status.value).map(o => ({
          orderNumber: o.order_number,
          customerName: (o as any).user_profiles?.full_name,
          amount: o.total_amount,
          deliveryDate: o.delivery_date,
          cakeDetails: o.cake_config
        }))
      })),
      recentOrders: orders.slice(0, 10).map(o => ({
        orderNumber: o.order_number,
        status: o.status,
        amount: o.total_amount,
        customer: (o as any).user_profiles?.full_name
      }))
    }
  })

  // Copilot action for updating order status
  useCopilotAction({
    name: "updateOrderStatus",
    description: "Update the status of an order with notes and estimated completion time",
    parameters: [
      {
        name: "orderNumber",
        type: "string",
        description: "The order number to update"
      },
      {
        name: "newStatus",
        type: "string",
        description: "The new status for the order",
        enum: orderStatuses.map(s => s.value)
      },
      {
        name: "notes",
        type: "string",
        description: "Notes about the status update",
        required: false
      },
      {
        name: "estimatedCompletion",
        type: "string",
        description: "Estimated completion date and time (ISO format)",
        required: false
      }
    ],
    handler: async ({ orderNumber, newStatus, notes, estimatedCompletion }) => {
      const order = orders.find(o => o.order_number === orderNumber)
      if (!order) {
        return { error: "Order not found" }
      }

      try {
        // Update order status
        const { error: orderError } = await supabase
          .from('orders')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id)

        if (orderError) throw orderError

        // Add order event
        const { error: eventError } = await supabase
          .from('order_events')
          .insert({
            order_id: order.id,
            event_type: 'status_updated',
            description: `Order status updated to ${newStatus}`,
            notes: notes || '',
            estimated_completion: estimatedCompletion || null,
            created_by: user?.id
          })

        if (eventError) throw eventError

        await loadOrders()
        
        return { 
          success: true, 
          message: `Order ${orderNumber} status updated to ${newStatus}` 
        }
      } catch (error) {
        return { error: "Failed to update order status" }
      }
    }
  })

  // Copilot action for order analytics
  useCopilotAction({
    name: "getOrderAnalytics",
    description: "Get analytics and insights about orders",
    parameters: [
      {
        name: "timeframe",
        type: "string",
        description: "The timeframe for analytics",
        enum: ["today", "week", "month", "all"]
      }
    ],
    handler: async ({ timeframe }) => {
      const now = new Date()
      let filteredOrders = orders

      if (timeframe === "today") {
        filteredOrders = orders.filter(o => 
          new Date(o.created_at).toDateString() === now.toDateString()
        )
      } else if (timeframe === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        filteredOrders = orders.filter(o => new Date(o.created_at) >= weekAgo)
      } else if (timeframe === "month") {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        filteredOrders = orders.filter(o => new Date(o.created_at) >= monthAgo)
      }

      const totalRevenue = filteredOrders
        .filter(o => o.payment_status === 'paid')
        .reduce((sum, o) => sum + Number(o.total_amount), 0)

      const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0

      return {
        timeframe,
        totalOrders: filteredOrders.length,
        totalRevenue,
        averageOrderValue: Math.round(averageOrderValue),
        statusBreakdown: orderStatuses.map(status => ({
          status: status.label,
          count: filteredOrders.filter(o => o.status === status.value).length
        })),
        topFlavors: Object.entries(
          filteredOrders.reduce((acc, o) => {
            acc[o.cake_config.flavor] = (acc[o.cake_config.flavor] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        ).sort(([,a], [,b]) => b - a).slice(0, 5)
      }
    }
  })

  

  useEffect(() => {
    const checkAccess = async () => {
      if (!isLoaded || !user) return

      const adminStatus = await isAdmin(user.id)
      setIsAdminUser(adminStatus)
      
      if (!adminStatus) {
        router.push('/admin')
        return
      }

      await loadOrders()
      setLoading(false)
    }

    checkAccess()
  }, [user, isLoaded, router])

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user_profiles!orders_customer_id_fkey(full_name, email, phone),
          order_events(*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading orders:', error)
        return
      }

      setOrders(data || [])
    } catch (error) {
      console.error('Error in loadOrders:', error)
    }
  }

  const handleUpdateOrder = async () => {
    if (!selectedOrder || !updateData.status) return

    try {
      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: updateData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id)

      if (orderError) {
        console.error('Error updating order:', orderError)
        alert('Failed to update order')
        return
      }

      // Add order event
      const { error: eventError } = await supabase
        .from('order_events')
        .insert({
          order_id: selectedOrder.id,
          event_type: 'status_updated',
          description: `Order status updated to ${updateData.status}`,
          notes: updateData.notes,
          estimated_completion: updateData.estimated_completion || null,
          created_by: user?.id
        })

      if (eventError) {
        console.error('Error creating order event:', eventError)
      }

      setShowUpdateModal(false)
      setSelectedOrder(null)
      setUpdateData({ status: '', notes: '', estimated_completion: '' })
      await loadOrders()

    } catch (error) {
      console.error('Error updating order:', error)
      alert('Failed to update order')
    }
  }

  const getStatusInfo = (status: string) => {
    return orderStatuses.find(s => s.value === status) || orderStatuses[0]
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

  if (!user || !isAdminUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navbar />
      
      {/* Floating particles background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-8 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-gradient-to-br from-pink-200/25 to-rose-200/25 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-8">
        {/* Enhanced Header with Stats */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 mb-8 shadow-2xl border border-white/20">
          <div className="flex justify-between items-start">
            <div className="relative">
              <div className="absolute -top-2 -left-2 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl"></div>
              <h1 className="relative font-display text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Order Management
              </h1>
              <p className="text-gray-600 text-lg mb-4">
                Efficiently manage customer orders, update status, and track progress
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                  <div className="text-sm text-blue-600">Total Orders</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-100">
                  <div className="text-2xl font-bold text-orange-600">
                    {orders.filter(o => ['pending', 'confirmed', 'preparing', 'baking', 'decorating'].includes(o.status)).length}
                  </div>
                  <div className="text-sm text-orange-600">Active Orders</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                  <div className="text-2xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'delivered').length}
                  </div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                  <div className="text-2xl font-bold text-purple-600">
                    ZMW {orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + Number(o.total_amount), 0)}
                  </div>
                  <div className="text-sm text-purple-600">Revenue</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-3">
              <Link href="/admin">
                <Button variant="outline" className="border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                  ← Back to Dashboard
                </Button>
              </Link>
              <Button 
                onClick={() => setShowChat(true)}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🤖 AI Assistant
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { key: 'all', label: 'All Orders', count: orders.length, color: 'from-gray-500 to-gray-600', icon: '📋' },
            { key: 'active', label: 'Active', count: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length, color: 'from-blue-500 to-indigo-500', icon: '⚡' },
            ...orderStatuses.map(status => ({
              key: status.value,
              label: status.label,
              count: orders.filter(o => o.status === status.value).length,
              color: 'from-purple-500 to-pink-500',
              icon: status.icon
            }))
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
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50"></div>
            <div className="relative p-16 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative text-8xl mb-8 animate-bounce">📦</div>
              </div>
              <h3 className="font-display text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                No {filter === 'all' ? '' : filter} Orders
              </h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
                {filter === 'all' 
                  ? "No orders have been placed yet. Orders will appear here when customers place them."
                  : `No ${filter} orders at the moment. Check back soon or try a different filter.`
                }
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {filteredOrders.map((order, index) => {
              const statusInfo = getStatusInfo(order.status)
              const customer = (order as any).user_profiles
              
              return (
                <Card key={order.id} variant="premium" className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.01] group">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Status indicator bar */}
                  <div className={`absolute top-0 left-0 w-full h-2 ${statusInfo.color.includes('yellow') ? 'bg-yellow-400' : statusInfo.color.includes('blue') ? 'bg-blue-400' : statusInfo.color.includes('purple') ? 'bg-purple-400' : statusInfo.color.includes('orange') ? 'bg-orange-400' : statusInfo.color.includes('pink') ? 'bg-pink-400' : statusInfo.color.includes('green') ? 'bg-green-400' : statusInfo.color.includes('indigo') ? 'bg-indigo-400' : statusInfo.color.includes('emerald') ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                  
                  <div className="relative p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-md"></div>
                          <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                            {statusInfo.icon}
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
                          {customer && (
                            <div className="flex items-center mt-2 space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {customer.full_name?.charAt(0) || 'C'}
                              </div>
                              <div>
                                <p className="text-gray-700 font-semibold">{customer.full_name}</p>
                                <p className="text-gray-500 text-sm">{customer.email}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className={`px-4 py-2 rounded-2xl border-2 text-sm font-bold ${statusInfo.color} shadow-md`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </div>
                        <span className="font-bold text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          ZMW {order.total_amount}
                        </span>
                        <div className="mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.payment_status === 'paid' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            {order.payment_status === 'paid' ? '✅ PAID' : '⏳ PENDING'}
                          </span>
                        </div>
                      </div>
                    </div>
                  
                    {/* Enhanced Order Details */}
                    <div className="grid lg:grid-cols-3 gap-6 mb-6">
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
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-semibold text-gray-800">{order.delivery_address.phone}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center text-white mr-3">
                            💳
                          </div>
                          <h4 className="font-bold text-gray-800 text-lg">Order Timeline</h4>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Created:</span>
                            <span className="font-semibold text-gray-800 text-sm">
                              {new Date(order.created_at).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Updated:</span>
                            <span className="font-semibold text-gray-800 text-sm">
                              {new Date(order.updated_at).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Payment:</span>
                            <span className="font-semibold text-gray-800">Airtel Money</span>
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
                          <span className="font-medium">Order ID:</span> {order.id.split('-')[0]}...
                        </div>
                        <div className="text-sm text-gray-400">•</div>
                        <div className="text-sm text-gray-500">
                          Events: <span className="font-bold text-gray-700">{(order as any).order_events?.length || 0}</span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order)
                            setUpdateData({ 
                              status: order.status, 
                              notes: '', 
                              estimated_completion: '' 
                            })
                            setShowUpdateModal(true)
                          }}
                          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 transform hover:scale-105 transition-all duration-200"
                        >
                          ✎️ Update Status
                        </Button>
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button size="sm" className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            👁️ View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Enhanced Update Order Modal */}
        {showUpdateModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full border border-white/20">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50"></div>
                <div className="relative p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center text-white mr-4">
                      ✎️
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Update Order Status
                      </h2>
                      <p className="text-gray-500">Order #{selectedOrder.order_number}</p>
                    </div>
                  </div>
                
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Order Status
                      </label>
                      <select
                        value={updateData.status}
                        onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                      >
                        {orderStatuses.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.icon} {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={updateData.notes}
                        onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                        placeholder="Add any notes about this status update..."
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300 resize-none"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Estimated Completion (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={updateData.estimated_completion}
                        onChange={(e) => setUpdateData({ ...updateData, estimated_completion: e.target.value })}
                        className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                      />
                    </div>
                  </div>
                
                  <div className="flex space-x-4 mt-8">
                    <Button 
                      onClick={handleUpdateOrder}
                      className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      ✅ Update Order
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowUpdateModal(false)}
                      className="flex-1 border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300"
                    >
                      ❌ Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* CopilotKit Chat Sidebar */}
        {showChat && (
          <CopilotSidebar
            instructions="You are an AI assistant for Destiny Bakes admin dashboard. Help manage orders, provide analytics, update order statuses, and assist with administrative tasks. You have access to all order data and can perform order management actions. Be professional, efficient, and focus on helping streamline bakery operations."
            defaultOpen={true}
            onSetOpen={setShowChat}
            clickOutsideToClose={true}
          >
            <CopilotChat
              instructions="Help the admin manage orders efficiently. You can update order statuses, provide analytics, search for specific orders, and offer insights about the bakery operations. Use the available actions to perform tasks directly."
              className="h-full"
            />
          </CopilotSidebar>
        )}
      </div>
    </div>
  )
}