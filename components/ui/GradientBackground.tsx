'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface GradientBackgroundProps {
  variant?: 'aurora' | 'sunset' | 'ocean' | 'galaxy' | 'premium' | 'rose-gold' | 'magic' | 'cotton-candy' | 'dreamy' | 'mesh'
  children: React.ReactNode
  className?: string
  animated?: boolean
  overlay?: boolean
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  variant = 'premium',
  children,
  className,
  animated = true,
  overlay = false
}) => {
  const gradients = {
    aurora: 'bg-aurora',
    sunset: 'bg-sunset',
    ocean: 'bg-ocean',
    galaxy: 'bg-galaxy',
    premium: 'bg-premium-gradient',
    'rose-gold': 'bg-rose-gold',
    magic: 'bg-magic',
    'cotton-candy': 'bg-cotton-candy',
    dreamy: 'bg-dreamy',
    mesh: 'bg-premium-mesh'
  }

  return (
    <div 
      className={cn(
        'relative',
        gradients[variant],
        animated && 'bg-[length:400%_400%] animate-gradient-shift',
        className
      )}
    >
      {overlay && (
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

interface FloatingElementProps {
  children: React.ReactNode
  className?: string
  delay?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'pink' | 'purple' | 'blue' | 'emerald' | 'orange' | 'indigo'
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  className,
  delay = '0s',
  size = 'md',
  color = 'pink'
}) => {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  }

  const colors = {
    pink: 'from-pink-400 to-rose-500',
    purple: 'from-purple-400 to-indigo-500',
    blue: 'from-blue-400 to-indigo-500',
    emerald: 'from-emerald-400 to-green-500',
    orange: 'from-orange-400 to-yellow-500',
    indigo: 'from-indigo-400 to-purple-500'
  }

  return (
    <div 
      className={cn(
        'absolute rounded-full flex items-center justify-center animate-float shadow-2xl opacity-20',
        'bg-gradient-to-r',
        sizes[size],
        colors[color],
        className
      )}
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  )
}

interface SparkleEffectProps {
  children: React.ReactNode
  className?: string
  density?: 'low' | 'medium' | 'high'
}

export const SparkleEffect: React.FC<SparkleEffectProps> = ({
  children,
  className,
  density = 'medium'
}) => {
  const sparkleCount = {
    low: 3,
    medium: 5,
    high: 8
  }

  const generateSparkles = () => {
    const sparkles = []
    for (let i = 0; i < sparkleCount[density]; i++) {
      sparkles.push(
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full animate-pulse opacity-80"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${1 + Math.random() * 2}s`
          }}
        />
      )
    }
    return sparkles
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {generateSparkles()}
      {children}
    </div>
  )
}

interface AnimatedTextProps {
  children: React.ReactNode
  variant?: 'gradient' | 'shimmer' | 'glow'
  className?: string
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  variant = 'gradient',
  className
}) => {
  const variants = {
    gradient: 'premium-gradient-text',
    shimmer: 'shimmer-effect bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 bg-clip-text text-transparent',
    glow: 'text-white drop-shadow-2xl'
  }

  return (
    <span className={cn(variants[variant], className)}>
      {children}
    </span>
  )
}