'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

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
  payment_method: string
  created_at: string
  updated_at: string
}

interface OrderEvent {
  id: string
  event_type: string
  description: string
  estimated_completion: string | null
  actual_completion: string | null
  notes: string
  created_at: string
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'gray', icon: '⏳', description: 'Order received and being reviewed' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue', icon: '✅', description: 'Order confirmed and scheduled for preparation' },
  { value: 'preparing', label: 'Preparing', color: 'yellow', icon: '👩‍🍳', description: 'Gathering ingredients and preparing workspace' },
  { value: 'baking', label: 'Baking', color: 'orange', icon: '🔥', description: 'Your cake is in the oven!' },
  { value: 'decorating', label: 'Decorating', color: 'purple', icon: '🎨', description: 'Adding beautiful decorations and finishing touches' },
  { value: 'ready', label: 'Ready', color: 'green', icon: '🎂', description: 'Your cake is ready for pickup/delivery' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'indigo', icon: '🚗', description: 'On the way to you!' },
  { value: 'delivered', label: 'Delivered', color: 'green', icon: '✨', description: 'Successfully delivered - enjoy!' },
  { value: 'cancelled', label: 'Cancelled', color: 'red', icon: '❌', description: 'Order cancelled' }
]

export default function UserOrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [orderEvents, setOrderEvents] = useState<OrderEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user && orderId) {
      fetchOrderDetails()
      fetchOrderEvents()
    }
  }, [isLoaded, user, orderId])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/user/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.data)
      } else if (response.status === 404) {
        router.push('/dashboard/orders')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    }
  }

  const fetchOrderEvents = async () => {
    try {
      const response = await fetch(`/api/orders/user/${orderId}/events`)
      if (response.ok) {
        const data = await response.json()
        setOrderEvents(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching order events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0]
  }

  const getCurrentStatusIndex = () => {
    return ORDER_STATUSES.findIndex(s => s.value === order?.status)
  }

  const getDeliveryCountdown = () => {
    if (!order) return null
    
    const deliveryDate = new Date(order.delivery_date)
    const now = new Date()
    const timeDiff = deliveryDate.getTime() - now.getTime()
    
    if (timeDiff < 0) return { text: 'Delivery date passed', color: 'red' }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      return { text: `${days} day${days > 1 ? 's' : ''} to go`, color: 'blue' }
    } else if (hours > 0) {
      return { text: `${hours} hour${hours > 1 ? 's' : ''} to go`, color: 'orange' }
    } else {
      return { text: 'Delivery today!', color: 'green' }
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">🎂</div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h1>
            <Button onClick={() => router.push('/dashboard/orders')}>
              ← Back to My Orders
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentStatusInfo = getStatusInfo(order.status)
  const currentStatusIndex = getCurrentStatusIndex()
  const deliveryCountdown = getDeliveryCountdown()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/orders')}
              className="mb-4"
            >
              ← Back to My Orders
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">
              Order #{order.order_number}
            </h1>
            <p className="text-gray-600">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-${currentStatusInfo.color}-100 text-${currentStatusInfo.color}-800 mb-2`}>
              {currentStatusInfo.icon} {currentStatusInfo.label}
            </div>
            {deliveryCountdown && (
              <div className={`block text-sm font-medium text-${deliveryCountdown.color}-600`}>
                {deliveryCountdown.text}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Progress */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Order Progress</h2>
                
                {/* Progress Timeline */}
                <div className="relative">
                  {ORDER_STATUSES.slice(0, -1).map((status, index) => {
                    const isCompleted = currentStatusIndex > index
                    const isCurrent = currentStatusIndex === index
                    const isUpcoming = currentStatusIndex < index
                    
                    return (
                      <div key={status.value} className="flex items-start mb-6 last:mb-0">
                        {/* Status Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCompleted ? 'bg-green-500 text-white' :
                          isCurrent ? `bg-${status.color}-500 text-white` :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {isCompleted ? '✓' : status.icon}
                        </div>
                        
                        {/* Status Content */}
                        <div className="ml-4 flex-grow">
                          <div className={`font-semibold ${
                            isCurrent ? `text-${status.color}-800` : 
                            isCompleted ? 'text-green-800' : 
                            'text-gray-500'
                          }`}>
                            {status.label}
                          </div>
                          <div className={`text-sm ${
                            isCurrent ? `text-${status.color}-600` : 
                            isCompleted ? 'text-green-600' : 
                            'text-gray-400'
                          }`}>
                            {status.description}
                          </div>
                        </div>
                        
                        {/* Timeline Line */}
                        {index < ORDER_STATUSES.length - 2 && (
                          <div className={`absolute left-5 mt-10 w-px h-6 ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-200'
                          }`} style={{ top: `${(index + 1) * 70}px` }} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>

            {/* Order Events / Activity */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Activity</h2>
                
                {orderEvents.length > 0 ? (
                  <div className="space-y-4">
                    {orderEvents.map((event, index) => (
                      <div key={event.id} className="border-l-4 border-primary-500 pl-4 pb-4 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-800">{event.event_type}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(event.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{event.description}</p>
                        {event.notes && (
                          <p className="text-sm text-gray-500">Note: {event.notes}</p>
                        )}
                        {event.estimated_completion && (
                          <p className="text-sm text-blue-600">
                            Estimated completion: {new Date(event.estimated_completion).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No activity updates yet</p>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">📅 Delivery Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <div className="text-gray-600">{new Date(order.delivery_date).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Time:</span>
                    <div className="text-gray-600">{order.delivery_time}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Address:</span>
                    <div className="text-gray-600">
                      {order.delivery_address?.street}<br />
                      {order.delivery_address?.city}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Cake Details */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">🎂 Cake Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Flavor:</span>
                    <span className="font-medium">{order.cake_config?.flavor || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{order.cake_config?.size || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shape:</span>
                    <span className="font-medium">{order.cake_config?.shape || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Layers:</span>
                    <span className="font-medium">{order.cake_config?.layers || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiers:</span>
                    <span className="font-medium">{order.cake_config?.tiers || 'N/A'}</span>
                  </div>
                  
                  {order.cake_config?.customization?.message && (
                    <div className="pt-3 border-t">
                      <span className="font-medium text-gray-700">Message:</span>
                      <div className="text-gray-600 italic">"{order.cake_config.customization.message}"</div>
                    </div>
                  )}
                  
                  {order.special_instructions && (
                    <div className="pt-3 border-t">
                      <span className="font-medium text-gray-700">Special Instructions:</span>
                      <div className="text-gray-600">{order.special_instructions}</div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Payment Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">💳 Payment</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-2xl font-bold text-gray-800">K{order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      order.payment_status === 'paid' ? 'text-green-600' :
                      order.payment_status === 'pending' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                    </span>
                  </div>
                  {order.payment_method && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium">{order.payment_method}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {order.status === 'delivered' && (
                    <Button variant="primary" className="w-full">
                      ⭐ Leave Review
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full">
                    🔄 Reorder This Cake
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    📞 Contact Support
                  </Button>
                  
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
                      ❌ Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}