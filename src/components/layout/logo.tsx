import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Logo({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <Link
      to="/"
      aria-label="Mechify"
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
        className,
      )}
    >
      <img
        src={`${import.meta.env.BASE_URL}brand/mechify-primary.svg`}
        width={220}
        height={40}
        className={size === "lg" ? "h-10 w-auto sm:h-12" : "h-6 w-auto sm:h-8"}
        alt=""
        aria-hidden="true"
        decoding="async"
      />
    </Link>
  );
}
