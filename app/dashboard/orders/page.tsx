'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Navbar } from '@/components/layout/Navbar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface Order {
  id: string
  order_number: string
  cake_config: any
  total_amount: number
  status: string
  delivery_date: string
  delivery_time: string
  delivery_address: any
  special_instructions: string
  payment_status: string
  created_at: string
  order_events?: OrderEvent[]
}

interface OrderEvent {
  event_type: string
  description: string
  created_at: string
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'gray', icon: '⏳' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue', icon: '✅' },
  { value: 'preparing', label: 'Preparing', color: 'yellow', icon: '👩‍🍳' },
  { value: 'baking', label: 'Baking', color: 'orange', icon: '🔥' },
  { value: 'decorating', label: 'Decorating', color: 'purple', icon: '🎨' },
  { value: 'ready', label: 'Ready', color: 'green', icon: '🎂' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'indigo', icon: '🚗' },
  { value: 'delivered', label: 'Delivered', color: 'green', icon: '✨' },
  { value: 'cancelled', label: 'Cancelled', color: 'red', icon: '❌' }
]

export default function UserOrdersPage() {
  const { user, isLoaded } = useUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    if (isLoaded && user) {
      fetchOrders()
    }
  }, [isLoaded, user])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/user')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => 
    selectedStatus === 'all' || order.status === selectedStatus
  )

  const getStatusColor = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status)
    return statusConfig?.color || 'gray'
  }

  const getStatusIcon = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status)
    return statusConfig?.icon || '❓'
  }

  const getStatusLabel = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status)
    return statusConfig?.label || status
  }

  const getDeliveryStatus = (order: Order) => {
    const deliveryDate = new Date(order.delivery_date)
    const now = new Date()
    const timeDiff = deliveryDate.getTime() - now.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    if (order.status === 'delivered') return { text: 'Delivered', color: 'green' }
    if (daysDiff < 0) return { text: 'Overdue', color: 'red' }
    if (daysDiff === 0) return { text: 'Today', color: 'orange' }
    if (daysDiff === 1) return { text: 'Tomorrow', color: 'yellow' }
    if (daysDiff <= 3) return { text: `${daysDiff} days`, color: 'blue' }
    return { text: `${daysDiff} days`, color: 'gray' }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">🎂</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <Link href="/sign-in" className="btn-primary">Sign In to View Orders</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
            <p className="text-gray-600">Track your cake orders and delivery status</p>
          </div>
          <Link href="/cake-designer" className="btn-primary">
            + Order New Cake
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-800">{orders.length}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => ['pending', 'confirmed', 'preparing', 'baking', 'decorating'].includes(o.status)).length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'delivered').length}
              </div>
              <div className="text-sm text-gray-600">Delivered</div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                K{orders.reduce((sum, order) => sum + order.total_amount, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedStatus === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Orders ({orders.length})
              </button>
              
              {ORDER_STATUSES.map((status) => {
                const count = orders.filter(o => o.status === status.value).length
                if (count === 0) return null
                
                return (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${
                      selectedStatus === status.value
                        ? `bg-${status.color}-500 text-white`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.icon} {status.label} ({count})
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Orders List */}
        {loading ? (
          <Card>
            <div className="p-12 text-center">
              <div className="animate-spin text-4xl mb-4">🎂</div>
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🍰</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {selectedStatus === 'all' ? 'No orders yet' : `No ${getStatusLabel(selectedStatus).toLowerCase()} orders`}
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedStatus === 'all' 
                  ? "Ready to create your first delicious cake?"
                  : "Try selecting a different status filter."
                }
              </p>
              {selectedStatus === 'all' && (
                <Link href="/cake-designer" className="btn-primary">
                  Design Your First Cake
                </Link>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const deliveryStatus = getDeliveryStatus(order)
              const latestEvent = order.order_events?.[0]
              
              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="grid md:grid-cols-4 gap-4">
                      {/* Order Info */}
                      <div>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🎂</span>
                          </div>
                          <div>
                            <Link 
                              href={`/dashboard/orders/${order.id}`}
                              className="font-semibold text-primary-600 hover:text-primary-800"
                            >
                              #{order.order_number}
                            </Link>
                            <div className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {order.cake_config?.flavor || 'Custom'} Cake
                        </h3>
                        <p className="text-sm text-gray-600">
                          {order.cake_config?.size} • {order.cake_config?.shape} • {order.cake_config?.layers} layers
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <div className="mb-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(order.status)}-100 text-${getStatusColor(order.status)}-800`}>
                            {getStatusIcon(order.status)} {getStatusLabel(order.status)}
                          </span>
                        </div>
                        
                        {latestEvent && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">{latestEvent.event_type}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(latestEvent.created_at).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Delivery Info */}
                      <div>
                        <div className="mb-2">
                          <div className="font-medium text-gray-800">
                            {new Date(order.delivery_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">{order.delivery_time}</div>
                        </div>
                        
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-${deliveryStatus.color}-100 text-${deliveryStatus.color}-800`}>
                          {deliveryStatus.text}
                        </span>
                      </div>

                      {/* Amount & Actions */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800 mb-2">
                          K{order.total_amount.toFixed(2)}
                        </div>
                        
                        <div className="space-y-2">
                          <Link 
                            href={`/dashboard/orders/${order.id}`}
                            className="block w-full btn-primary text-sm"
                          >
                            View Details
                          </Link>
                          
                          {order.status === 'delivered' && (
                            <button className="block w-full btn-outline text-sm">
                              Reorder
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}