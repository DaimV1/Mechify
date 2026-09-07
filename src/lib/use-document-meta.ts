import { useEffect } from "react";

const SITE_NAME = "Mechify";

function setMetaTag(name: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

/** Sets document.title and the description meta tag for the current route. */
export function useDocumentMeta(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const fullTitle = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`;
    document.title = fullTitle;
    setMetaTag("description", description);
    window.scrollTo({ top: 0 });
    return () => {
      document.title = previousTitle;
    };
  }, [title, description]);
}
