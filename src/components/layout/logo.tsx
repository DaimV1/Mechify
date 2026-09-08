import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Logo({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  return (
    <Link
      to="/"
      aria-label="Mechify"
      className={cn("inline-flex shrink-0 rounded-md bg-white px-2 py-1.5", className)}
    >
      <svg
        viewBox="160 200 1650 400"
        className={size === "lg" ? "h-14 w-auto sm:h-16" : "h-8 w-auto"}
        aria-hidden="true"
        focusable="false"
      >
        <image href={`${import.meta.env.BASE_URL}mechify-logo.png`} width="1942" height="809" />
      </svg>
    </Link>
  );
}
