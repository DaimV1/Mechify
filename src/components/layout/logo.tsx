import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/** Dimension-line accent under the wordmark — a nod to the tolerance/measurement tables Mechify is built on. */
function DimensionTick({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 6" preserveAspectRatio="none" className={cn("w-full text-accent", className)} aria-hidden="true">
      <line x1="2" y1="3" x2="98" y2="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="0.5" x2="2" y2="5.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="98" y1="0.5" x2="98" y2="5.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Logo({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <Link to="/" className={cn("inline-flex flex-col", className)}>
      <span
        className={cn(
          "font-display font-bold tracking-tight text-ink",
          size === "lg" ? "text-4xl sm:text-5xl" : "text-lg",
        )}
      >
        Mechify
      </span>
      <DimensionTick className={size === "lg" ? "mt-1.5 h-2" : "mt-1 h-1"} />
    </Link>
  );
}
