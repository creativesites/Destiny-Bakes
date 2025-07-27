'use client'

import { useEffect, useState } from 'react'
import { CakeConfig } from '@/types/database'

interface CakeVisualizerProps {
  cakeConfig: Partial<CakeConfig>
}

const flavorColors = {
  Vanilla: { base: '#f0e4d0', icing: '#f8f0e0' },
  Chocolate: { base: '#553c13', icing: '#6b4e1a' },
  Strawberry: { base: '#ff9999', icing: '#ffd1d1' },
  'Choco-mint': { base: '#3c2f2f', icing: '#98ff98' },
  Mint: { base: '#98ff98', icing: '#c1ffc1' },
  Banana: { base: '#ffe135', icing: '#fff7a3' },
  Fruit: { base: '#ffcc99', icing: '#ffe6cc' },
}

export function CakeVisualizer({ cakeConfig }: CakeVisualizerProps) {
  const [dynamicStyles, setDynamicStyles] = useState({})

  useEffect(() => {
    // Use Vanilla as default if flavor is undefined or invalid
    const flavor = cakeConfig.flavor && flavorColors[cakeConfig.flavor as keyof typeof flavorColors]
      ? cakeConfig.flavor
      : 'Vanilla'
    const colors = flavorColors[flavor as keyof typeof flavorColors]
    const layerCount = cakeConfig.layers || 1
    const tierCount = cakeConfig.tiers || 1

    // Calculate dynamic layer heights and offsets based on configuration
    const layerHeight = 100 / layerCount
    const tierScale = tierCount > 1 ? 0.8 : 1
    const layerStyles = Array.from({ length: layerCount }, (_, index) => ({
      top: `${index * (layerHeight / 3)}px`,
      height: `${layerHeight}px`,
      transform: tierCount > 1 ? `scale(${1 - (index * 0.1 * tierCount)})` : 'scale(1)',
    }))

    setDynamicStyles({
      layerStyles,
      cakeColors: colors,
      cakeWidth: tierCount > 1 ? '200px' : '250px',
    })
  }, [cakeConfig])

  // Don't render if flavor is not set
  if (!cakeConfig.flavor || !flavorColors[cakeConfig.flavor as keyof typeof flavorColors]) {
    return <div className="text-center text-gray-600">Select a flavor to see the cake preview</div>
  }

  return (
    <div className="flex justify-center items-center bg-gray-800 p-4 rounded-lg">
      <div 
        className="relative w-[250px] h-[200px]"
        style={{ width: (dynamicStyles as any).cakeWidth }}
      >
        {/* Plate */}
        <div className="absolute bottom-[-10px] left-[-10px] w-[270px] h-[110px] bg-gray-300 rounded-full shadow-[0_2px_0_rgba(128,128,128,0.7),0_4px_0_rgba(128,128,128,0.7),0_5px_40px_rgba(0,0,0,0.5)]"></div>

        {/* Cake Layers */}
        {Array.from({ length: cakeConfig.layers || 1 }).map((_, index) => (
          <div
            key={`layer-${index}`}
            className="absolute w-full rounded-full"
            style={{
              ...(dynamicStyles as any).layerStyles?.[index],
              backgroundColor: (dynamicStyles as any).cakeColors?.base,
              boxShadow: `
                0 2px 0 ${lightenColor((dynamicStyles as any).cakeColors?.base, 5)},
                0 4px 0 ${darkenColor((dynamicStyles as any).cakeColors?.base, 8.2)},
                0 6px 0 ${darkenColor((dynamicStyles as any).cakeColors?.base, 8.4)},
                0 8px 0 ${darkenColor((dynamicStyles as any).cakeColors?.base, 8.6)},
                0 10px 0 ${darkenColor((dynamicStyles as any).cakeColors?.base, 8.8)},
                0 12px 0 ${darkenColor((dynamicStyles as any).cakeColors?.base, 9)}
              `,
            }}
          ></div>
        ))}

        {/* Icing */}
        <div 
          className="absolute top-[2px] left-[5px] w-[240px] h-[90px] rounded-full"
          style={{ backgroundColor: (dynamicStyles as any).cakeColors?.icing }}
        >
          <div 
            className="absolute top-[4px] right-[5px] bottom-[6px] left-[5px] rounded-full"
            style={{
              backgroundColor: lightenColor((dynamicStyles as any).cakeColors?.icing, 3),
              boxShadow: `0 0 4px ${lightenColor((dynamicStyles as any).cakeColors?.icing, 5)}`,
            }}
          ></div>
        </div>

        {/* Drips */}
        <div className="absolute top-[53px] left-[5px] w-[40px] h-[48px] rounded-b-[25px] transform skew-y-[15deg]" style={{ backgroundColor: (dynamicStyles as any).cakeColors?.icing }}></div>
        <div className="absolute top-[69px] left-[181px] w-[50px] h-[60px] rounded-b-[25px] transform -skew-y-[15deg]" style={{ backgroundColor: (dynamicStyles as any).cakeColors?.icing }}></div>
        <div className="absolute top-[54px] left-[90px] w-[80px] h-[60px] rounded-b-[40px]" style={{ backgroundColor: (dynamicStyles as any).cakeColors?.icing }}></div>

        {/* Candle */}
        <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-4 h-[50px] bg-red-900 rounded-[8px/4px] z-10">
          <div className="absolute top-0 left-0 w-4 h-2 rounded-full bg-red-800"></div>
          <div 
            className="absolute top-[-34px] left-1/2 -translate-x-1/2 w-[15px] h-[35px] bg-orange-500 rounded-[10px/25px] z-10 animate-flicker"
            style={{
              boxShadow: `
                0 0 10px rgba(255,165,0,0.5),
                0 0 20px rgba(255,165,0,0.5),
                0 0 60px rgba(255,165,0,0.5),
                0 0 80px rgba(255,165,0,0.5)
              `,
            }}
          ></div>
        </div>

        {/* Custom Message */}
        {cakeConfig.customization?.message && (
          <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 text-sm text-red-900 font-bold text-center z-20">
            {cakeConfig.customization.message}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes flicker {
          0% {
            transform: skewX(5deg);
            box-shadow: 
              0 0 10px rgba(255,165,0,0.2),
              0 0 20px rgba(255,165,0,0.2),
              0 0 60px rgba(255,165,0,0.2),
              0 0 80px rgba(255,165,0,0.2);
          }
          25% {
            transform: skewX(-5deg);
            box-shadow: 
              0 0 10px rgba(255,165,0,0.5),
              0 0 20px rgba(255,165,0,0.5),
              0 0 60px rgba(255,165,0,0.5),
              0 0 80px rgba(255,165,0,0.5);
          }
          50% {
            transform: skewX(10deg);
            box-shadow: 
              0 0 10px rgba(255,165,0,0.3),
              0 0 20px rgba(255,165,0,0.3),
              0 0 60px rgba(255,165,0,0.3),
              0 0 80px rgba(255,165,0,0.3);
          }
          75% {
            transform: skewX(-10deg);
            box-shadow: 
              0 0 10px rgba(255,165,0,0.4),
              0 0 20px rgba(255,165,0,0.4),
              0 0 60px rgba(255,165,0,0.4),
              0 0 80px rgba(255,165,0,0.4);
          }
          100% {
            transform: skewX(5deg);
            box-shadow: 
              0 0 10px rgba(255,165,0,0.5),
              0 0 20px rgba(255,165,0,0.5),
              0 0 60px rgba(255,165,0,0.5),
              0 0 80px rgba(255,165,0,0.5);
          }
        }
      `}</style>
    </div>
  )
}

// Helper functions for color manipulation
function lightenColor(color: string, percent: number): string {
  if (!color) return '#ffffff' // Fallback to white if color is undefined
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`
}

function darkenColor(color: string, percent: number): string {
  if (!color) return '#000000' // Fallback to black if color is undefined
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) - amt
  const G = ((num >> 8) & 0x00ff) - amt
  const B = (num & 0x0000ff) - amt
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`
}