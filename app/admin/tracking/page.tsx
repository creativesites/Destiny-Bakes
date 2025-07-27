'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface Order {
  id: string
  order_number: string
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
  created_at: string
  latest_event?: {
    event_type: string
    description: string
    created_at: string
  }
}

interface OrderStats {
  total: number
  pending: number
  in_progress: number
  ready: number
  delivered: number
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

export default function AdminTrackingPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    in_progress: 0,
    ready: 0,
    delivered: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('today')

  useEffect(() => {
    fetchOrders()
  }, [selectedStatus, dateFilter])

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      if (dateFilter !== 'all') params.append('date_filter', dateFilter)

      const response = await fetch(`/api/admin/orders?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.data || [])
        calculateStats(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (orderData: Order[]) => {
    const total = orderData.length
    const pending = orderData.filter(o => o.status === 'pending').length
    const in_progress = orderData.filter(o => 
      ['confirmed', 'preparing', 'baking', 'decorating'].includes(o.status)
    ).length
    const ready = orderData.filter(o => 
      ['ready', 'out_for_delivery'].includes(o.status)
    ).length
    const delivered = orderData.filter(o => o.status === 'delivered').length

    setStats({ total, pending, in_progress, ready, delivered })
  }

  const filteredOrders = orders.filter(order => 
    searchTerm === '' || 
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getUrgencyLevel = (order: Order) => {
    const deliveryDate = new Date(order.delivery_date)
    const now = new Date()
    const timeDiff = deliveryDate.getTime() - now.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    if (daysDiff < 0) return 'overdue'
    if (daysDiff === 0) return 'today'
    if (daysDiff === 1) return 'tomorrow'
    if (daysDiff <= 2) return 'urgent'
    return 'normal'
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return 'red'
      case 'today': return 'orange'
      case 'tomorrow': return 'yellow'
      case 'urgent': return 'blue'
      default: return 'gray'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">🎂</div>
            <p>Loading tracking dashboard...</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Tracking Dashboard</h1>
          <p className="text-gray-600">Monitor all orders and their progress in real-time</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.in_progress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.ready}</div>
              <div className="text-sm text-gray-600">Ready</div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.delivered}</div>
              <div className="text-sm text-gray-600">Delivered</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Order number, customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Statuses</option>
                  {ORDER_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.icon} {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Filter</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="this_week">This Week</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={fetchOrders}
                  className="w-full"
                >
                  🔄 Refresh
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const urgency = getUrgencyLevel(order)
            const urgencyColor = getUrgencyColor(urgency)
            
            return (
              <Card key={order.id} className={`border-l-4 border-${urgencyColor}-500 hover:shadow-lg transition-shadow`}>
                <div className="p-6">
                  <div className="grid md:grid-cols-6 gap-4 items-center">
                    {/* Order Info */}
                    <div>
                      <Link href={`/admin/orders/${order.id}`} className="font-semibold text-primary-600 hover:text-primary-800">
                        #{order.order_number}
                      </Link>
                      <div className="text-sm text-gray-600">
                        {order.customer?.full_name || 'N/A'}
                      </div>
                    </div>

                    {/* Cake Details */}
                    <div>
                      <div className="font-medium">{order.cake_config?.flavor || 'N/A'}</div>
                      <div className="text-sm text-gray-600">
                        {order.cake_config?.size} {order.cake_config?.shape}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(order.status)}-100 text-${getStatusColor(order.status)}-800`}>
                        {getStatusIcon(order.status)} {getStatusLabel(order.status)}
                      </span>
                    </div>

                    {/* Delivery Date */}
                    <div>
                      <div className="font-medium">
                        {new Date(order.delivery_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">{order.delivery_time}</div>
                      {urgency !== 'normal' && (
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium bg-${urgencyColor}-100 text-${urgencyColor}-800 mt-1`}>
                          {urgency === 'overdue' ? 'OVERDUE' :
                           urgency === 'today' ? 'TODAY' :
                           urgency === 'tomorrow' ? 'TOMORROW' :
                           'URGENT'}
                        </span>
                      )}
                    </div>

                    {/* Latest Event */}
                    <div>
                      {order.latest_event ? (
                        <div>
                          <div className="text-sm font-medium">{order.latest_event.event_type}</div>
                          <div className="text-xs text-gray-600">
                            {new Date(order.latest_event.created_at).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No events</div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="text-right">
                      <div className="font-bold">K{order.total_amount.toFixed(2)}</div>
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="text-sm text-primary-600 hover:text-primary-800"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}

          {filteredOrders.length === 0 && (
            <Card>
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders found</h3>
                <p className="text-gray-600">
                  {searchTerm || selectedStatus !== 'all' || dateFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No orders have been placed yet'}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}