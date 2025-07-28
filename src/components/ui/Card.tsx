'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
  interactive?: boolean;
  variant?: 'default' | 'subtle' | 'elevated';
  bgColor?: string;
}

export function Card({ 
  className, 
  children, 
  elevated = false, 
  interactive = false,
  variant = 'default',
  bgColor,
  ...props 
}: CardProps) {
  const baseStyles = "rounded-xl backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 relative overflow-hidden";
  
  const borderStyles = "border border-white/10"; // Smaller border
  
  const shadowStyles = {
    default: "shadow-2xl",
    subtle: "shadow-lg",
    elevated: "shadow-2xl hover:shadow-[0_25px_80px_rgba(0,0,0,0.4)] hover:-translate-y-1"
  };

  const interactiveStyles = interactive 
    ? "hover:border-white/30 hover:bg-black/60 cursor-pointer group" 
    : "";

  const elevatedStyles = elevated && variant === 'default'
    ? "shadow-2xl hover:shadow-[0_25px_80px_rgba(0,0,0,0.4)] hover:-translate-y-1"
    : "";

  return (
    <div
      className={cn(
        baseStyles,
        borderStyles,
        shadowStyles[variant],
        elevatedStyles,
        interactiveStyles,
        "!p-6", // FORCE PADDING WITH !important TO OVERRIDE CSS RESET
        className
      )}
      style={{
        backgroundColor: bgColor || 'rgba(0, 0, 0, 0.4)',
        ...props.style
      }}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3 className={cn("text-base font-semibold leading-tight tracking-tight text-white", className)} {...props}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <p className={cn("text-sm text-gray-300 leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

 