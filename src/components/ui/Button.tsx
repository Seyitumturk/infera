"use client";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const styles = cva(
  "inline-flex items-center justify-center rounded-lg border transition-all duration-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-accent text-white border-accent hover:shadow-elevation1 hover:-translate-y-0.5 active:translate-y-0",
        secondary: "bg-accent2 text-white border-accent2 hover:shadow-elevation1 hover:-translate-y-0.5 active:translate-y-0",
        ghost: "bg-transparent text-text border-border hover:bg-surface/60 hover:shadow-ambient",
        glass: "bg-glass border-glassBorder backdrop-blur-glass backdrop-saturate-glass hover:shadow-elevation2",
        outline: "bg-transparent text-text border-border hover:bg-surface hover:border-accent",
        danger: "bg-danger text-white border-danger hover:shadow-elevation1 hover:-translate-y-0.5 active:translate-y-0"
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-10 px-4 text-base",
        lg: "h-11 px-6 text-lg",
        xl: "h-12 px-8 text-lg"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "glass" | "outline" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(styles({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;