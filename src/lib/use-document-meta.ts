import { useEffect } from "react";

const SITE_NAME = "Mechify";
const SITE_URL = "https://www.mechify.nl";
const JSONLD_ID = "page-jsonld";
const FAQ_JSONLD_ID = "faq-jsonld";

function setMetaTag(attr: "name" | "property", key: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonical(href: string) {
  let tag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

export type PageSchema = {
  /** Defaults to "WebPage" when omitted. */
  type?: "WebPage" | "TechArticle" | "SoftwareApplication";
  /** Extra schema.org fields merged onto the page's own JSON-LD object. */
  extra?: Record<string, unknown>;
  /** Ancestor path segments (name + site-relative path); the current page is appended automatically. */
  breadcrumbs?: { name: string; path: string }[];
};

function setPageJsonLd(
  title: string,
  description: string,
  url: string,
  schema?: PageSchema,
  shortTitle?: string,
) {
  let tag = document.getElementById(JSONLD_ID) as HTMLScriptElement | null;
  if (!tag) {
    tag = document.createElement("script");
    tag.id = JSONLD_ID;
    tag.type = "application/ld+json";
    document.head.appendChild(tag);
  }
  const page = {
    "@type": schema?.type ?? "WebPage",
    name: title,
    description,
    url,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    ...schema?.extra,
  };
  if (!schema?.breadcrumbs || schema.breadcrumbs.length === 0) {
    tag.textContent = JSON.stringify({ "@context": "https://schema.org", ...page });
    return;
  }
  const crumbs = [
    ...schema.breadcrumbs,
    { name: shortTitle ?? title, path: url.slice(SITE_URL.length) || "/" },
  ];
  const breadcrumbList = {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
  tag.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [page, breadcrumbList],
  });
}

/**
 * Adds an FAQPage JSON-LD block for the visible "Vragen"/"Questions" accordion
 * on a tool page, so eligible pages can show an expandable Q&A rich result in
 * Google Search instead of just a title/description snippet. The accordion
 * content itself is already real DOM (native <details>, not JS-hidden), so
 * this only adds the structured-data hint on top — no duplicate/hidden text.
 * Call with `undefined` (or an empty array) on pages without an FAQ; that
 * removes any stale block left over from a previous route.
 */
export function useFaqJsonLd(items: { q: string; a: string }[] | undefined) {
  useEffect(() => {
    if (!items || items.length === 0) {
      document.getElementById(FAQ_JSONLD_ID)?.remove();
      return;
    }
    let tag = document.getElementById(FAQ_JSONLD_ID) as HTMLScriptElement | null;
    if (!tag) {
      tag = document.createElement("script");
      tag.id = FAQ_JSONLD_ID;
      tag.type = "application/ld+json";
      document.head.appendChild(tag);
    }
    tag.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
    return () => {
      document.getElementById(FAQ_JSONLD_ID)?.remove();
    };
  }, [items]);
}

/**
 * Sets title, description, canonical URL, OG/Twitter tags and a per-page
 * JSON-LD block for the current route. Pass `{ noindex: true }` for pages
 * that render at any URL but aren't real content — currently just the 404
 * page. P1.2: a fresh request to an unmatched path now gets a real HTTP 404
 * from Vercel (vercel.json's catch-all rewrite was removed), so this is
 * defense-in-depth for the one remaining path there — a stale/broken
 * internal <Link> triggering the "*" route during client-side SPA
 * navigation, which never hits the server at all.
 */
export function useDocumentMeta(
  title: string,
  description: string,
  opts?: { noindex?: boolean; schema?: PageSchema },
) {
  const noindex = opts?.noindex ?? false;
  const schema = opts?.schema;
  // Stable-by-content key: `schema` is typically a fresh object literal on
  // every render, and this effect must not re-run (and re-run window.scrollTo)
  // just because of that.
  const schemaKey = schema ? JSON.stringify(schema) : "";
  useEffect(() => {
    const previousTitle = document.title;
    const isHome = title === SITE_NAME;
    const fullTitle = isHome ? title : `${title} — ${SITE_NAME}`;
    const url = `${SITE_URL}${window.location.pathname === "/" ? "" : window.location.pathname}`;

    document.title = fullTitle;
    setMetaTag("name", "description", description);
    setCanonical(url);
    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", url);
    setMetaTag("name", "twitter:title", fullTitle);
    setMetaTag("name", "twitter:description", description);
    if (noindex) {
      setMetaTag("name", "robots", "noindex,follow");
    } else {
      document.querySelector('meta[name="robots"]')?.remove();
    }
    setPageJsonLd(fullTitle, description, url, schema, title);

    window.scrollTo({ top: 0 });
    return () => {
      document.title = previousTitle;
      if (noindex) document.querySelector('meta[name="robots"]')?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- schemaKey is schema's content-stable proxy
  }, [title, description, noindex, schemaKey]);
}
