import type { CakeConfig } from '@/types/database'

export interface CakeImagePreview {
  id: string
  url: string
  revisedPrompt: string
  style: string
  generated_at: string
}

export interface ImageGenerationResponse {
  success: boolean
  images: CakeImagePreview[]
  specs: Partial<CakeConfig>
  error?: string
}

export async function generateCakeImages(
  cakeSpecs: Partial<CakeConfig>, 
  style: 'classic' | 'modern' | 'rustic' | 'elegant' = 'classic'
): Promise<ImageGenerationResponse> {
  try {
    const response = await fetch('/api/generate-cake-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cakeSpecs,
        style
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate images')
    }

    return data
  } catch (error) {
    console.error('Error generating cake images:', error)
    return {
      success: false,
      images: [],
      specs: cakeSpecs,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export function getCakeImagePrompt(cakeSpecs: Partial<CakeConfig>): string {
  const {
    flavor,
    size,
    shape,
    layers,
    tiers,
    occasion,
    customization
  } = cakeSpecs

  let description = `A beautiful ${shape} ${size} ${flavor} cake`

  if (layers && layers > 1) {
    description += ` with ${layers} layers`
  }

  if (tiers && tiers > 1) {
    description += ` in ${tiers} tiers`
  }

  if (occasion) {
    description += ` for a ${occasion}`
  }

  if (customization?.message) {
    description += ` with text decoration`
  }

  if (customization?.colors && customization.colors.length > 0) {
    description += ` in ${customization.colors.join(' and ')} colors`
  }

  return description
}

export const IMAGE_STYLES = {
  classic: {
    name: 'Classic',
    description: 'Traditional bakery style with clean presentation',
    prompt: 'professional food photography, elegant presentation, clean background'
  },
  modern: {
    name: 'Modern',
    description: 'Contemporary design with artistic flair',
    prompt: 'contemporary design, artistic plating, modern aesthetic, minimalist background'
  },
  rustic: {
    name: 'Rustic',
    description: 'Homestyle charm with natural elements',
    prompt: 'homestyle, rustic charm, natural lighting, wooden background'
  },
  elegant: {
    name: 'Elegant',
    description: 'Luxury presentation for special occasions',
    prompt: 'luxury presentation, sophisticated styling, premium lighting, marble background'
  }
} as const

export type ImageStyle = keyof typeof IMAGE_STYLES