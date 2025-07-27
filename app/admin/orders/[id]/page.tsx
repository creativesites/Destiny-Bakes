'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Order {
  id: string
  order_number: string
  customer_id: string
  customer?: {
    full_name: string
    email: string
    phone: string
  }
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
  order_id: string
  event_type: string
  description: string
  estimated_completion: string | null
  actual_completion: string | null
  notes: string
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

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'refunded', label: 'Refunded', color: 'yellow' },
  { value: 'failed', label: 'Failed', color: 'red' }
]

export default function AdminOrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [orderEvents, setOrderEvents] = useState<OrderEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [newEvent, setNewEvent] = useState({
    event_type: '',
    description: '',
    notes: '',
    estimated_completion: ''
  })

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
      fetchOrderEvents()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.data)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    }
  }

  const fetchOrderEvents = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/events`)
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

  const updateOrderStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchOrderDetails()
        await fetchOrderEvents()
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const updatePaymentStatus = async (newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: newStatus })
      })

      if (response.ok) {
        await fetchOrderDetails()
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const addOrderEvent = async () => {
    if (!newEvent.event_type || !newEvent.description) return

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      })

      if (response.ok) {
        setShowEventModal(false)
        setNewEvent({ event_type: '', description: '', notes: '', estimated_completion: '' })
        await fetchOrderEvents()
      }
    } catch (error) {
      console.error('Error adding order event:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status)
    return statusConfig?.color || 'gray'
  }

  const getStatusIcon = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status)
    return statusConfig?.icon || '❓'
  }

  const getPaymentStatusColor = (status: string) => {
    const statusConfig = PAYMENT_STATUSES.find(s => s.value === status)
    return statusConfig?.color || 'gray'
  }

  if (loading) {
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h1>
            <Button onClick={() => router.push('/admin/orders')}>
              ← Back to Orders
            </Button>
          </div>
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
            <Button
              variant="outline"
              onClick={() => router.push('/admin/orders')}
              className="mb-4"
            >
              ← Back to Orders
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">
              Order #{order.order_number}
            </h1>
            <p className="text-gray-600">
              Created on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(order.status)}-100 text-${getStatusColor(order.status)}-800`}>
              {getStatusIcon(order.status)} {ORDER_STATUSES.find(s => s.value === order.status)?.label}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Management */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Status</h2>
                
                {/* Status Timeline */}
                <div className="mb-6">
                  <div className="flex justify-between items-center">
                    {ORDER_STATUSES.slice(0, -1).map((status, index) => {
                      const isActive = order.status === status.value
                      const isCompleted = ORDER_STATUSES.findIndex(s => s.value === order.status) > index
                      
                      return (
                        <div key={status.value} className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            isActive ? `bg-${status.color}-500 text-white` :
                            isCompleted ? 'bg-green-500 text-white' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {isCompleted ? '✓' : status.icon}
                          </div>
                          <span className="text-xs mt-1 text-center">{status.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Status Controls */}
                <div className="grid grid-cols-3 gap-2">
                  {ORDER_STATUSES.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => updateOrderStatus(status.value)}
                      disabled={updating || order.status === status.value}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        order.status === status.value
                          ? `bg-${status.color}-100 border-${status.color}-300 text-${status.color}-800`
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {status.icon} {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Payment Status */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Status</h2>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${getPaymentStatusColor(order.payment_status)}-100 text-${getPaymentStatusColor(order.payment_status)}-800`}>
                    {PAYMENT_STATUSES.find(s => s.value === order.payment_status)?.label}
                  </span>
                  <span className="text-2xl font-bold">K{order.total_amount.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_STATUSES.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => updatePaymentStatus(status.value)}
                      disabled={updating || order.payment_status === status.value}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        order.payment_status === status.value
                          ? `bg-${status.color}-100 border-${status.color}-300 text-${status.color}-800`
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Order Events / Tracking */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Order Tracking</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEventModal(true)}
                  >
                    + Add Event
                  </Button>
                </div>

                <div className="space-y-4">
                  {orderEvents.map((event) => (
                    <div key={event.id} className="border-l-4 border-primary-500 pl-4 pb-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{event.event_type}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(event.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{event.description}</p>
                      {event.notes && (
                        <p className="text-sm text-gray-500">Notes: {event.notes}</p>
                      )}
                      {event.estimated_completion && (
                        <p className="text-sm text-blue-600">
                          Estimated completion: {new Date(event.estimated_completion).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                  
                  {orderEvents.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No tracking events yet</p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {order.customer?.full_name || 'N/A'}</p>
                  <p><strong>Email:</strong> {order.customer?.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {order.customer?.phone || 'N/A'}</p>
                </div>
              </div>
            </Card>

            {/* Delivery Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Delivery Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Date:</strong> {new Date(order.delivery_date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {order.delivery_time}</p>
                  <div>
                    <strong>Address:</strong>
                    <div className="mt-1 text-gray-600">
                      {order.delivery_address?.street}<br />
                      {order.delivery_address?.city}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Cake Configuration */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Cake Details</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Flavor:</strong> {order.cake_config?.flavor || 'N/A'}</p>
                  <p><strong>Size:</strong> {order.cake_config?.size || 'N/A'}</p>
                  <p><strong>Shape:</strong> {order.cake_config?.shape || 'N/A'}</p>
                  <p><strong>Layers:</strong> {order.cake_config?.layers || 'N/A'}</p>
                  <p><strong>Tiers:</strong> {order.cake_config?.tiers || 'N/A'}</p>
                  {order.cake_config?.customization?.message && (
                    <p><strong>Message:</strong> "{order.cake_config.customization.message}"</p>
                  )}
                  {order.special_instructions && (
                    <div>
                      <strong>Special Instructions:</strong>
                      <p className="mt-1 text-gray-600">{order.special_instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Add Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Add Tracking Event</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <input
                    type="text"
                    value={newEvent.event_type}
                    onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value})}
                    placeholder="e.g., Started baking, Decoration complete"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Detailed description of the event"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <input
                    type="text"
                    value={newEvent.notes}
                    onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
                    placeholder="Additional notes"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Completion (Optional)</label>
                  <input
                    type="datetime-local"
                    value={newEvent.estimated_completion}
                    onChange={(e) => setNewEvent({...newEvent, estimated_completion: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addOrderEvent}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}