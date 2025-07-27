'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Cake {
  id: string
  name: string
  description: string
  base_price: number
  category: string
  images: string[]
  ingredients: any
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const cakeId = params.cakeId as string
  
  const [cake, setCake] = useState<Cake | null>(null)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [customizations, setCustomizations] = useState({
    size: '6"',
    layers: 1,
    tiers: 1,
    message: '',
    specialInstructions: ''
  })
  const [deliveryInfo, setDeliveryInfo] = useState({
    date: '',
    time: 'afternoon',
    street: '',
    city: '',
    phone: ''
  })

  const sizes = [
    { size: '4"', servings: '2-4 people', multiplier: 0.8 },
    { size: '6"', servings: '6-8 people', multiplier: 1.0 },
    { size: '8"', servings: '10-12 people', multiplier: 1.3 },
    { size: '10"', servings: '15-20 people', multiplier: 1.8 }
  ]

  useEffect(() => {
    if (isLoaded && user && cakeId) {
      fetchCake()
    }
  }, [isLoaded, user, cakeId])

  const fetchCake = async () => {
    try {
      const response = await fetch(`/api/cakes/${cakeId}`)
      if (response.ok) {
        const data = await response.json()
        setCake(data.data)
      } else {
        router.push('/catalogue')
      }
    } catch (error) {
      console.error('Error fetching cake:', error)
      router.push('/catalogue')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    if (!cake) return 0
    
    const sizeMultiplier = sizes.find(s => s.size === customizations.size)?.multiplier || 1.0
    const layerMultiplier = customizations.layers > 1 ? 1.2 : 1.0
    const tierMultiplier = customizations.tiers > 1 ? 1.3 : 1.0
    
    return Math.round(cake.base_price * sizeMultiplier * layerMultiplier * tierMultiplier)
  }

  const handlePlaceOrder = async () => {
    if (!cake) return
    
    setPlacing(true)
    try {
      // Ensure user profile exists
      let profileResponse = await fetch('/api/user/profile')
      if (!profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.needsCreation) {
          await fetch('/api/user/profile', { method: 'POST' })
        }
      }

      const orderData = {
        cake_config: {
          catalogueDesign: cake.id,
          flavor: cake.name.toLowerCase().includes('vanilla') ? 'Vanilla' : 
                 cake.name.toLowerCase().includes('chocolate') ? 'Chocolate' :
                 cake.name.toLowerCase().includes('strawberry') ? 'Strawberry' : 'Custom',
          size: customizations.size,
          shape: 'Round',
          layers: customizations.layers,
          tiers: customizations.tiers,
          customization: {
            message: customizations.message,
            selectedCake: cake.name
          }
        },
        total_amount: calculateTotal(),
        delivery_date: deliveryInfo.date,
        delivery_time: deliveryInfo.time,
        delivery_address: {
          street: deliveryInfo.street,
          city: deliveryInfo.city,
          phone: deliveryInfo.phone
        },
        special_instructions: customizations.specialInstructions,
        payment_status: 'pending'
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()
      
      if (result.success) {
        router.push(`/order-confirmation/${result.data.id}`)
      } else {
        alert('Failed to place order: ' + result.error)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Error placing order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">🎂</div>
            <p>Loading checkout...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  if (!cake) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Cake Not Found</h1>
            <Button onClick={() => router.push('/catalogue')}>
              ← Back to Catalogue
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const total = calculateTotal()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => router.push('/catalogue')}
              className="mb-4"
            >
              ← Back to Catalogue
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
            <p className="text-gray-600">Complete your order for this beautiful cake</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cake Details */}
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Your Selected Cake</h2>
                  
                  <div className="flex items-start space-x-4">
                    {cake.images && cake.images[0] ? (
                      <img
                        src={`/images/catalogue/${cake.images[0]}`}
                        alt={cake.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">🎂</span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{cake.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{cake.description}</p>
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {cake.category}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Base Price</div>
                      <div className="text-xl font-bold text-gray-800">K{cake.base_price}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Customizations */}
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Customize Your Order</h2>
                  
                  <div className="space-y-6">
                    {/* Size Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                      <div className="grid grid-cols-2 gap-3">
                        {sizes.map((sizeOption) => (
                          <button
                            key={sizeOption.size}
                            onClick={() => setCustomizations(prev => ({...prev, size: sizeOption.size}))}
                            className={`p-3 border-2 rounded-lg text-left transition-all ${
                              customizations.size === sizeOption.size
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-primary-300'
                            }`}
                          >
                            <div className="font-semibold">{sizeOption.size} - {sizeOption.servings}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Layers and Tiers */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Layers</label>
                        <select
                          value={customizations.layers}
                          onChange={(e) => setCustomizations(prev => ({...prev, layers: parseInt(e.target.value)}))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value={1}>1 Layer</option>
                          <option value={2}>2 Layers</option>
                          <option value={3}>3 Layers</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tiers</label>
                        <select
                          value={customizations.tiers}
                          onChange={(e) => setCustomizations(prev => ({...prev, tiers: parseInt(e.target.value)}))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value={1}>1 Tier</option>
                          <option value={2}>2 Tiers</option>
                          <option value={3}>3 Tiers</option>
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Message (Optional)</label>
                      <input
                        type="text"
                        value={customizations.message}
                        onChange={(e) => setCustomizations(prev => ({...prev, message: e.target.value}))}
                        placeholder="Happy Birthday!"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* Special Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (Optional)</label>
                      <textarea
                        value={customizations.specialInstructions}
                        onChange={(e) => setCustomizations(prev => ({...prev, specialInstructions: e.target.value}))}
                        placeholder="Any special requests or dietary requirements..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Delivery Information */}
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                        <input
                          type="date"
                          value={deliveryInfo.date}
                          onChange={(e) => setDeliveryInfo(prev => ({...prev, date: e.target.value}))}
                          min={new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                        <select
                          value={deliveryInfo.time}
                          onChange={(e) => setDeliveryInfo(prev => ({...prev, time: e.target.value}))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value="morning">Morning (9AM - 12PM)</option>
                          <option value="afternoon">Afternoon (12PM - 5PM)</option>
                          <option value="evening">Evening (5PM - 8PM)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={deliveryInfo.street}
                        onChange={(e) => setDeliveryInfo(prev => ({...prev, street: e.target.value}))}
                        placeholder="Street address"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={deliveryInfo.city}
                          onChange={(e) => setDeliveryInfo(prev => ({...prev, city: e.target.value}))}
                          placeholder="City"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={deliveryInfo.phone}
                          onChange={(e) => setDeliveryInfo(prev => ({...prev, phone: e.target.value}))}
                          placeholder="Phone number"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-8">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span>K{cake.base_price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size ({customizations.size}):</span>
                      <span>{sizes.find(s => s.size === customizations.size)?.servings}</span>
                    </div>
                    {customizations.layers > 1 && (
                      <div className="flex justify-between">
                        <span>Extra Layers:</span>
                        <span>+20%</span>
                      </div>
                    )}
                    {customizations.tiers > 1 && (
                      <div className="flex justify-between">
                        <span>Multiple Tiers:</span>
                        <span>+30%</span>
                      </div>
                    )}
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>K{total}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handlePlaceOrder}
                      disabled={placing || !deliveryInfo.date || !deliveryInfo.street || !deliveryInfo.city || !deliveryInfo.phone}
                    >
                      {placing ? 'Placing Order...' : `Place Order - K${total}`}
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      By placing your order, you agree to our terms and conditions.
                      Payment will be collected upon delivery.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}