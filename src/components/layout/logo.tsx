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
        // P0.2: react-dom's server renderer auto-generates an image preload
        // <link> for any eager <img>, meant to be hoisted into a real
        // <head>. Our prerender only renders the app fragment (no <head> in
        // the rendered tree), so the hint gets emitted inline instead —
        // then the client, hydrating against a real document, tries to
        // hoist it into <head>, a structural mismatch that fails hydration
        // on every route (this logo is in the header on all of them).
        // fetchPriority="low" is one of the documented conditions that
        // skips this auto-preload path entirely.
        fetchPriority="low"
      />
    </Link>
  );
}
