'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevated?: boolean;
  interactive?: boolean;
  variant?: 'default' | 'glass' | 'elevated';
  glass?: boolean;
}

export function Card({ 
  className, 
  children, 
  elevated = false, 
  interactive = false,
  variant = 'default',
  glass = false,
  ...props 
}: CardProps) {
  const baseStyles = "rounded-lg transition-all duration-smooth relative overflow-hidden";
  
  const backgroundStyles = glass || variant === 'glass'
    ? "bg-glass border-glassBorder backdrop-blur-glass backdrop-saturate-glass"
    : "bg-surface border-border";
  
  const shadowStyles = {
    default: "shadow-elevation1",
    glass: "shadow-elevation2",
    elevated: "shadow-elevation2 hover:shadow-elevation3 hover:-translate-y-1"
  };

  const interactiveStyles = interactive 
    ? "hover:border-accent/50 hover:bg-surface/80 cursor-pointer group" 
    : "";

  const elevatedStyles = elevated && variant === 'default'
    ? "shadow-elevation2 hover:shadow-elevation3 hover:-translate-y-1"
    : "";

  return (
    <div
      className={cn(
        baseStyles,
        backgroundStyles,
        shadowStyles[variant],
        elevatedStyles,
        interactiveStyles,
        "border p-6",
        className
      )}
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
    <h3 className={cn("text-lg font-semibold leading-tight tracking-tight text-text", className)} {...props}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn("pt-0", className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn("flex items-center pt-4", className)} {...props}>
      {children}
    </div>
  );
}

 