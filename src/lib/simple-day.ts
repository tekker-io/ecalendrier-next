/**
 * Format of a day edited with the simple editor: one optional photo and a
 * text, stored as Quill-compatible HTML so that the advanced editor and the
 * public calendar can display it without any change.
 *
 * The file starts with a marker comment. Quill drops HTML comments when it
 * loads a document, so a day saved from the advanced editor automatically
 * loses the marker and keeps opening in the advanced editor afterwards.
 */

export const SIMPLE_MARKER = "<!-- casedujour:simple -->";

/** Free plan limit for a day (photo file or advanced editor HTML) */
export const FREE_SIZE_LIMIT = 2_000_000;
/** Safety limit for everyone, not advertised */
export const MAX_SIZE_LIMIT = 100_000_000;

export type PhotoSize = { width: number; height: number };

export type SimpleDay = {
  photoUrl: string | null;
  /** Written on the img tag so the browser reserves its space while loading */
  photoSize?: PhotoSize | null;
  text: string;
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** h1 for short texts, h2 above 50 characters, h3 above 100 */
export function headingLevel(text: string) {
  const length = text.trim().length;
  if (length > 100) return 3;
  if (length > 50) return 2;
  return 1;
}

export function buildSimpleHtml({ photoUrl, photoSize, text }: SimpleDay) {
  const parts = [SIMPLE_MARKER];
  if (photoUrl) {
    // width/height give the ratio so the browser reserves the space before
    // loading. The width is capped so the height never exceeds 80vh (the
    // max-height of images): the box always matches the displayed photo.
    // Quill drops the style attribute, the CSS fallback handles that case.
    const size = photoSize
      ? ` width="${photoSize.width}" height="${photoSize.height}"` +
        ` style="width: min(100%, calc(80vh * ${photoSize.width} / ${photoSize.height})); height: auto;"`
      : "";
    parts.push(
      `<p class="ql-align-center"><img src="${escapeHtml(photoUrl)}"${size}></p>`
    );
  }
  const level = headingLevel(text);
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    parts.push(
      `<h${level} class="ql-align-center">${escapeHtml(line.trim())}</h${level}>`
    );
  }
  return parts.join("");
}

export function hasSimpleMarker(html: string) {
  return html.trimStart().startsWith(SIMPLE_MARKER);
}

export function readPhotoSize(img: Element | null | undefined) {
  const width = Number(img?.getAttribute("width"));
  const height = Number(img?.getAttribute("height"));
  return width > 0 && height > 0 ? { width, height } : null;
}

function onlyLineBreaks(el: Element) {
  return Array.from(el.children).every((c) => c.tagName === "BR");
}

/**
 * Reads HTML made of at most one photo paragraph and plain text blocks.
 * Returns null if the content has anything else (formatting, several photos,
 * videos…), meaning it can only be edited with the advanced editor.
 */
export function parseSimpleHtml(html: string): SimpleDay | null {
  const doc = new DOMParser().parseFromString(html, "text/html");
  let photoUrl: string | null = null;
  let photoSize: PhotoSize | null = null;
  const lines: string[] = [];

  for (const node of Array.from(doc.body.childNodes)) {
    if (node.nodeType === Node.COMMENT_NODE) continue;
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent?.trim()) return null;
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    const el = node as Element;
    const text = el.textContent?.trim() ?? "";

    if (
      el.tagName === "P" &&
      el.children.length === 1 &&
      el.children[0].tagName === "IMG" &&
      !text
    ) {
      if (photoUrl) return null;
      photoUrl = el.children[0].getAttribute("src");
      if (!photoUrl) return null;
      photoSize = readPhotoSize(el.children[0]);
      continue;
    }
    if (["P", "H1", "H2", "H3"].includes(el.tagName) && onlyLineBreaks(el)) {
      if (text) lines.push(text);
      continue;
    }
    return null;
  }

  return { photoUrl, photoSize, text: lines.join("\n") };
}

/**
 * Lossy conversion used when leaving the advanced editor for the simple one:
 * keeps the first photo and the text of each block.
 */
export function extractSimpleDay(html: string): SimpleDay {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const img = doc.body.querySelector("img");
  const photoUrl = img?.getAttribute("src") ?? null;
  const lines = Array.from(
    doc.body.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote, pre")
  )
    .map((el) => el.textContent?.trim() ?? "")
    .filter(Boolean);
  return { photoUrl, photoSize: readPhotoSize(img), text: lines.join("\n") };
}

export function isEmptySimpleDay(day: SimpleDay) {
  return !day.photoUrl && !day.text.trim();
}

/** "4,2 Mo" */
export function formatSize(bytes: number) {
  return (bytes / 1_000_000).toFixed(1).replace(".", ",") + " Mo";
}
