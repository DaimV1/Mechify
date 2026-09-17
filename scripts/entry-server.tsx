import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { PassThrough } from "node:stream";
import { App } from "@/app";
import { LocaleProvider } from "@/lib/i18n/locale-context";

export { getAllRoutes } from "@/lib/all-routes";

/**
 * P0.2: build-time prerendering. Renders the real route tree (not just a
 * shell) to an HTML string for a given path, waiting for every lazy-loaded
 * calculator chunk to resolve (onAllReady, not onShellReady — this runs
 * once per route at build time for static output, not per-request, so
 * there is no streaming-latency reason to resolve early). Always renders
 * with the default "nl" locale and no query string, matching the one
 * canonical version a static file can represent — see LocaleProvider's own
 * comment on why the client's first render must match this.
 */
export function renderPage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const sink = new PassThrough();
    sink.on("data", (chunk) => chunks.push(chunk));
    sink.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    sink.on("error", reject);

    const { pipe, abort } = renderToPipeableStream(
      <LocaleProvider>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </LocaleProvider>,
      {
        onAllReady() {
          pipe(sink);
        },
        onError(error) {
          reject(error);
        },
      },
    );
    // Belt-and-braces: a route that never resolves (a runaway Suspense
    // boundary) should fail the build loudly rather than hang it forever.
    setTimeout(() => abort(new Error(`renderPage(${url}) timed out`)), 20_000);
  });
}
