import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink",
        className,
      )}
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-accent font-mono text-sm font-bold text-accent-ink">
        M
      </span>
      Mechify
    </Link>
  );
}
