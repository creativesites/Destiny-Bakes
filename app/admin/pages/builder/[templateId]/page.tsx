'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

interface PageComponent {
  id: string
  type: string
  name: string
  icon: string
  content: any
  styles: any
}

interface ComponentLibraryItem {
  id: string
  type: string
  name: string
  icon: string
  description: string
  defaultContent: any
  defaultStyles: any
}

const componentLibrary: ComponentLibraryItem[] = [
  {
    id: 'hero-section',
    type: 'hero',
    name: 'Hero Section',
    icon: '🎯',
    description: 'Large banner with title, subtitle, and call-to-action',
    defaultContent: {
      title: 'Welcome to Our Bakery',
      subtitle: 'Crafting delicious memories, one cake at a time',
      buttonText: 'Order Now',
      buttonLink: '/order',
      backgroundImage: '/images/hero-bg.jpg'
    },
    defaultStyles: {
      height: '500px',
      textAlign: 'center',
      backgroundColor: '#f8f9fa'
    }
  },
  {
    id: 'featured-cakes',
    type: 'featured-grid',
    name: 'Featured Cakes',
    icon: '🎂',
    description: 'Grid of featured cake products',
    defaultContent: {
      title: 'Featured Cakes',
      items: [
        { name: 'Chocolate Delight', price: 'ZMW 150', image: '/images/cake1.jpg' },
        { name: 'Vanilla Dream', price: 'ZMW 120', image: '/images/cake2.jpg' },
        { name: 'Strawberry Special', price: 'ZMW 180', image: '/images/cake3.jpg' }
      ]
    },
    defaultStyles: {
      padding: '60px 0',
      backgroundColor: '#ffffff'
    }
  },
  {
    id: 'testimonials',
    type: 'testimonials',
    name: 'Customer Testimonials',
    icon: '💬',
    description: 'Customer reviews and testimonials',
    defaultContent: {
      title: 'What Our Customers Say',
      testimonials: [
        {
          name: 'Sarah Johnson',
          text: 'Amazing cakes! Perfect for our wedding celebration.',
          rating: 5,
          image: '/images/customer1.jpg'
        },
        {
          name: 'Michael Brown',
          text: 'Best birthday cake we ever had. Highly recommended!',
          rating: 5,
          image: '/images/customer2.jpg'
        }
      ]
    },
    defaultStyles: {
      padding: '60px 0',
      backgroundColor: '#f8f9fa'
    }
  },
  {
    id: 'about-section',
    type: 'about',
    name: 'About Section',
    icon: '👋',
    description: 'About us content with image and text',
    defaultContent: {
      title: 'Our Story',
      text: 'We are passionate bakers dedicated to creating beautiful and delicious cakes for every special occasion.',
      image: '/images/about-us.jpg',
      buttonText: 'Learn More',
      buttonLink: '/about'
    },
    defaultStyles: {
      padding: '60px 0',
      backgroundColor: '#ffffff'
    }
  },
  {
    id: 'contact-info',
    type: 'contact',
    name: 'Contact Information',
    icon: '📞',
    description: 'Contact details and location',
    defaultContent: {
      title: 'Get In Touch',
      phone: '+260 123 456 789',
      email: 'hello@destinybakes.com',
      address: 'Chirundu, Zambia',
      hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-4PM'
    },
    defaultStyles: {
      padding: '60px 0',
      backgroundColor: '#f8f9fa'
    }
  },
  {
    id: 'image-gallery',
    type: 'gallery',
    name: 'Image Gallery',
    icon: '🖼️',
    description: 'Grid of images showcasing work',
    defaultContent: {
      title: 'Our Creations',
      images: [
        '/images/gallery1.jpg',
        '/images/gallery2.jpg',
        '/images/gallery3.jpg',
        '/images/gallery4.jpg'
      ]
    },
    defaultStyles: {
      padding: '60px 0',
      backgroundColor: '#ffffff'
    }
  },
  {
    id: 'call-to-action',
    type: 'cta',
    name: 'Call to Action',
    icon: '📢',
    description: 'Prominent call-to-action section',
    defaultContent: {
      title: 'Ready to Order?',
      subtitle: 'Let us create the perfect cake for your special occasion',
      buttonText: 'Start Designing',
      buttonLink: '/cake-designer',
      backgroundColor: '#E91E63'
    },
    defaultStyles: {
      padding: '80px 0',
      textAlign: 'center',
      color: '#ffffff'
    }
  },
  {
    id: 'text-content',
    type: 'text',
    name: 'Rich Text',
    icon: '📝',
    description: 'Rich text content block',
    defaultContent: {
      html: '<h2>Your Content Here</h2><p>Add your text content, links, and formatting here.</p>'
    },
    defaultStyles: {
      padding: '40px 0',
      backgroundColor: '#ffffff'
    }
  }
]

export default function PageBuilder() {
  const params = useParams()
  const templateId = params.templateId as string
  const [pageComponents, setPageComponents] = useState<PageComponent[]>([])
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [sidebarTab, setSidebarTab] = useState<'components' | 'settings'>('components')
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result

    // Adding new component from library
    if (source.droppableId === 'component-library') {
      const libraryItem = componentLibrary[source.index]
      const newComponent: PageComponent = {
        id: `${libraryItem.type}-${Date.now()}`,
        type: libraryItem.type,
        name: libraryItem.name,
        icon: libraryItem.icon,
        content: libraryItem.defaultContent,
        styles: libraryItem.defaultStyles
      }
      
      const newComponents = [...pageComponents]
      newComponents.splice(destination.index, 0, newComponent)
      setPageComponents(newComponents)
      return
    }

    // Reordering existing components
    if (source.droppableId === 'page-canvas' && destination.droppableId === 'page-canvas') {
      const newComponents = Array.from(pageComponents)
      const [reorderedItem] = newComponents.splice(source.index, 1)
      newComponents.splice(destination.index, 0, reorderedItem)
      setPageComponents(newComponents)
    }
  }

  const deleteComponent = (componentId: string) => {
    setPageComponents(prev => prev.filter(comp => comp.id !== componentId))
    if (selectedComponent === componentId) {
      setSelectedComponent(null)
    }
  }

  const duplicateComponent = (componentId: string) => {
    const component = pageComponents.find(comp => comp.id === componentId)
    if (component) {
      const newComponent = {
        ...component,
        id: `${component.type}-${Date.now()}`,
        name: `${component.name} Copy`
      }
      const index = pageComponents.findIndex(comp => comp.id === componentId)
      const newComponents = [...pageComponents]
      newComponents.splice(index + 1, 0, newComponent)
      setPageComponents(newComponents)
    }
  }

  const updateComponentContent = (componentId: string, newContent: any) => {
    setPageComponents(prev => prev.map(comp => 
      comp.id === componentId ? { ...comp, content: { ...comp.content, ...newContent } } : comp
    ))
  }

  const updateComponentStyles = (componentId: string, newStyles: any) => {
    setPageComponents(prev => prev.map(comp => 
      comp.id === componentId ? { ...comp, styles: { ...comp.styles, ...newStyles } } : comp
    ))
  }

  const renderComponent = (component: PageComponent, index: number) => {
    const isSelected = selectedComponent === component.id
    
    return (
      <Draggable key={component.id} draggableId={component.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`relative group ${isSelected ? 'ring-2 ring-blue-500' : ''} ${
              snapshot.isDragging ? 'rotate-3 scale-105' : ''
            } transition-all duration-200`}
            onClick={() => setSelectedComponent(component.id)}
          >
            {/* Component Controls */}
            {!isPreviewMode && (
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex space-x-1">
                  <button
                    {...provided.dragHandleProps}
                    className="bg-gray-800 text-white p-1 rounded text-xs hover:bg-gray-700"
                    title="Drag to reorder"
                  >
                    ⋮⋮
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateComponent(component.id)
                    }}
                    className="bg-blue-600 text-white p-1 rounded text-xs hover:bg-blue-700"
                    title="Duplicate"
                  >
                    📋
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteComponent(component.id)
                    }}
                    className="bg-red-600 text-white p-1 rounded text-xs hover:bg-red-700"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}

            {/* Component Content */}
            <div className="min-h-[100px] border-2 border-dashed border-transparent hover:border-gray-300 transition-colors">
              <ComponentRenderer component={component} />
            </div>
          </div>
        )}
      </Draggable>
    )
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Left Sidebar */}
      {!isPreviewMode && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSidebarTab('components')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  sidebarTab === 'components'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🧩 Components
              </button>
              <button
                onClick={() => setSidebarTab('settings')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  sidebarTab === 'settings'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ⚙️ Settings
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            {sidebarTab === 'components' && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="component-library" isDropDisabled>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Drag components to add them</h3>
                      <div className="space-y-2">
                        {componentLibrary.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 cursor-grab ${
                                  snapshot.isDragging ? 'shadow-lg scale-105 rotate-3' : ''
                                } transition-all duration-200`}
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl">{item.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            {sidebarTab === 'settings' && (
              <div className="p-4">
                {selectedComponent ? (
                  <ComponentSettings
                    component={pageComponents.find(c => c.id === selectedComponent)!}
                    onUpdateContent={updateComponentContent}
                    onUpdateStyles={updateComponentStyles}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3 opacity-30">⚙️</div>
                    <p className="text-gray-500">Select a component to edit its settings</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="font-medium text-gray-900">
              Editing: {templateId === 'new' ? 'New Page' : `Template ${templateId}`}
            </h1>
            <div className="text-sm text-gray-500">
              {pageComponents.length} component{pageComponents.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isPreviewMode
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isPreviewMode ? '✏️ Edit Mode' : '👁️ Preview'}
            </button>
            <Button className="bg-green-600 hover:bg-green-700">
              💾 Save Page
            </Button>
            <Button variant="outline">
              🚀 Publish
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-6xl mx-auto py-8">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden min-h-[800px]">
              {pageComponents.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4 opacity-30">🎨</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Start Building Your Page</h3>
                    <p className="text-gray-600 mb-6">
                      Drag components from the sidebar to start building your page
                    </p>
                  </div>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="page-canvas">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {pageComponents.map((component, index) => 
                          renderComponent(component, index)
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component Renderer
function ComponentRenderer({ component }: { component: PageComponent }) {
  const { type, content, styles } = component

  const baseStyle = {
    ...styles,
    minHeight: '100px'
  }

  switch (type) {
    case 'hero':
      return (
        <div style={baseStyle} className="flex items-center justify-center text-center relative">
          <div className="z-10">
            <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
            <p className="text-xl mb-6 opacity-80">{content.subtitle}</p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
              {content.buttonText}
            </button>
          </div>
        </div>
      )

    case 'featured-grid':
      return (
        <div style={baseStyle} className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">{content.title}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {content.items?.map((item: any, index: number) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-4xl">🎂</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-2">{item.name}</h3>
                  <p className="text-gray-600 font-medium">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'testimonials':
      return (
        <div style={baseStyle} className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">{content.title}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {content.testimonials?.map((testimonial: any, index: number) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                    👤
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <div className="text-yellow-500">{'⭐'.repeat(testimonial.rating)}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      )

    case 'about':
      return (
        <div style={baseStyle} className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">{content.title}</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">{content.text}</p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                {content.buttonText}
              </button>
            </div>
            <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-4xl">👋</span>
            </div>
          </div>
        </div>
      )

    case 'contact':
      return (
        <div style={baseStyle} className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">{content.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl mb-2">📞</div>
              <h3 className="font-bold mb-2">Phone</h3>
              <p className="text-gray-600">{content.phone}</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">📧</div>
              <h3 className="font-bold mb-2">Email</h3>
              <p className="text-gray-600">{content.email}</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">📍</div>
              <h3 className="font-bold mb-2">Address</h3>
              <p className="text-gray-600">{content.address}</p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-2">🕒</div>
              <h3 className="font-bold mb-2">Hours</h3>
              <p className="text-gray-600">{content.hours}</p>
            </div>
          </div>
        </div>
      )

    case 'gallery':
      return (
        <div style={baseStyle} className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">{content.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {content.images?.map((image: string, index: number) => (
              <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🖼️</span>
              </div>
            ))}
          </div>
        </div>
      )

    case 'cta':
      return (
        <div style={{...baseStyle, backgroundColor: content.backgroundColor}} className="text-center">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-4">{content.title}</h2>
            <p className="text-xl mb-8 opacity-90">{content.subtitle}</p>
            <button className="bg-white text-gray-800 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 text-lg">
              {content.buttonText}
            </button>
          </div>
        </div>
      )

    case 'text':
      return (
        <div style={baseStyle} className="container mx-auto px-6">
          <div 
            className="prose max-w-none" 
            dangerouslySetInnerHTML={{ __html: content.html }}
          />
        </div>
      )

    default:
      return (
        <div style={baseStyle} className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">{component.icon}</div>
            <p className="text-gray-600">{component.name}</p>
          </div>
        </div>
      )
  }
}

// Component Settings Panel
function ComponentSettings({ 
  component, 
  onUpdateContent, 
  onUpdateStyles 
}: { 
  component: PageComponent
  onUpdateContent: (id: string, content: any) => void
  onUpdateStyles: (id: string, styles: any) => void
}) {
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content')

  return (
    <div>
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-2xl">{component.icon}</span>
        <h3 className="font-medium text-gray-900">{component.name}</h3>
      </div>

      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'content'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Content
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'style'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Style
        </button>
      </div>

      {activeTab === 'content' && (
        <ContentEditor 
          component={component} 
          onUpdate={(content) => onUpdateContent(component.id, content)} 
        />
      )}

      {activeTab === 'style' && (
        <StyleEditor 
          component={component} 
          onUpdate={(styles) => onUpdateStyles(component.id, styles)} 
        />
      )}
    </div>
  )
}

// Content Editor
function ContentEditor({ 
  component, 
  onUpdate 
}: { 
  component: PageComponent
  onUpdate: (content: any) => void 
}) {
  const { content } = component

  const handleChange = (key: string, value: any) => {
    onUpdate({ [key]: value })
  }

  return (
    <div className="space-y-4">
      {/* Generic text fields */}
      {typeof content.title === 'string' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={content.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {typeof content.subtitle === 'string' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
          <textarea
            value={content.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {typeof content.text === 'string' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Text Content</label>
          <textarea
            value={content.text}
            onChange={(e) => handleChange('text', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {typeof content.buttonText === 'string' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
          <input
            type="text"
            value={content.buttonText}
            onChange={(e) => handleChange('buttonText', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
    </div>
  )
}

// Style Editor
function StyleEditor({ 
  component, 
  onUpdate 
}: { 
  component: PageComponent
  onUpdate: (styles: any) => void 
}) {
  const { styles } = component

  const handleChange = (key: string, value: any) => {
    onUpdate({ [key]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
        <input
          type="color"
          value={styles.backgroundColor || '#ffffff'}
          onChange={(e) => handleChange('backgroundColor', e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
        <input
          type="text"
          value={styles.padding || '40px 0'}
          onChange={(e) => handleChange('padding', e.target.value)}
          placeholder="e.g., 40px 0"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Text Alignment</label>
        <select
          value={styles.textAlign || 'left'}
          onChange={(e) => handleChange('textAlign', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  )
}