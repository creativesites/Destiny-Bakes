'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
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
  special_instructions?: string
  created_at: string
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [redirectCountdown, setRedirectCountdown] = useState(10)

  useEffect(() => {
    if (isLoaded && user && orderId) {
      fetchOrder()
    }
  }, [isLoaded, user, orderId])

  useEffect(() => {
    // Auto redirect to dashboard after 10 seconds
    if (order && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (redirectCountdown === 0) {
      router.push('/dashboard')
    }
  }, [order, redirectCountdown, router])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/user/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data.data)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">🎂</div>
            <p>Loading your order confirmation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h1>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Animation & Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">
                🎉 Order Confirmed!
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                Thank you for choosing Destiny Bakes, {user.firstName}!
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></span>
                Order #{order.order_number} Successfully Placed
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
                  <h2 className="text-xl font-semibold mb-2">Your Beautiful Cake Order</h2>
                  <p className="text-primary-100">We're excited to create this special cake for you!</p>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Cake Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Flavor:</span>
                          <span className="font-medium">{order.cake_config?.flavor || 'Custom'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Size:</span>
                          <span className="font-medium">{order.cake_config?.size || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shape:</span>
                          <span className="font-medium">{order.cake_config?.shape || 'Round'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Layers:</span>
                          <span className="font-medium">{order.cake_config?.layers || 1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tiers:</span>
                          <span className="font-medium">{order.cake_config?.tiers || 1}</span>
                        </div>
                        {order.cake_config?.customization?.message && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Message:</span>
                            <span className="font-medium">"{order.cake_config.customization.message}"</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Order Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Date:</span>
                          <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Date:</span>
                          <span className="font-medium">{order.delivery_date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Time:</span>
                          <span className="font-medium">
                            {order.delivery_time === 'morning' ? '9AM - 12PM' :
                             order.delivery_time === 'afternoon' ? '12PM - 5PM' :
                             order.delivery_time === 'evening' ? '5PM - 8PM' : order.delivery_time}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {order.special_instructions && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">Special Instructions</h3>
                      <p className="text-sm text-gray-600">{order.special_instructions}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Delivery Information */}
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">📍 Delivery Information</h2>
                  <div className="space-y-2">
                    <p className="text-gray-800">
                      <span className="font-medium">Address:</span> {order.delivery_address?.street}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-medium">City:</span> {order.delivery_address?.city}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-medium">Phone:</span> {order.delivery_address?.phone}
                    </p>
                  </div>
                </div>
              </Card>

              {/* What's Next */}
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">🚀 What Happens Next?</h2>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary-600">1</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">Order Confirmation</h3>
                        <p className="text-sm text-gray-600">You'll receive an email confirmation with your order details.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-yellow-600">2</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">Preparation Begins</h3>
                        <p className="text-sm text-gray-600">Our bakers will start preparing your custom cake with love and care.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-blue-600">3</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">Updates & Tracking</h3>
                        <p className="text-sm text-gray-600">Track your order progress through your dashboard and receive notifications.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-green-600">4</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">Delivery</h3>
                        <p className="text-sm text-gray-600">Your cake will be delivered fresh on {order.delivery_date}.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Total */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Order Total</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Cake Price:</span>
                      <span>K{order.total_amount.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-primary-600">K{order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Payment will be collected upon delivery. Cash or mobile money accepted.
                  </p>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link href={`/dashboard/orders/${order.id}`} className="btn-primary w-full text-center">
                      Track This Order
                    </Link>
                    <Link href="/dashboard/orders" className="btn-secondary w-full text-center">
                      View All Orders
                    </Link>
                    <Link href="/cake-designer" className="btn-outline w-full text-center">
                      Design Another Cake
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Auto Redirect Notice */}
              <Card>
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">⏰</span>
                  </div>
                  <h3 className="font-medium text-gray-800 mb-2">Auto Redirect</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Redirecting to your dashboard in {redirectCountdown} seconds
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    className="w-full"
                  >
                    Go to Dashboard Now
                  </Button>
                </div>
              </Card>

              {/* Contact Support */}
              <Card>
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="font-medium text-gray-800 mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Have questions about your order? We're here to help!
                  </p>
                  <p className="text-sm text-gray-800 font-medium">
                    WhatsApp: +260 XXX XXX XXX
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}