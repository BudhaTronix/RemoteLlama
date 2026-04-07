import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const variants = {
  primary:
    "border-transparent bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand-strong)_88%,white_8%),var(--brand))] text-white shadow-glow hover:translate-y-[-1px] hover:brightness-[1.03] active:translate-y-0 focus-visible:outline-brand/45",
  secondary:
    "panel-muted text-ink hover:border-strokeStrong hover:bg-white/10 hover:shadow-float focus-visible:outline-brand/20",
  ghost:
    "border-transparent bg-transparent text-muted hover:bg-white/10 hover:text-ink focus-visible:outline-brand/20",
  danger:
    "border-danger/25 bg-danger/12 text-danger hover:bg-danger/18 hover:border-danger/40 focus-visible:outline-danger/30",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
}

export function Button({
  className,
  variant = "secondary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring micro-lift inline-flex items-center justify-center gap-2 rounded-[22px] border px-4 py-2.5 text-sm font-medium tracking-[-0.01em] transition duration-150 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-55",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
