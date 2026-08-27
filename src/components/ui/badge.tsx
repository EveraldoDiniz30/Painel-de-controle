import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "danger" | "warning" | "brand";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-gray-100 text-gray-700",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  brand: "bg-brand-soft text-brand",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
