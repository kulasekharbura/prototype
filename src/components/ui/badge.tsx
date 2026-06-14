import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        // Accent (indigo) — replaces old orange default
        default: [
          "bg-[var(--color-accent-50)] text-[var(--color-accent-600)]",
          "border border-[var(--color-accent-200)]",
        ].join(" "),
        // Neutral
        secondary: [
          "bg-[var(--surface-raised)] text-[var(--text-secondary)]",
          "border border-[var(--border-default)]",
        ].join(" "),
        // Success (green)
        success: [
          "bg-[var(--color-success-surface)] text-[var(--color-success-text)]",
          "border border-[var(--color-success-border)]",
        ].join(" "),
        // Warning (amber)
        warning: [
          "bg-[var(--color-warning-surface)] text-[var(--color-warning-text)]",
          "border border-[var(--color-warning-border)]",
        ].join(" "),
        // Error (red)
        destructive: [
          "bg-[var(--color-error-surface)] text-[var(--color-error-text)]",
          "border border-[var(--color-error-border)]",
        ].join(" "),
        // AI (violet)
        ai: [
          "bg-[var(--color-ai-surface)] text-[var(--color-ai-text)]",
          "border border-[var(--color-ai-border)]",
        ].join(" "),
        // Outline only
        outline: [
          "bg-transparent text-[var(--text-primary)]",
          "border border-[var(--border-default)]",
        ].join(" "),
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
