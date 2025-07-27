'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

interface Customer {
  id: string
  clerk_user_id: string
  full_name: string
  email: string
  phone?: string
  role: string
  dietary_restrictions?: string[]
  delivery_addresses?: any
  created_at: string
  total_orders: number
  total_spent: number
  last_order_date?: string
}

interface Order {
  id: string
  order_number: string
  cake_config: any
  total_amount: number
  status: string
  delivery_date: string
  created_at: string
  delivery_address: any
}

interface OrderEvent {
  id: string
  order_id: string
  event_type: string
  description: string
  created_at: string
}

export default function CustomerDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [orderEvents, setOrderEvents] = useState<OrderEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'profile'>('overview')

  useEffect(() => {
    if (isLoaded && user && customerId) {
      fetchCustomerDetails()
    }
  }, [isLoaded, user, customerId])

  const fetchCustomerDetails = async () => {
    try {
      // Check admin access
      const profileResponse = await fetch('/api/user/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.data?.role !== 'admin') {
          router.push('/dashboard')
          return
        }
      }

      // Fetch customer details
      const customerResponse = await fetch(`/api/admin/customers/${customerId}`)
      if (customerResponse.ok) {
        const customerData = await customerResponse.json()
        setCustomer(customerData.data.customer)
        setOrders(customerData.data.orders || [])
        setOrderEvents(customerData.data.orderEvents || [])
      } else {
        router.push('/admin/customers')
      }
    } catch (error) {
      console.error('Error fetching customer details:', error)
      router.push('/admin/customers')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">👤</div>
            <p>Loading customer details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !customer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Customer Not Found</h1>
            <Button onClick={() => router.push('/admin/customers')}>
              ← Back to Customers
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'preparing': case 'baking': return 'bg-yellow-100 text-yellow-800'
      case 'ready': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const averageOrderValue = customer.total_orders > 0 ? customer.total_spent / customer.total_orders : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/customers')}
              className="mb-4"
            >
              ← Back to Customers
            </Button>
            
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {customer.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{customer.full_name}</h1>
                  <p className="text-gray-600">{customer.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      customer.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {customer.role.charAt(0).toUpperCase() + customer.role.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Member since {new Date(customer.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">Customer ID</div>
                <div className="font-mono text-sm text-gray-800">{customer.id}</div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="p-6 text-center">
                <div className="text-3xl mb-2">📦</div>
                <div className="text-2xl font-bold text-gray-800">{customer.total_orders}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
            </Card>
            
            <Card>
              <div className="p-6 text-center">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-2xl font-bold text-gray-800">K{customer.total_spent.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
            </Card>
            
            <Card>
              <div className="p-6 text-center">
                <div className="text-3xl mb-2">📊</div>
                <div className="text-2xl font-bold text-gray-800">K{averageOrderValue.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Avg Order Value</div>
              </div>
            </Card>
            
            <Card>
              <div className="p-6 text-center">
                <div className="text-3xl mb-2">⏰</div>
                <div className="text-2xl font-bold text-gray-800">
                  {customer.last_order_date 
                    ? Math.floor((new Date().getTime() - new Date(customer.last_order_date).getTime()) / (1000 * 3600 * 24))
                    : 'N/A'
                  }
                </div>
                <div className="text-sm text-gray-600">Days Since Last Order</div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'orders'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Order History ({orders.length})
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile Details
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Recent Orders */}
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                    {orders.slice(0, 5).length > 0 ? (
                      <div className="space-y-4">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-800">
                                  Order #{order.order_number}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {order.cake_config?.flavor || 'Custom'} {order.cake_config?.shape || ''} Cake
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-800">K{order.total_amount.toFixed(2)}</p>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              Ordered: {new Date(order.created_at).toLocaleDateString()} | 
                              Delivery: {order.delivery_date}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No orders found</p>
                    )}
                  </div>
                </Card>

                {/* Order Pattern Analysis */}
                <Card>
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Order Patterns</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">Favorite Flavors</h3>
                        <div className="space-y-1">
                          {orders.reduce((acc: any, order) => {
                            const flavor = order.cake_config?.flavor || 'Custom'
                            acc[flavor] = (acc[flavor] || 0) + 1
                            return acc
                          }, {}).length > 0 ? (
                            Object.entries(orders.reduce((acc: any, order) => {
                              const flavor = order.cake_config?.flavor || 'Custom'
                              acc[flavor] = (acc[flavor] || 0) + 1
                              return acc
                            }, {}))
                            .sort(([,a]: any, [,b]: any) => b - a)
                            .slice(0, 3)
                            .map(([flavor, count]: any) => (
                              <div key={flavor} className="flex justify-between text-sm">
                                <span>{flavor}</span>
                                <span className="text-gray-600">{count} orders</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">No data available</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">Preferred Sizes</h3>
                        <div className="space-y-1">
                          {orders.reduce((acc: any, order) => {
                            const size = order.cake_config?.size || 'N/A'
                            acc[size] = (acc[size] || 0) + 1
                            return acc
                          }, {}).length > 0 ? (
                            Object.entries(orders.reduce((acc: any, order) => {
                              const size = order.cake_config?.size || 'N/A'
                              acc[size] = (acc[size] || 0) + 1
                              return acc
                            }, {}))
                            .sort(([,a]: any, [,b]: any) => b - a)
                            .slice(0, 3)
                            .map(([size, count]: any) => (
                              <div key={size} className="flex justify-between text-sm">
                                <span>{size}</span>
                                <span className="text-gray-600">{count} orders</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">No data available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Information */}
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="font-medium">{customer.email}</div>
                      </div>
                      {customer.phone && (
                        <div>
                          <div className="text-sm text-gray-600">Phone</div>
                          <div className="font-medium">{customer.phone}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Customer Notes */}
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Customer Notes</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">High-value customer - excellent payment history</p>
                      </div>
                      {customer.dietary_restrictions && customer.dietary_restrictions.length > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            Dietary restrictions: {customer.dietary_restrictions.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Complete Order History</h2>
                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Order</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Cake Details</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Order Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Delivery Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="font-semibold text-gray-800">#{order.order_number}</div>
                              <div className="text-sm text-gray-600">ID: {order.id.slice(0, 8)}...</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">
                                <div className="font-medium">{order.cake_config?.flavor || 'Custom'} Cake</div>
                                <div className="text-gray-600">
                                  {order.cake_config?.size} | {order.cake_config?.layers} layers
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-semibold text-gray-800">K{order.total_amount.toFixed(2)}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm text-gray-600">{order.delivery_date}</div>
                            </td>
                            <td className="py-4 px-4">
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                              >
                                View Order
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No orders found for this customer</p>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'profile' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <div className="text-gray-800">{customer.full_name}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="text-gray-800">{customer.email}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <div className="text-gray-800">{customer.phone || 'Not provided'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <div className="text-gray-800">{customer.role}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                      <div className="text-gray-800">{new Date(customer.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Preferences & Notes</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Restrictions</label>
                      <div className="text-gray-800">
                        {customer.dietary_restrictions && customer.dietary_restrictions.length > 0
                          ? customer.dietary_restrictions.join(', ')
                          : 'None specified'
                        }
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Addresses</label>
                      <div className="text-gray-800">
                        {customer.delivery_addresses && Object.keys(customer.delivery_addresses).length > 0
                          ? JSON.stringify(customer.delivery_addresses, null, 2)
                          : 'No saved addresses'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}