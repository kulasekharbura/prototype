import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[88px] w-full rounded-lg text-sm transition-all duration-150",
      "border border-[var(--border-default)] bg-[var(--surface-page)]",
      "px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
      "focus-visible:outline-none focus-visible:border-[var(--border-focus)]",
      "focus-visible:ring-2 focus-visible:ring-[var(--color-accent-500)]/15",
      "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
      "leading-relaxed",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
