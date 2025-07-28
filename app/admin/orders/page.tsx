'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
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
  const [updateData, setUpdateData] = useState({
    status: '',
    notes: '',
    estimated_completion: ''
  })

  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏳' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '✅' },
    { value: 'preparing', label: 'Preparing', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '👨‍🍳' },
    { value: 'baking', label: 'Baking', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '🔥' },
    { value: 'decorating', label: 'Decorating', color: 'bg-pink-100 text-pink-800 border-pink-200', icon: '🎨' },
    { value: 'ready', label: 'Ready', color: 'bg-green-100 text-green-800 border-green-200', icon: '📦' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: '🚚' },
    { value: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🎉' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', icon: '❌' }
  ]

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
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  if (!user || !isAdminUser) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="font-display text-3xl font-bold text-gray-800 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-8">
            You don't have admin access.
          </p>
          <Button onClick={() => router.push('/')}>
            Return to Homepage
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">
            Order Management
          </h1>
          <p className="text-gray-600">
            Manage and track all customer orders from here
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => window.open('/admin/orders/export', '_blank')}
            variant="outline"
          >
            📊 Export Orders
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            📋 Add Order
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-2xl font-bold text-gray-800">{orders.length}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-orange-600">
              {orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length}
            </div>
            <div className="text-sm text-gray-600">Active Orders</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-purple-600">
              ZMW {orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + Number(o.total_amount), 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-gray-800 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filter === 'active'
                  ? 'bg-gray-800 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active Orders ({orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length})
            </button>
            {orderStatuses.map(status => {
              const count = orders.filter(o => o.status === status.value).length
              if (count === 0) return null
              
              return (
                <button
                  key={status.value}
                  onClick={() => setFilter(status.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filter === status.value
                      ? 'bg-gray-800 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="hidden sm:inline">{status.icon} {status.label}</span>
                  <span className="sm:hidden">{status.icon}</span>
                  <span className="ml-1">({count})</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center">
            <div className="text-6xl mb-6 opacity-30">📦</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              No {filter === 'all' ? '' : filter} Orders
            </h3>
            <p className="text-gray-600 mb-8">
              {filter === 'all' 
                ? "No orders have been placed yet. Orders will appear here when customers place them."
                : `No ${filter} orders at the moment. Check back soon or try a different filter.`
              }
            </p>
            <Button onClick={() => setFilter('all')}>
              View All Orders
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status)
            const customer = (order as any).user_profiles
            
            return (
              <Card key={order.id} className="hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="text-2xl">{statusInfo.icon}</div>
                        <div>
                          <h3 className="font-bold text-lg">Order #{order.id.slice(0, 8)}</h3>
                          <p className="text-sm text-gray-600">
                            {customer?.full_name || 'Unknown Customer'}
                          </p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-800">
                        ZMW {Number(order.total_amount).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Delivery Date:</span>
                        <div className="font-medium">
                          {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not set'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Payment:</span>
                        <div className={`font-medium ${
                          order.payment_status === 'paid' ? 'text-green-600' : 
                          order.payment_status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {order.payment_status || 'Unknown'}
                        </div>
                      </div>
                    </div>

                    {/* Cake Details */}
                    {order.cake_config && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">Cake Details:</div>
                        <div className="text-sm text-gray-600">
                          {typeof order.cake_config === 'object' ? (
                            <div className="space-y-1">
                              {order.cake_config.flavor && <div>Flavor: {order.cake_config.flavor}</div>}
                              {order.cake_config.size && <div>Size: {order.cake_config.size}</div>}
                              {order.cake_config.layers && <div>Layers: {order.cake_config.layers}</div>}
                            </div>
                          ) : (
                            order.cake_config
                          )}
                        </div>
                      </div>
                    )}

                    {/* Customer Contact */}
                    {customer && (
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-500">Contact:</span>
                          <div>{customer.phone || customer.email}</div>
                        </div>
                        {customer.phone && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}`, '_blank')}
                          >
                            💬 WhatsApp
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                      <Link href={`/admin/orders/${order.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
                          👁️ View Details
                        </Button>
                      </Link>
                      <Button 
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
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        ✏️ Update Status
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Update Order Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="font-display text-2xl font-bold text-gray-800 mb-6">
                Update Order Status
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {orderStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.icon} {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={updateData.notes}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any notes about this status update..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Completion (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={updateData.estimated_completion}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, estimated_completion: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <Button
                  onClick={() => setShowUpdateModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateOrder}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  Update Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}