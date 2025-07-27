'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { CakeConfig, DeliveryAddress } from '@/types/database'

interface OrderPlacementProps {
  cakeConfig: CakeConfig
  previewImage?: string
  onOrderComplete: (orderId: string) => void
}

interface PaymentInstructions {
  method: string
  phone_number: string
  amount: number
  reference: string
  instructions: string[]
}

export function OrderPlacement({ cakeConfig, previewImage, onOrderComplete }: OrderPlacementProps) {
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)
  const [paymentInstructions, setPaymentInstructions] = useState<PaymentInstructions | null>(null)
  const [formData, setFormData] = useState({
    delivery_date: '',
    delivery_time: 'morning',
    delivery_address: {
      label: 'Home',
      street: '',
      area: '',
      city: 'Chirundu',
      landmark: '',
      phone: ''
    } as DeliveryAddress,
    special_instructions: '',
    total_amount: 0
  })

  // Calculate price based on cake config
  const calculatePrice = () => {
    let basePrice = 150 // Base price in ZMW
    
    // Size multiplier
    const sizeMultipliers = { '4"': 1, '6"': 1.5, '8"': 2, '10"': 3 }
    basePrice *= sizeMultipliers[cakeConfig.size] || 1
    
    // Layer/tier multiplier
    if (cakeConfig.layers > 1) basePrice *= 1.2
    if (cakeConfig.tiers > 1) basePrice *= 1.5
    
    // Customization extras
    if (cakeConfig.customization?.message) basePrice += 20
    if (cakeConfig.customization?.decorations?.length) basePrice += 30
    
    return Math.round(basePrice)
  }

  const handleSubmitOrder = async () => {
    setLoading(true)
    try {
      const totalAmount = calculatePrice()
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cake_config: cakeConfig,
          delivery_date: formData.delivery_date,
          delivery_time: formData.delivery_time,
          delivery_address: formData.delivery_address,
          special_instructions: formData.special_instructions,
          total_amount: totalAmount
        })
      })

      const data = await response.json()

      if (data.success) {
        setOrderData(data.order)
        setPaymentInstructions(data.payment_instructions)
        setStep(3)
      } else {
        alert(data.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Failed to create order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/orders/${orderData.id}/confirm-payment`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        setStep(4)
        onOrderComplete(orderData.id)
      } else {
        alert(data.error || 'Failed to confirm payment')
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      alert('Failed to confirm payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card variant="premium" className="p-8">
          <h2 className="font-display text-3xl font-bold text-gray-800 mb-6">
            Order Summary
          </h2>
          
          {/* Cake Preview */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              {previewImage ? (
                <img src={previewImage} alt="Cake Preview" className="w-full h-48 object-cover rounded-lg" />
              ) : (
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-6xl">🎂</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800">Cake Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Flavor:</strong> {cakeConfig.flavor}</p>
                  <p><strong>Size:</strong> {cakeConfig.size}</p>
                  <p><strong>Shape:</strong> {cakeConfig.shape}</p>
                  <p><strong>Layers:</strong> {cakeConfig.layers}</p>
                  {cakeConfig.tiers > 1 && <p><strong>Tiers:</strong> {cakeConfig.tiers}</p>}
                  {cakeConfig.occasion && <p><strong>Occasion:</strong> {cakeConfig.occasion}</p>}
                </div>
              </div>
              
              {cakeConfig.customization?.message && (
                <div>
                  <h4 className="font-semibold text-gray-800">Message</h4>
                  <p className="text-sm text-gray-600">"{cakeConfig.customization.message}"</p>
                </div>
              )}
              
              <div className="text-2xl font-bold text-gray-800">
                ZMW {calculatePrice()}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button 
              onClick={() => setStep(2)}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
            >
              Continue to Delivery Details
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card variant="premium" className="p-8">
          <h2 className="font-display text-3xl font-bold text-gray-800 mb-6">
            Delivery Details
          </h2>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                  min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 24 hours advance notice required</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <select
                  value={formData.delivery_time}
                  onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="morning">Morning (8AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 4PM)</option>
                  <option value="evening">Evening (4PM - 7PM)</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={formData.delivery_address.street}
                  onChange={(e) => setFormData({
                    ...formData,
                    delivery_address: { ...formData.delivery_address, street: e.target.value }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Area/Neighborhood"
                  value={formData.delivery_address.area}
                  onChange={(e) => setFormData({
                    ...formData,
                    delivery_address: { ...formData.delivery_address, area: e.target.value }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <input
                  type="text"
                  placeholder="Landmark (optional)"
                  value={formData.delivery_address.landmark}
                  onChange={(e) => setFormData({
                    ...formData,
                    delivery_address: { ...formData.delivery_address, landmark: e.target.value }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
                <input
                  type="tel"
                  placeholder="Contact Phone"
                  value={formData.delivery_address.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    delivery_address: { ...formData.delivery_address, phone: e.target.value }
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                value={formData.special_instructions}
                onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                placeholder="Any special requests or additional information..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex space-x-4 mt-8">
            <Button 
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Back to Summary
            </Button>
            <Button 
              onClick={handleSubmitOrder}
              disabled={loading || !formData.delivery_date || !formData.delivery_address.street}
              isLoading={loading}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
            >
              Place Order
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (step === 3 && paymentInstructions) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card variant="premium" className="p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">💳</div>
            <h2 className="font-display text-3xl font-bold text-gray-800 mb-4">
              Complete Your Payment
            </h2>
            <p className="text-gray-600">
              Your order has been created successfully! Please complete payment to confirm your order.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📱</span>
              Airtel Money Payment Instructions
            </h3>
            
            <div className="space-y-3">
              {paymentInstructions.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{instruction}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h4 className="font-bold text-gray-800 mb-4">Payment Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Recipient:</span>
                <p className="font-semibold">{paymentInstructions.phone_number}</p>
              </div>
              <div>
                <span className="text-gray-600">Amount:</span>
                <p className="font-semibold">ZMW {paymentInstructions.amount}</p>
              </div>
              <div>
                <span className="text-gray-600">Reference:</span>
                <p className="font-semibold">{paymentInstructions.reference}</p>
              </div>
              <div>
                <span className="text-gray-600">Order Number:</span>
                <p className="font-semibold">{orderData.order_number}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <h4 className="font-semibold text-yellow-800 mb-2">Important:</h4>
            <p className="text-yellow-700 text-sm">
              Please ensure you use the exact reference number "{paymentInstructions.reference}" 
              when making the payment. This helps us identify your order quickly.
            </p>
          </div>
          
          <Button 
            onClick={handleConfirmPayment}
            disabled={loading}
            isLoading={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg py-4"
          >
            ✅ Payment Complete - Confirm Order
          </Button>
          
          <p className="text-center text-sm text-gray-500 mt-4">
            Only click this button after successfully completing the Airtel Money payment
          </p>
        </Card>
      </div>
    )
  }

  if (step === 4) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card variant="premium" className="p-8 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="font-display text-3xl font-bold text-gray-800 mb-4">
            Order Confirmed!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Thank you for your order! We've received your payment confirmation.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-green-800 mb-4">What happens next?</h3>
            <div className="text-left space-y-3 text-green-700">
              <div className="flex items-center space-x-3">
                <span className="text-green-500">✅</span>
                <span>You will receive a WhatsApp confirmation within 5 minutes</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">📞</span>
                <span>We may call to confirm delivery details</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">🎂</span>
                <span>Your cake will be freshly prepared for delivery</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-500">🚚</span>
                <span>Delivery on {new Date(formData.delivery_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Order Number: <strong>{orderData.order_number}</strong>
            </p>
            <Button 
              onClick={() => window.location.href = '/orders'}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
            >
              View My Orders
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return null
}