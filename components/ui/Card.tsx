import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'premium' | 'glass' | 'gradient' | 'floating'
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className,
  ...props
}) => {
  const variants = {
    default: 'bg-white border border-gray-200 shadow-md rounded-xl',
    premium: 'premium-card rounded-2xl shadow-2xl',
    glass: 'glass-card rounded-2xl',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-lg rounded-xl',
    floating: 'floating-card bg-white border border-gray-200 shadow-lg rounded-xl hover:shadow-2xl'
  }
  
  return (
    <div
      className={cn(variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('p-6 pb-4', className)} {...props}>
      {children}
    </div>
  )
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('p-6 pt-4', className)} {...props}>
      {children}
    </div>
  )
}