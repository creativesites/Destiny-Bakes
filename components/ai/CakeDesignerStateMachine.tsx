'use client'

import { useState } from 'react'
import { 
  useCopilotAction, 
  useCopilotReadable,
  useCopilotAdditionalInstructions
} from "@copilotkit/react-core"
import { useUser } from '@clerk/nextjs'
import type { CakeConfig } from '@/types/database'

interface CakeDesignerStateMachineProps {
  onCakeUpdate?: (cakeConfig: Partial<CakeConfig>) => void
  onPriceUpdate?: (price: number) => void
  onStageChange?: (stage: string) => void
}

export function CakeDesignerStateMachine({ 
  onCakeUpdate, 
  onPriceUpdate,
  onStageChange 
}: CakeDesignerStateMachineProps) {
  const { user } = useUser()
  const [stage, setStage] = useState<string>('welcome')
  const [cakeConfig, setCakeConfig] = useState<Partial<CakeConfig>>({})
  const [totalPrice, setTotalPrice] = useState<number>(0)

  // Update parent component when stage changes
  const updateStage = (newStage: string) => {
    setStage(newStage)
    onStageChange?.(newStage)
  }

  // Calculate price helper function
  const calculatePrice = (config: Partial<CakeConfig>) => {
    if (!config.size || !config.flavor) return 0
    
    const basePrices = { "4\"": 45, "6\"": 65, "8\"": 85, "10\"": 120 }
    const flavorMultipliers = {
      "Vanilla": 1.0, "Strawberry": 1.1, "Chocolate": 1.1,
      "Choco-mint": 1.2, "Mint": 1.1, "Banana": 1.1, "Fruit": 1.3
    }

    const basePrice = basePrices[config.size as keyof typeof basePrices] || 65
    const flavorMultiplier = flavorMultipliers[config.flavor as keyof typeof flavorMultipliers] || 1.0
    const layerMultiplier = (config.layers || 1) > 1 ? 1.2 : 1.0
    const tierMultiplier = (config.tiers || 1) > 1 ? 1.3 : 1.0
    
    return Math.round(basePrice * flavorMultiplier * layerMultiplier * tierMultiplier)
  }

  // Make current state readable to AI
  useCopilotReadable({
    description: "Current cake design state and customer information",
    value: {
      customerName: user?.firstName || 'Customer',
      currentStage: stage,
      cakeDesign: cakeConfig,
      estimatedPrice: totalPrice,
      location: "Chirundu, Zambia"
    }
  })

  // Welcome Stage
  useCopilotAdditionalInstructions({
    instructions: `CURRENT STAGE: Welcome & Occasion Discovery

You are starting the cake design process. Warmly greet the customer and ask about their special occasion.
Focus on understanding:
- What occasion they're celebrating
- When they need the cake
- Any initial preferences

Once you understand their occasion, call the 'proceedToFlavor' action to move to flavor selection.`,
    available: stage === 'welcome' ? 'enabled' : 'disabled'
  })

  useCopilotAction({
    name: "proceedToFlavor",
    description: "Move to flavor selection stage after understanding the customer's occasion",
    available: stage === 'welcome' ? 'enabled' : 'disabled',
    parameters: [
      {
        name: "occasion",
        type: "string",
        description: "The special occasion for the cake"
      }
    ],
    handler: async ({ occasion }) => {
      const updated = { ...cakeConfig, occasion }
      setCakeConfig(updated)
      onCakeUpdate?.(updated)
      updateStage('flavorSelection')
      
      return `Perfect! A ${occasion} deserves a truly special cake. Now let's choose the perfect flavor that will make this celebration unforgettable! 🎂`
    }
  })

  // Flavor Selection Stage
  useCopilotAdditionalInstructions({
    instructions: `CURRENT STAGE: Flavor Selection

Help the customer choose from our available flavors: Vanilla, Strawberry, Chocolate, Choco-mint, Mint, Banana, Fruit.

Consider their occasion and provide personalized recommendations. Explain why certain flavors work well for their celebration.

Once they choose a flavor, call the 'selectFlavorAndProceed' action.`,
    available: stage === 'flavorSelection' ? 'enabled' : 'disabled'
  })

  useCopilotAction({
    name: "selectFlavorAndProceed",
    description: "Select a cake flavor and proceed to size/shape selection",
    available: stage === 'flavorSelection' ? 'enabled' : 'disabled',
    parameters: [
      {
        name: "flavor",
        type: "string",
        enum: ["Vanilla", "Strawberry", "Chocolate", "Choco-mint", "Mint", "Banana", "Fruit"],
        description: "The selected cake flavor"
      },
      {
        name: "reasoning",
        type: "string",
        description: "Why this flavor is perfect for their occasion"
      }
    ],
    handler: async ({ flavor, reasoning }) => {
      const updated = { ...cakeConfig, flavor: flavor as CakeConfig['flavor'] }
      setCakeConfig(updated)
      onCakeUpdate?.(updated)
      updateStage('sizeAndShape')
      
      return `Excellent choice! ${flavor} is ${reasoning}. Now let's determine the perfect size for your celebration. How many people will be enjoying this delicious cake? 📏`
    }
  })

  // Size and Shape Selection Stage
  useCopilotAdditionalInstructions({
    instructions: `CURRENT STAGE: Size and Shape Selection

Help the customer choose the right size and shape:

Sizes available:
- 4" (serves 2-4 people) - K45 base
- 6" (serves 6-8 people) - K65 base  
- 8" (serves 10-12 people) - K85 base
- 10" (serves 15-20 people) - K120 base

Shapes available: Round, Square, Heart

Ask about guest count and recommend accordingly. Once decided, call 'selectSizeShapeAndProceed'.`,
    available: stage === 'sizeAndShape' ? 'enabled' : 'disabled'
  })

  useCopilotAction({
    name: "selectSizeShapeAndProceed",
    description: "Select cake size and shape, then proceed to structure design",
    available: stage === 'sizeAndShape' ? 'enabled' : 'disabled',
    parameters: [
      {
        name: "size",
        type: "string",
        enum: ["4\"", "6\"", "8\"", "10\""],
        description: "The cake size"
      },
      {
        name: "shape",
        type: "string",
        enum: ["Round", "Square", "Heart"],
        description: "The cake shape"
      },
      {
        name: "guestCount",
        type: "number",
        description: "Number of guests to serve"
      }
    ],
    handler: async ({ size, shape, guestCount }) => {
      const updated = { 
        ...cakeConfig, 
        size: size as CakeConfig['size'], 
        shape: shape as CakeConfig['shape'],
        servings: guestCount 
      }
      setCakeConfig(updated)
      onCakeUpdate?.(updated)
      
      const price = calculatePrice(updated)
      setTotalPrice(price)
      onPriceUpdate?.(price)
      
      updateStage('layersAndTiers')
      
      return `Perfect! A ${size} ${shape} cake will beautifully serve your ${guestCount} guests. Now let's add some height and drama with layers and tiers! 🏗️`
    }
  })

  // Layers and Tiers Stage
  useCopilotAdditionalInstructions({
    instructions: `CURRENT STAGE: Layers and Tiers Design

Help design the cake structure:

Layers (1-3): Different flavor combinations within the cake
- 1 layer: Classic simplicity
- 2 layers: Flavor variety 
- 3 layers: Maximum flavor experience

Tiers (1-3): Stacked cake levels for visual impact
- 1 tier: Elegant single level
- 2 tiers: Impressive height
- 3 tiers: Grand centerpiece

Recommend based on their occasion and guest count. Call 'selectStructureAndProceed' when decided.`,
    available: stage === 'layersAndTiers' ? 'enabled' : 'disabled'
  })

  useCopilotAction({
    name: "selectStructureAndProceed",
    description: "Select layers and tiers, then proceed to customization",
    available: stage === 'layersAndTiers' ? 'enabled' : 'disabled',
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
      const updated = { 
        ...cakeConfig, 
        layers: layers as CakeConfig['layers'], 
        tiers: tiers as CakeConfig['tiers'] 
      }
      setCakeConfig(updated)
      onCakeUpdate?.(updated)
      
      const price = calculatePrice(updated)
      setTotalPrice(price)
      onPriceUpdate?.(price)
      
      updateStage('customization')
      
      return `Wonderful! ${layers} layers with ${tiers} tier(s) will create a stunning masterpiece. Now let's add those special personal touches! ✨`
    }
  })

  // Customization Stage
  useCopilotAdditionalInstructions({
    instructions: `CURRENT STAGE: Customization & Personal Touches

Help the customer add personal touches:
- Special message for the cake
- Color preferences
- Decorative elements
- Dietary restrictions

Ask about what would make this cake truly special for their occasion. When ready, call 'finalizeDesignAndShowPreview'.`,
    available: stage === 'customization' ? 'enabled' : 'disabled'
  })

  useCopilotAction({
    name: "finalizeDesignAndShowPreview",
    description: "Finalize the cake design and show the beautiful preview",
    available: stage === 'customization' ? 'enabled' : 'disabled',
    parameters: [
      {
        name: "message",
        type: "string",
        description: "Special message for the cake",
        required: false
      },
      {
        name: "colors",
        type: "string",
        description: "Color preferences",
        required: false
      },
      {
        name: "decorations",
        type: "string",
        description: "Special decorations",
        required: false
      }
    ],
    handler: async ({ message, colors, decorations }) => {
      const customization = { message, colors: colors?.split(','), decorations: decorations?.split(',') }
      const updated = { ...cakeConfig, customization }
      setCakeConfig(updated)
      onCakeUpdate?.(updated)
      
      const finalPrice = calculatePrice(updated)
      setTotalPrice(finalPrice)
      onPriceUpdate?.(finalPrice)
      
      updateStage('preview')
      
      // Generate beautiful preview
      const descriptions = {
        "Vanilla": "classic vanilla sponge with silky buttercream",
        "Strawberry": "fresh strawberry with cream cheese frosting", 
        "Chocolate": "rich chocolate with decadent ganache",
        "Choco-mint": "chocolate with refreshing mint buttercream",
        "Mint": "delicate mint with light frosting",
        "Banana": "moist banana with caramel buttercream",
        "Fruit": "mixed fruit with citrus cream"
      }

      const flavor = updated.flavor as keyof typeof descriptions
      const preview = `🎂 **Your Dream Cake Preview** 🎂

**${updated.occasion} Masterpiece**
A stunning ${updated.shape} ${updated.size} cake featuring ${descriptions[flavor] || 'delicious flavor'}

**Structure:** ${updated.layers} layer(s), ${updated.tiers} tier(s)
**Serves:** ${updated.servings} guests perfectly
${message ? `**Message:** "${message}"` : ''}
${colors ? `**Colors:** ${colors}` : ''}
${decorations ? `**Decorations:** ${decorations}` : ''}

**Total Investment:** K${finalPrice}

This will be crafted with love at Destiny Bakes in Chirundu, using only the finest ingredients. Every detail will be perfect for your special ${updated.occasion}!

Ready to place your order? 🎉`

      return preview
    }
  })

  // Final Stage - Order Completion
  useCopilotAdditionalInstructions({
    instructions: `CURRENT STAGE: Order Completion

The customer has seen their beautiful cake preview. Help them finalize their order:
- Confirm delivery date and time
- Collect delivery address
- Explain next steps
- Express excitement about creating their cake

This is the final step before order placement!`,
    available: stage === 'preview' ? 'enabled' : 'disabled'
  })

  useCopilotAction({
    name: "proceedToOrderPlacement",
    description: "Proceed to final order placement",
    available: stage === 'preview' ? 'enabled' : 'disabled',
    parameters: [
      {
        name: "deliveryDate",
        type: "string",
        description: "Requested delivery date"
      },
      {
        name: "specialNotes",
        type: "string",
        description: "Any special delivery or preparation notes",
        required: false
      }
    ],
    handler: async ({ deliveryDate, specialNotes }) => {
      updateStage('orderComplete')
      
      return `🎉 **Order Ready for Placement!** 🎉

Your beautiful ${cakeConfig.flavor} cake for ${cakeConfig.occasion} is all designed and ready!

**Delivery Date:** ${deliveryDate}
**Total:** K${totalPrice}
${specialNotes ? `**Special Notes:** ${specialNotes}` : ''}

I'm so excited to create this masterpiece for you! Our bakers will put all their love and skill into making your ${cakeConfig.occasion} absolutely perfect.

Click the "Place Order" button to confirm, and we'll start baking magic! ✨`
    }
  })

  return null // This component only provides state machine logic
}