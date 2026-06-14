import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium",
    "transition-all duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-page)]",
    "disabled:pointer-events-none disabled:opacity-40",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--color-accent-500)] text-white",
          "hover:bg-[var(--color-accent-600)]",
          "active:bg-[var(--color-accent-700)]",
          "shadow-[var(--shadow-xs)]",
          "hover:shadow-[var(--shadow-sm)]",
        ].join(" "),
        // Shopping CTA — warm amber, used for cart/checkout/add-to-cart actions
        shop: [
          "bg-[var(--btn-shop-bg)] text-white",
          "hover:bg-[var(--btn-shop-hover)]",
          "active:bg-[var(--btn-shop-active)]",
          "shadow-[var(--shadow-xs)]",
          "hover:shadow-[var(--shadow-sm)]",
        ].join(" "),
        destructive: [
          "bg-[var(--color-error-text)] text-white",
          "hover:opacity-90 active:opacity-80",
        ].join(" "),
        outline: [
          "border border-[var(--border-default)] bg-transparent text-[var(--text-primary)]",
          "hover:bg-[var(--surface-raised)] hover:border-[var(--border-strong)]",
          "active:bg-[var(--surface-subtle)]",
        ].join(" "),
        secondary: [
          "bg-[var(--surface-raised)] text-[var(--text-primary)]",
          "border border-[var(--border-default)]",
          "hover:bg-[var(--surface-subtle)] hover:border-[var(--border-strong)]",
        ].join(" "),
        ghost: [
          "text-[var(--text-secondary)] bg-transparent",
          "hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]",
          "active:bg-[var(--surface-subtle)]",
        ].join(" "),
        link: [
          "text-[var(--text-link)] underline-offset-4",
          "hover:text-[var(--text-link-hover)] hover:underline",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm:      "h-8 rounded-md px-3 text-xs",
        lg:      "h-11 rounded-lg px-6 text-sm font-medium",
        icon:    "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
