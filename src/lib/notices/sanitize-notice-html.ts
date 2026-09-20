import sanitizeHtml from "sanitize-html";

// Notice bodies come from a rich-text editor, so they are HTML. Sanitize on
// save (not only on render) with an allowlist: anything an operator pastes --
// or anything injected into what they paste -- would otherwise run in every
// visitor's browser.
function storagePrefix(): string {
  // Read at call time so tests (and any future per-request config) can vary it.
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/notice-images/`;
}

export function sanitizeNoticeHtml(html: string): string {
  const prefix = storagePrefix();

  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    // Images we don't serve ourselves would leak every visitor's IP to that
    // host, so only our own storage bucket is allowed.
    exclusiveFilter: (frame) =>
      frame.tag === "img" && !(frame.attribs.src ?? "").startsWith(prefix),
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
    },
  });
}
