'use client'

import { useState } from 'react'
import { 
  useCopilotAction, 
  useCopilotReadable,
  useCopilotAdditionalInstructions
} from "@copilotkit/react-core"
import { CopilotPopup } from "@copilotkit/react-ui"
import { useUser } from '@clerk/nextjs'
import { generateCakeImages, type ImageStyle } from '@/lib/image-generation'
import type { CakeConfig } from '@/types/database'

interface CakeDesignAssistantProps {
  onCakeUpdate?: (cakeConfig: Partial<CakeConfig>) => void
  onPriceUpdate?: (price: number) => void
  onPreviewGenerated?: (preview: string) => void
}

export function CakeDesignAssistant({ 
  onCakeUpdate, 
  onPriceUpdate, 
  onPreviewGenerated 
}: CakeDesignAssistantProps) {
  const { user } = useUser()
  const [currentCakeConfig, setCurrentCakeConfig] = useState<Partial<CakeConfig>>({})
  const [designStep, setDesignStep] = useState<string>('welcome')
  const [totalPrice, setTotalPrice] = useState<number>(0)

  // Add AI instructions for Destiny's personality
  useCopilotAdditionalInstructions({
    instructions: `You are Destiny, the AI design assistant for Destiny Bakes in Chirundu, Zambia. 
        You're warm, enthusiastic, and passionate about creating beautiful cakes that express love and celebration.
        
        Your personality:
        - Warm and conversational, like talking to a dear friend
        - Passionate about cake as a form of artistic expression and love
        - Expert knowledge of all available flavors, sizes, and designs
        - Always explain your reasoning behind recommendations
        - Use emojis naturally (🎂✨💕🎉) but not excessively
        - Reference local Zambian context when appropriate
        
        Available options:
        - Flavors: Vanilla, Strawberry, Chocolate, Choco-mint, Mint, Banana, Fruit
        - Sizes: 4" (2-4 people), 6" (6-8 people), 8" (10-12 people), 10" (15-20 people)
        - Shapes: Round, Square, Heart
        - Layers: 1-3 combinations for texture and flavor variety
        - Tiers: 1-3 levels for dramatic presentation
        
        Special capability: I can generate realistic AI images of cakes using advanced xAI technology!
        Once a customer has chosen their basic design (flavor, size, shape), I can create beautiful visual previews.`
  })

  // Make current cake design readable to AI
  useCopilotReadable({
    description: "Current cake design configuration and customer context",
    value: {
      customerName: user?.firstName || 'Customer',
      currentDesign: currentCakeConfig,
      designStep,
      totalPrice,
      location: "Chirundu, Zambia",
      availableFlavors: ["Vanilla", "Strawberry", "Chocolate", "Choco-mint", "Mint", "Banana", "Fruit"],
      availableSizes: ["4\"", "6\"", "8\"", "10\""],
      availableShapes: ["Round", "Square", "Heart"]
    }
  })

  // Flavor selection action
  useCopilotAction({
    name: "selectCakeFlavor",
    description: "Process customer's cake flavor selection with reasoning",
    parameters: [
      {
        name: "flavor",
        type: "string",
        enum: ["Vanilla", "Strawberry", "Chocolate", "Choco-mint", "Mint", "Banana", "Fruit"],
        description: "Selected cake flavor"
      },
      {
        name: "occasion",
        type: "string",
        description: "The occasion for the cake"
      },
      {
        name: "reasoning",
        type: "string",
        description: "Why this flavor is perfect for the occasion"
      }
    ],
    handler: async ({ flavor, occasion, reasoning }) => {
      const updatedConfig = { 
        ...currentCakeConfig, 
        flavor: flavor as CakeConfig['flavor'],
        occasion 
      }
      
      setCurrentCakeConfig(updatedConfig)
      setDesignStep('size_and_shape')
      onCakeUpdate?.(updatedConfig)

      return `Perfect choice! ${flavor} is an excellent selection for ${occasion}. ${reasoning} 

Now let's choose the perfect size and shape for your cake. How many people will you be serving?`
    }
  })

  // Size and shape selection action
  useCopilotAction({
    name: "selectCakeSize",
    description: "Process cake size and shape selection based on guest count",
    parameters: [
      {
        name: "size",
        type: "string",
        enum: ["4\"", "6\"", "8\"", "10\""],
        description: "Cake size in inches"
      },
      {
        name: "shape",
        type: "string",
        enum: ["Round", "Square", "Heart"],
        description: "Cake shape"
      },
      {
        name: "guestCount",
        type: "number",
        description: "Number of guests to serve"
      }
    ],
    handler: async ({ size, shape, guestCount }) => {
      const updatedConfig = {
        ...currentCakeConfig,
        size: size as CakeConfig['size'],
        shape: shape as CakeConfig['shape'],
        servings: guestCount
      }

      setCurrentCakeConfig(updatedConfig)
      setDesignStep('layers_and_tiers')
      onCakeUpdate?.(updatedConfig)

      const servingGuide = {
        "4\"": "2-4 people",
        "6\"": "6-8 people", 
        "8\"": "10-12 people",
        "10\"": "15-20 people"
      }

      return `Excellent! A ${size} ${shape} cake will perfectly serve ${servingGuide[size as keyof typeof servingGuide]}. 

Now let's design the structure of your cake. How many layers and tiers would you like?`
    }
  })

  // Structure design action
  useCopilotAction({
    name: "designCakeStructure",
    description: "Set the number of layers and tiers for the cake",
    parameters: [
      {
        name: "layers",
        type: "number",
        enum: [1, 2, 3],
        description: "Number of cake layers"
      },
      {
        name: "tiers",
        type: "number",
        enum: [1, 2, 3], 
        description: "Number of cake tiers"
      }
    ],
    handler: async ({ layers, tiers }) => {
      const updatedConfig = {
        ...currentCakeConfig,
        layers: layers as CakeConfig['layers'],
        tiers: tiers as CakeConfig['tiers']
      }

      setCurrentCakeConfig(updatedConfig)
      setDesignStep('pricing')
      onCakeUpdate?.(updatedConfig)

      return `Wonderful! ${layers} layers with ${tiers} tier(s) will create a beautiful and impressive cake structure. 

Let me calculate the pricing for your custom design...`
    }
  })

  // Price calculation action
  useCopilotAction({
    name: "calculateCakePrice",
    description: "Calculate the total price for the custom cake design",
    parameters: [
      {
        name: "cakeSpecs",
        type: "object",
        description: "Complete cake specifications"
      }
    ],
    handler: async ({ cakeSpecs }: { cakeSpecs: Partial<CakeConfig> }) => {
      // Pricing logic
      const basePrices = {
        "4\"": 45,
        "6\"": 65,
        "8\"": 85,
        "10\"": 120
      }
      
      const flavorMultipliers = {
        "Vanilla": 1.0,
        "Strawberry": 1.1,
        "Chocolate": 1.1,
        "Choco-mint": 1.2,
        "Mint": 1.1,
        "Banana": 1.1,
        "Fruit": 1.3
      }

      const size = cakeSpecs.size as keyof typeof basePrices
      const flavor = cakeSpecs.flavor as keyof typeof flavorMultipliers
      
      let basePrice = basePrices[size] || 65
      let flavorMultiplier = flavorMultipliers[flavor] || 1.0
      let layerMultiplier = (cakeSpecs.layers || 1) > 1 ? 1.2 : 1.0
      let tierMultiplier = (cakeSpecs.tiers || 1) > 1 ? 1.3 : 1.0
      
      const total = Math.round(basePrice * flavorMultiplier * layerMultiplier * tierMultiplier)
      
      setTotalPrice(total)
      setDesignStep('preview')
      onPriceUpdate?.(total)

      return `🎂 **Your Custom Cake Pricing** 🎂

**Base Price:** K${basePrice} (${size} ${cakeSpecs.shape} cake)
**Flavor Premium:** ${flavor} (+${Math.round((flavorMultiplier - 1) * 100)}%)
**Layer Addition:** ${cakeSpecs.layers || 1} layers (+${Math.round((layerMultiplier - 1) * 100)}%)
**Tier Addition:** ${cakeSpecs.tiers || 1} tiers (+${Math.round((tierMultiplier - 1) * 100)}%)

**Total Price: K${total}** 💕

Would you like me to generate a preview of your beautiful cake design?`
    }
  })

  // Preview generation action  
  useCopilotAction({
    name: "generateCakePreview",
    description: "Generate a detailed preview description of the cake design",
    parameters: [
      {
        name: "cakeSpecs",
        type: "object", 
        description: "Complete cake specifications"
      }
    ],
    handler: async ({ cakeSpecs }: { cakeSpecs: Partial<CakeConfig> }) => {
      const descriptions = {
        "Vanilla": "classic vanilla sponge with silky buttercream frosting",
        "Strawberry": "light vanilla base with fresh strawberry filling and cream cheese frosting", 
        "Chocolate": "rich chocolate sponge with decadent chocolate ganache",
        "Choco-mint": "chocolate base with refreshing mint buttercream and chocolate shavings",
        "Mint": "delicate mint-flavored sponge with light mint frosting",
        "Banana": "moist banana cake with caramel buttercream",
        "Fruit": "mixed fruit medley cake with citrus cream frosting"
      }

      const shapeDescriptions = {
        "Round": "beautifully round",
        "Square": "elegantly square",
        "Heart": "romantically heart-shaped"
      }

      const flavor = cakeSpecs.flavor as keyof typeof descriptions
      const shape = cakeSpecs.shape as keyof typeof shapeDescriptions
      
      const preview = `✨ **Your Dream Cake Preview** ✨

Imagine a ${shapeDescriptions[shape]} ${cakeSpecs.size} masterpiece featuring ${descriptions[flavor]}. With ${cakeSpecs.layers || 1} delicious layer(s) and ${cakeSpecs.tiers || 1} stunning tier(s), this creation will be the centerpiece of your ${cakeSpecs.occasion || 'celebration'}.

Every bite will be a perfect blend of flavor and artistry, crafted with love at Destiny Bakes in Chirundu. This cake will serve ${cakeSpecs.servings || 'your guests'} with generous portions of joy and sweetness.

**Ready to place your order for K${totalPrice}?** 🎉`

      setDesignStep('complete')
      onPreviewGenerated?.(preview)

      return preview
    }
  })

  // AI-powered image generation action
  useCopilotAction({
    name: "generateCakeImages",
    description: "Generate realistic AI images of the designed cake using xAI's Grok-2-image model",
    parameters: [
      {
        name: "style",
        type: "string",
        enum: ["classic", "modern", "rustic", "elegant"],
        description: "The visual style for the cake images"
      }
    ],
    handler: async ({ style }: { style: ImageStyle }) => {
      if (!currentCakeConfig.flavor || !currentCakeConfig.size || !currentCakeConfig.shape) {
        return "Please complete your cake design (flavor, size, and shape) before I can generate images for you! 🎨"
      }

      try {
        const result = await generateCakeImages(currentCakeConfig, style)
        
        if (result.success && result.images.length > 0) {
          // Call the preview callback if provided
          onPreviewGenerated?.(
            `🎨 **AI-Generated Cake Images** 🎨\n\nI've created ${result.images.length} beautiful ${style} style images of your ${currentCakeConfig.flavor} cake! Each image shows a different artistic interpretation of your design.\n\nYou can view these images in the preview gallery below the chat. Click on any image to select it for your order!\n\nYour cake will look absolutely stunning! ✨`
          )

          return `🎨 **Amazing! I've generated ${result.images.length} gorgeous ${style} style images of your ${currentCakeConfig.flavor} cake!** ✨

Each image shows your ${currentCakeConfig.size} ${currentCakeConfig.shape} cake with ${currentCakeConfig.layers} layer(s) and ${currentCakeConfig.tiers} tier(s) in beautiful detail.

You can see these images in the preview gallery below our chat. Each one captures the essence of your perfect ${currentCakeConfig.occasion || 'celebration'} cake!

Click on any image you love to select it for your order. Your cake will be crafted to match that beautiful vision! 🎂💕`
        } else {
          return `I apologize, but I encountered an issue generating your cake images. ${result.error || 'Please try again in a moment.'} 

Don't worry - I can still help you finalize your beautiful cake design with a detailed description! 💕`
        }
      } catch (error) {
        console.error('Error in generateCakeImages action:', error)
        return "I'm having trouble generating your cake images right now, but don't worry! I can still help you complete your perfect cake design with a beautiful description. Let's continue! 🎂✨"
      }
    }
  })

  return (
    <CopilotPopup
      labels={{
        title: "🎂 Chat with Destiny - Your AI Cake Designer",
        initial: `Hello ${user?.firstName || 'there'}! I'm Destiny, your personal AI cake design assistant! ✨

I'm here to help you create the perfect cake for your special occasion. Whether it's a birthday, wedding, anniversary, or any celebration, we'll design something truly magical together.

What's the special occasion we're celebrating today? 🎉`
      }}
      
      defaultOpen={false}
      clickOutsideToClose={true}
      shortcut="d"
    />
  )
}