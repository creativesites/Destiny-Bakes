'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

interface BrandingSettings {
  businessName: string
  tagline: string
  logo: string
  favicon: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  headerFont: string
}

interface ContactSettings {
  email: string
  phone: string
  whatsapp: string
  address: string
  city: string
  country: string
  businessHours: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
}

interface SystemSettings {
  currency: string
  timezone: string
  dateFormat: string
  allowGuestOrders: boolean
  requirePhoneVerification: boolean
  enableReviews: boolean
  enableNotifications: boolean
  maintenanceMode: boolean
  googleAnalyticsId: string
  facebookPixelId: string
}

interface SEOSettings {
  metaTitle: string
  metaDescription: string
  keywords: string
  ogImage: string
  structuredData: boolean
  sitemapEnabled: boolean
  robotsTxt: string
}

const defaultBrandingSettings: BrandingSettings = {
  businessName: 'Destiny Bakes',
  tagline: 'Crafting delicious memories, one cake at a time',
  logo: '',
  favicon: '',
  primaryColor: '#E91E63',
  secondaryColor: '#FFF8E1',
  accentColor: '#FFD700',
  fontFamily: 'Poppins',
  headerFont: 'Playfair Display'
}

const defaultContactSettings: ContactSettings = {
  email: 'hello@destinybakes.com',
  phone: '+260 123 456 789',
  whatsapp: '+260 123 456 789',
  address: '123 Baker Street',
  city: 'Chirundu',
  country: 'Zambia',
  businessHours: {
    monday: { open: '08:00', close: '18:00', closed: false },
    tuesday: { open: '08:00', close: '18:00', closed: false },
    wednesday: { open: '08:00', close: '18:00', closed: false },
    thursday: { open: '08:00', close: '18:00', closed: false },
    friday: { open: '08:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '16:00', closed: false },
    sunday: { open: '10:00', close: '14:00', closed: false }
  }
}

const defaultSystemSettings: SystemSettings = {
  currency: 'ZMW',
  timezone: 'Africa/Lusaka',
  dateFormat: 'DD/MM/YYYY',
  allowGuestOrders: true,
  requirePhoneVerification: false,
  enableReviews: true,
  enableNotifications: true,
  maintenanceMode: false,
  googleAnalyticsId: '',
  facebookPixelId: ''
}

const defaultSEOSettings: SEOSettings = {
  metaTitle: 'Destiny Bakes - Custom Cake Ordering Platform',
  metaDescription: 'Order custom cakes from Destiny Bakes. Beautiful, delicious cakes for every occasion.',
  keywords: 'cakes, custom cakes, bakery, Zambia, birthday cakes, wedding cakes',
  ogImage: '',
  structuredData: true,
  sitemapEnabled: true,
  robotsTxt: 'User-agent: *\nAllow: /'
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('branding')
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>(defaultBrandingSettings)
  const [contactSettings, setContactSettings] = useState<ContactSettings>(defaultContactSettings)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(defaultSystemSettings)
  const [seoSettings, setSEOSettings] = useState<SEOSettings>(defaultSEOSettings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const tabs = [
    { id: 'branding', name: 'Branding', icon: '🎨' },
    { id: 'contact', name: 'Contact Info', icon: '📞' },
    { id: 'system', name: 'System', icon: '⚙️' },
    { id: 'seo', name: 'SEO', icon: '🔍' },
    { id: 'integrations', name: 'Integrations', icon: '🔌' },
    { id: 'backup', name: 'Backup', icon: '💾' }
  ]

  const fontOptions = [
    'Poppins',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Source Sans Pro',
    'Raleway',
    'Nunito',
    'Ubuntu',
    'Inter'
  ]

  const headerFontOptions = [
    'Playfair Display',
    'Merriweather',
    'Lora',
    'Crimson Text',
    'Libre Baskerville',
    'Cormorant Garamond',
    'Dancing Script',
    'Great Vibes',
    'Pacifico',
    'Lobster'
  ]

  const currencies = [
    { code: 'ZMW', name: 'Zambian Kwacha' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'ZAR', name: 'South African Rand' }
  ]

  const timezones = [
    'Africa/Lusaka',
    'Africa/Harare',
    'Africa/Johannesburg',
    'Africa/Nairobi',
    'Africa/Cairo',
    'UTC'
  ]

  const handleSave = async () => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const generateCSS = () => {
    return `
:root {
  --primary-color: ${brandingSettings.primaryColor};
  --secondary-color: ${brandingSettings.secondaryColor};
  --accent-color: ${brandingSettings.accentColor};
  --font-family: '${brandingSettings.fontFamily}', sans-serif;
  --header-font: '${brandingSettings.headerFont}', serif;
}

body {
  font-family: var(--font-family);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--header-font);
}
`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">
            System Settings
          </h1>
          <p className="text-gray-600">
            Configure your bakery's branding, contact information, and system preferences
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => window.open('/admin/settings/preview', '_blank')}
            variant="outline"
          >
            👁️ Preview Changes
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className={`${
              saved 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            }`}
          >
            {saving ? '💾 Saving...' : saved ? '✅ Saved!' : '💾 Save Settings'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
            <div className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <div className="p-8">
                <h2 className="font-display text-3xl font-bold text-gray-800 mb-6">
                  🎨 Branding Settings
                </h2>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={brandingSettings.businessName}
                        onChange={(e) => setBrandingSettings(prev => ({ ...prev, businessName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tagline
                      </label>
                      <textarea
                        value={brandingSettings.tagline}
                        onChange={(e) => setBrandingSettings(prev => ({ ...prev, tagline: e.target.value }))}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="color"
                            value={brandingSettings.primaryColor}
                            onChange={(e) => setBrandingSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-12 h-12 border border-gray-300 rounded-xl"
                          />
                          <input
                            type="text"
                            value={brandingSettings.primaryColor}
                            onChange={(e) => setBrandingSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="color"
                            value={brandingSettings.secondaryColor}
                            onChange={(e) => setBrandingSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="w-12 h-12 border border-gray-300 rounded-xl"
                          />
                          <input
                            type="text"
                            value={brandingSettings.secondaryColor}
                            onChange={(e) => setBrandingSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Accent Color
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="color"
                            value={brandingSettings.accentColor}
                            onChange={(e) => setBrandingSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                            className="w-12 h-12 border border-gray-300 rounded-xl"
                          />
                          <input
                            type="text"
                            value={brandingSettings.accentColor}
                            onChange={(e) => setBrandingSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Body Font
                        </label>
                        <select
                          value={brandingSettings.fontFamily}
                          onChange={(e) => setBrandingSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {fontOptions.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Header Font
                        </label>
                        <select
                          value={brandingSettings.headerFont}
                          onChange={(e) => setBrandingSettings(prev => ({ ...prev, headerFont: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {headerFontOptions.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Upload
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                        <div className="text-4xl mb-4">🖼️</div>
                        <p className="text-gray-600 mb-4">Drop logo here or click to browse</p>
                        <Button variant="outline" size="sm">
                          📁 Choose File
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Favicon Upload
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                        <div className="text-2xl mb-2">🔗</div>
                        <p className="text-sm text-gray-600 mb-3">16x16 or 32x32 px ICO file</p>
                        <Button variant="outline" size="sm">
                          📁 Choose File
                        </Button>
                      </div>
                    </div>

                    {/* Live Preview */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="font-medium text-gray-800 mb-4">Live Preview</h3>
                      <div 
                        className="bg-white rounded-lg p-6 border"
                        style={{ 
                          fontFamily: brandingSettings.fontFamily,
                          borderColor: brandingSettings.primaryColor 
                        }}
                      >
                        <h4 
                          className="text-2xl font-bold mb-2"
                          style={{ 
                            fontFamily: brandingSettings.headerFont,
                            color: brandingSettings.primaryColor 
                          }}
                        >
                          {brandingSettings.businessName}
                        </h4>
                        <p className="text-gray-600 mb-4">
                          {brandingSettings.tagline}
                        </p>
                        <button
                          className="px-6 py-2 rounded-lg text-white font-medium"
                          style={{ backgroundColor: brandingSettings.primaryColor }}
                        >
                          Order Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="p-8">
                <h2 className="font-display text-3xl font-bold text-gray-800 mb-6">
                  📞 Contact Information
                </h2>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={contactSettings.email}
                          onChange={(e) => setContactSettings(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={contactSettings.phone}
                          onChange={(e) => setContactSettings(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        value={contactSettings.whatsapp}
                        onChange={(e) => setContactSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Address
                      </label>
                      <textarea
                        value={contactSettings.address}
                        onChange={(e) => setContactSettings(prev => ({ ...prev, address: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={contactSettings.city}
                          onChange={(e) => setContactSettings(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          value={contactSettings.country}
                          onChange={(e) => setContactSettings(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-800 mb-4">Business Hours</h3>
                    <div className="space-y-3">
                      {Object.entries(contactSettings.businessHours).map(([day, hours]) => (
                        <div key={day} className="flex items-center space-x-3">
                          <div className="w-20 text-sm font-medium text-gray-700 capitalize">
                            {day}
                          </div>
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="checkbox"
                              checked={!hours.closed}
                              onChange={(e) => setContactSettings(prev => ({
                                ...prev,
                                businessHours: {
                                  ...prev.businessHours,
                                  [day]: { ...hours, closed: !e.target.checked }
                                }
                              }))}
                              className="rounded"
                            />
                            {!hours.closed ? (
                              <>
                                <input
                                  type="time"
                                  value={hours.open}
                                  onChange={(e) => setContactSettings(prev => ({
                                    ...prev,
                                    businessHours: {
                                      ...prev.businessHours,
                                      [day]: { ...hours, open: e.target.value }
                                    }
                                  }))}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                  type="time"
                                  value={hours.close}
                                  onChange={(e) => setContactSettings(prev => ({
                                    ...prev,
                                    businessHours: {
                                      ...prev.businessHours,
                                      [day]: { ...hours, close: e.target.value }
                                    }
                                  }))}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </>
                            ) : (
                              <span className="text-gray-500 text-sm">Closed</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="p-8">
                <h2 className="font-display text-3xl font-bold text-gray-800 mb-6">
                  ⚙️ System Settings
                </h2>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select
                          value={systemSettings.currency}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, currency: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {currencies.map(currency => (
                            <option key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timezone
                        </label>
                        <select
                          value={systemSettings.timezone}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, timezone: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {timezones.map(tz => (
                            <option key={tz} value={tz}>{tz}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Format
                      </label>
                      <select
                        value={systemSettings.dateFormat}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Google Analytics ID
                        </label>
                        <input
                          type="text"
                          value={systemSettings.googleAnalyticsId}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                          placeholder="GA-XXXXXXXXX-X"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Facebook Pixel ID
                        </label>
                        <input
                          type="text"
                          value={systemSettings.facebookPixelId}
                          onChange={(e) => setSystemSettings(prev => ({ ...prev, facebookPixelId: e.target.value }))}
                          placeholder="123456789012345"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="font-medium text-gray-800 mb-4">Feature Settings</h3>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'allowGuestOrders', label: 'Allow Guest Orders', description: 'Let customers order without creating an account' },
                        { key: 'requirePhoneVerification', label: 'Require Phone Verification', description: 'Verify customer phone numbers before processing orders' },
                        { key: 'enableReviews', label: 'Enable Reviews', description: 'Allow customers to leave reviews and ratings' },
                        { key: 'enableNotifications', label: 'Enable Notifications', description: 'Send WhatsApp/SMS notifications for order updates' },
                        { key: 'maintenanceMode', label: 'Maintenance Mode', description: 'Put the website in maintenance mode' }
                      ].map(setting => (
                        <div key={setting.key} className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={systemSettings[setting.key as keyof SystemSettings] as boolean}
                            onChange={(e) => setSystemSettings(prev => ({
                              ...prev,
                              [setting.key]: e.target.checked
                            }))}
                            className="mt-1 rounded"
                          />
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                              {setting.label}
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              {setting.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="p-8">
                <h2 className="font-display text-3xl font-bold text-gray-800 mb-6">
                  🔍 SEO Settings
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={seoSettings.metaTitle}
                      onChange={(e) => setSEOSettings(prev => ({ ...prev, metaTitle: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {seoSettings.metaTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={seoSettings.metaDescription}
                      onChange={(e) => setSEOSettings(prev => ({ ...prev, metaDescription: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {seoSettings.metaDescription.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keywords
                    </label>
                    <input
                      type="text"
                      value={seoSettings.keywords}
                      onChange={(e) => setSEOSettings(prev => ({ ...prev, keywords: e.target.value }))}
                      placeholder="cake, bakery, custom cakes, zambia"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate keywords with commas
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Robots.txt Content
                    </label>
                    <textarea
                      value={seoSettings.robotsTxt}
                      onChange={(e) => setSEOSettings(prev => ({ ...prev, robotsTxt: e.target.value }))}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={seoSettings.structuredData}
                          onChange={(e) => setSEOSettings(prev => ({ ...prev, structuredData: e.target.checked }))}
                          className="rounded"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Enable Structured Data
                          </label>
                          <p className="text-xs text-gray-500">
                            Add JSON-LD structured data for better search visibility
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={seoSettings.sitemapEnabled}
                          onChange={(e) => setSEOSettings(prev => ({ ...prev, sitemapEnabled: e.target.checked }))}
                          className="rounded"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Generate Sitemap
                          </label>
                          <p className="text-xs text-gray-500">
                            Automatically generate and update XML sitemap
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Open Graph Image
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                        <div className="text-3xl mb-2">🖼️</div>
                        <p className="text-sm text-gray-600 mb-3">1200x630 px recommended</p>
                        <Button variant="outline" size="sm">
                          📁 Choose Image
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="p-8">
                <h2 className="font-display text-3xl font-bold text-gray-800 mb-6">
                  🔌 Integrations
                </h2>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <h3 className="font-bold text-lg">Payment Providers</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            💳
                          </div>
                          <div>
                            <h4 className="font-medium">Flutterwave</h4>
                            <p className="text-sm text-gray-500">Primary payment processor</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">Configure</Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            💰
                          </div>
                          <div>
                            <h4 className="font-medium">Paystack</h4>
                            <p className="text-sm text-gray-500">Alternative payment option</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">Configure</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="font-bold text-lg">Communication</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            📱
                          </div>
                          <div>
                            <h4 className="font-medium">WhatsApp Business</h4>
                            <p className="text-sm text-gray-500">Order notifications via WhatsApp</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">Configure</Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            📧
                          </div>
                          <div>
                            <h4 className="font-medium">Email Service</h4>
                            <p className="text-sm text-gray-500">Order confirmations and updates</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">Configure</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Backup Tab */}
            {activeTab === 'backup' && (
              <div className="p-8">
                <h2 className="font-display text-3xl font-bold text-gray-800 mb-6">
                  💾 Backup & Export
                </h2>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <h3 className="font-bold text-lg">System Backup</h3>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <div className="text-4xl mb-4">☁️</div>
                        <p className="text-gray-600 mb-6">
                          Create a complete backup of your system settings, pages, and configurations
                        </p>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          📥 Create Backup
                        </Button>
                      </div>

                      <div className="border-t pt-6">
                        <h4 className="font-medium mb-3">Recent Backups</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">Full System Backup</p>
                              <p className="text-xs text-gray-500">Today, 2:30 PM</p>
                            </div>
                            <Button size="sm" variant="outline">Download</Button>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">Settings Only</p>
                              <p className="text-xs text-gray-500">Yesterday, 11:45 AM</p>
                            </div>
                            <Button size="sm" variant="outline">Download</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="font-bold text-lg">Data Export</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="h-20 flex flex-col">
                          <div className="text-2xl mb-1">📊</div>
                          <span className="text-sm">Export Orders</span>
                        </Button>

                        <Button variant="outline" className="h-20 flex flex-col">
                          <div className="text-2xl mb-1">👥</div>
                          <span className="text-sm">Export Customers</span>
                        </Button>

                        <Button variant="outline" className="h-20 flex flex-col">
                          <div className="text-2xl mb-1">🎂</div>
                          <span className="text-sm">Export Catalog</span>
                        </Button>

                        <Button variant="outline" className="h-20 flex flex-col">
                          <div className="text-2xl mb-1">📄</div>
                          <span className="text-sm">Export Pages</span>
                        </Button>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-3">Import Settings</h4>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                          <div className="text-3xl mb-2">📁</div>
                          <p className="text-sm text-gray-600 mb-3">
                            Import settings from backup file
                          </p>
                          <Button size="sm" variant="outline">
                            Choose File
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated CSS Preview */}
      {activeTab === 'branding' && (
        <Card>
          <CardHeader>
            <h3 className="font-bold text-lg">Generated CSS</h3>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              {generateCSS()}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}