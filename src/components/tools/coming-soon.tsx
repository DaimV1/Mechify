import { Construction } from "lucide-react";
import { Link } from "react-router-dom";
import type { Tool } from "@/lib/tools";

export function ComingSoon({ tool }: { tool: Tool }) {
  return (
    <section className="rounded-xl border border-dashed border-border-strong bg-surface p-8 text-center sm:p-12">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-surface-2">
        <Construction className="size-6 text-accent" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-display text-xl font-semibold tracking-tight text-ink">
        {tool.title} wordt gemigreerd
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        Deze rekenhulp staat op de planning voor Mechify en is nog niet live. De onderliggende{" "}
        {tool.standard}-data en rekenlogica volgen de architectuur die hiernaast al functioneert.
      </p>
      <Link
        to="/tools"
        className="mt-6 inline-flex h-10 items-center rounded-md border border-border-strong bg-bg px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
      >
        Bekijk beschikbare tools
      </Link>
    </section>
  );
}
