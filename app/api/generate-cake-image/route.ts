import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getCurrentUser } from '@/lib/auth-server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const xai = new OpenAI({
  apiKey: process.env.XAI_API_KEY!,
  baseURL: "https://api.x.ai/v1",
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { cakeSpecs, style, conversationId } = body

    if (!cakeSpecs) {
      return NextResponse.json({ error: 'Cake specifications required' }, { status: 400 })
    }

    // Create a hash of the specifications for smart reuse
    const specHash = crypto.createHash('md5').update(JSON.stringify({ cakeSpecs, style })).digest('hex')

    // Check if we already have previews for this exact configuration
    const { data: existingPreviews } = await supabase
      .from('cake_previews')
      .select('*')
      .eq('hash', specHash)
      .eq('status', 'approved')
      .limit(3)

    if (existingPreviews && existingPreviews.length > 0) {
      // Increment reuse count for existing previews
      for (const preview of existingPreviews) {
        await supabase
          .from('cake_previews')
          .update({ reuse_count: preview.reuse_count + 1 })
          .eq('id', preview.id)
      }

      // Return existing previews
      const imageData = existingPreviews.map((preview, index) => ({
        id: preview.id,
        url: preview.image_url,
        revisedPrompt: preview.ai_prompt,
        style: style || 'classic',
        generated_at: preview.generated_at,
        reused: true
      }))

      return NextResponse.json({
        success: true,
        images: imageData,
        specs: cakeSpecs,
        reused: true
      })
    }

    // Generate detailed cake description for the AI
    const prompt = generateCakePrompt(cakeSpecs, style)

    console.log('Generating cake image with prompt:', prompt)

    // Generate multiple cake preview images
    const response = await xai.images.generate({
      model: "grok-2-image",
      prompt: prompt,
      n: 3, // Generate 3 different previews
    })

    // Process and save the response
    const imageData = []
    
    for (let index = 0; index < (response.data?.length || 0); index++) {
      const image = response.data?.[index]
      if (!image?.url) continue

      try {
        // Download and store the image to Supabase Storage
        const imageResponse = await fetch(image.url)
        if (!imageResponse.ok) continue

        const imageBuffer = await imageResponse.arrayBuffer()
        const fileName = `cake-previews/${Date.now()}-${Math.random().toString(36).substring(7)}.png`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cake-images')
          .upload(fileName, imageBuffer, {
            contentType: 'image/png',
            cacheControl: '3600'
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('cake-images')
          .getPublicUrl(fileName)

        // Save preview to database
        const { data: previewData, error: previewError } = await supabase
          .from('cake_previews')
          .insert({
            conversation_id: conversationId,
            image_url: publicUrlData.publicUrl,
            storage_path: fileName,
            description: `${cakeSpecs.flavor} ${cakeSpecs.size} ${cakeSpecs.shape} cake`,
            specifications: { cakeSpecs, style },
            ai_prompt: prompt,
            hash: specHash,
            reuse_count: 1,
            status: 'approved' // Auto-approve generated images
          })
          .select()
          .single()

        if (!previewError && previewData) {
          imageData.push({
            id: previewData.id,
            url: previewData.image_url,
            revisedPrompt: (image as any).revised_prompt || prompt,
            style: style || 'classic',
            generated_at: previewData.generated_at,
            reused: false
          })
        }
      } catch (saveError) {
        console.error('Error saving image:', saveError)
        // Fallback to original URL if saving fails
        imageData.push({
          id: `preview-${index + 1}`,
          url: image.url || '',
          revisedPrompt: (image as any).revised_prompt || prompt,
          style: style || 'classic',
          generated_at: new Date().toISOString(),
          reused: false
        })
      }
    }

    return NextResponse.json({
      success: true,
      images: imageData,
      specs: cakeSpecs,
      reused: false
    })

  } catch (error) {
    console.error('Error generating cake image:', error)
    return NextResponse.json(
      { error: 'Failed to generate cake image' }, 
      { status: 500 }
    )
  }
}

function generateCakePrompt(cakeSpecs: any, style?: string): string {
  const {
    flavor,
    size,
    shape,
    layers,
    tiers,
    occasion,
    customization
  } = cakeSpecs

  // Base style descriptions
  const stylePrompts = {
    classic: "professional food photography, elegant presentation, clean background",
    modern: "contemporary design, artistic plating, modern aesthetic, minimalist background",
    rustic: "homestyle, rustic charm, natural lighting, wooden background",
    elegant: "luxury presentation, sophisticated styling, premium lighting, marble background"
  }

  const selectedStyle = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.classic

  // Flavor descriptions for visual appeal
  const flavorVisuals = {
    "Vanilla": "classic white vanilla cake with smooth vanilla buttercream frosting",
    "Strawberry": "pink-tinted cake with fresh strawberry pieces and cream cheese frosting",
    "Chocolate": "rich dark chocolate cake with glossy chocolate ganache",
    "Choco-mint": "chocolate cake with green mint frosting and chocolate shavings",
    "Mint": "light green mint cake with pale mint frosting",
    "Banana": "golden banana cake with caramel-colored buttercream",
    "Fruit": "colorful fruit cake with mixed berry decorations and light frosting"
  }

  // Shape descriptions
  const shapeDescriptions = {
    "Round": "perfectly round",
    "Square": "clean square shape with sharp edges",
    "Heart": "romantic heart-shaped"
  }

  // Build the prompt
  const shapeDesc = shapeDescriptions[shape as keyof typeof shapeDescriptions] || "beautifully shaped"
  const flavorDesc = flavorVisuals[flavor as keyof typeof flavorVisuals] || "delicious cake"
  
  let prompt = `A beautiful ${shapeDesc} ${size} ${flavorDesc} cake`

  // Add structure details
  if (layers > 1) {
    prompt += ` with ${layers} distinct layers visible`
  }

  if (tiers > 1) {
    prompt += ` arranged in ${tiers} elegant tiers`
  }

  // Add occasion-specific decorations
  if (occasion) {
    const occasionDecorations = {
      "birthday": "colorful birthday decorations, candles, festive elements",
      "wedding": "elegant white decorations, delicate flowers, romantic styling",
      "anniversary": "sophisticated decorations, gold accents, romantic elements",
      "graduation": "celebratory decorations, achievement theme, bright colors",
      "baby shower": "soft pastel decorations, cute baby-themed elements",
      "valentine": "romantic red and pink decorations, hearts, love theme"
    }

    const decorationType = occasionDecorations[occasion.toLowerCase() as keyof typeof occasionDecorations] 
      || "beautiful decorative elements appropriate for the celebration"

    prompt += ` decorated with ${decorationType}`
  }

  // Add customization details
  if (customization?.message) {
    prompt += ` featuring elegant text decoration`
  }

  if (customization?.colors && customization.colors.length > 0) {
    prompt += ` in beautiful ${customization.colors.join(' and ')} colors`
  }

  if (customization?.decorations && customization.decorations.length > 0) {
    prompt += ` with ${customization.decorations.join(', ')} decorative elements`
  }

  // Add professional photography elements
  prompt += `, ${selectedStyle}, high quality, appetizing, Instagram-worthy food photography, soft natural lighting`

  // Add Destiny Bakes branding context
  prompt += `, artisanal bakery quality, homemade with love, African bakery style`

  return prompt
}

// Alternative endpoint for base64 images if needed
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Use POST method to generate cake images',
    availableStyles: ['classic', 'modern', 'rustic', 'elegant']
  })
}