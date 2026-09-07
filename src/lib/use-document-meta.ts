import { useEffect } from "react";

const SITE_NAME = "Mechify";
const SITE_URL = "https://mechify.nl";
const JSONLD_ID = "page-jsonld";

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

function setPageJsonLd(title: string, description: string, url: string) {
  let tag = document.getElementById(JSONLD_ID) as HTMLScriptElement | null;
  if (!tag) {
    tag = document.createElement("script");
    tag.id = JSONLD_ID;
    tag.type = "application/ld+json";
    document.head.appendChild(tag);
  }
  tag.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  });
}

/** Sets title, description, canonical URL, OG/Twitter tags and a per-page JSON-LD block for the current route. */
export function useDocumentMeta(title: string, description: string) {
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
    setPageJsonLd(fullTitle, description, url);

    window.scrollTo({ top: 0 });
    return () => {
      document.title = previousTitle;
    };
  }, [title, description]);
}
