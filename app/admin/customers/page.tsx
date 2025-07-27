'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
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
  total_orders: number
  total_spent: number
  last_order_date?: string
  created_at: string
}

export default function AdminCustomersPage() {
  const { user, isLoaded } = useUser()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'spent' | 'recent'>('name')
  const [filterRole, setFilterRole] = useState<'all' | 'customer' | 'admin'>('all')

  useEffect(() => {
    if (isLoaded && user) {
      // Check if user is admin
      fetchUserProfile()
    }
  }, [isLoaded, user])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.data?.role !== 'admin') {
          redirect('/dashboard')
          return
        }
        fetchCustomers()
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      redirect('/dashboard')
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/admin/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.data || [])
      } else {
        console.error('Failed to fetch customers')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = filterRole === 'all' || customer.role === filterRole
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.full_name.localeCompare(b.full_name)
        case 'orders':
          return b.total_orders - a.total_orders
        case 'spent':
          return b.total_spent - a.total_spent
        case 'recent':
          if (!a.last_order_date && !b.last_order_date) return 0
          if (!a.last_order_date) return 1
          if (!b.last_order_date) return -1
          return new Date(b.last_order_date).getTime() - new Date(a.last_order_date).getTime()
        default:
          return 0
      }
    })

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">👥</div>
            <p>Loading customers...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    redirect('/sign-in')
    return null
  }

  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.total_spent, 0)
  const averageOrderValue = totalCustomers > 0 ? totalRevenue / customers.reduce((sum, customer) => sum + customer.total_orders, 0) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
                <p className="text-gray-600">Manage and analyze your customer base</p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <div className="p-6 text-center">
                  <div className="text-3xl mb-2">👥</div>
                  <div className="text-2xl font-bold text-gray-800">{totalCustomers}</div>
                  <div className="text-sm text-gray-600">Total Customers</div>
                </div>
              </Card>
              
              <Card>
                <div className="p-6 text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-gray-800">K{totalRevenue.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
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
                  <div className="text-3xl mb-2">🎂</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {customers.reduce((sum, customer) => sum + customer.total_orders, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
              </Card>
            </div>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search customers by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value as 'all' | 'customer' | 'admin')}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="all">All Roles</option>
                    <option value="customer">Customers</option>
                    <option value="admin">Admins</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'orders' | 'spent' | 'recent')}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="orders">Sort by Orders</option>
                    <option value="spent">Sort by Revenue</option>
                    <option value="recent">Sort by Recent</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Customers Table */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Customer List ({filteredAndSortedCustomers.length} customers)
              </h2>
              
              {filteredAndSortedCustomers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">👤</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No customers found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Orders</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Spent</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Order</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Member Since</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedCustomers.map((customer) => (
                        <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary-600">
                                  {customer.full_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">{customer.full_name}</div>
                                <div className="text-sm text-gray-600">ID: {customer.id.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              <div className="text-gray-800">{customer.email}</div>
                              {customer.phone && (
                                <div className="text-gray-600">{customer.phone}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              customer.role === 'admin' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {customer.role.charAt(0).toUpperCase() + customer.role.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-gray-800">{customer.total_orders}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-gray-800">K{customer.total_spent.toFixed(2)}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-600">
                              {customer.last_order_date 
                                ? new Date(customer.last_order_date).toLocaleDateString()
                                : 'No orders'
                              }
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-600">
                              {new Date(customer.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Link 
                              href={`/admin/customers/${customer.id}`}
                              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}