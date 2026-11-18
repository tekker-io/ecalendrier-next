/**
 * Format of a day edited with the simple editor: one optional media (photo or
 * video) and a text, stored as Quill-compatible HTML so that the advanced
 * editor and the public calendar can display it without any change.
 *
 * The file starts with a marker comment. Quill drops HTML comments when it
 * loads a document, so a day saved from the advanced editor automatically
 * loses the marker and keeps opening in the advanced editor afterwards.
 */

export const SIMPLE_MARKER = "<!-- casedujour:simple -->";

/** Free plan limit for a day (photo file or advanced editor HTML) */
export const FREE_SIZE_LIMIT = 2_000_000;
/** Premium limit (videos), also a safety limit for photos */
export const MAX_SIZE_LIMIT = 100_000_000;

/** Class of uploaded videos, also registered as a Quill format */
export const UPLOADED_VIDEO_CLASS = "ql-uploaded-video";

export type MediaType = "image" | "video";
export type MediaSize = { width: number; height: number };

export type SimpleDay = {
  mediaUrl: string | null;
  mediaType: MediaType;
  /** Written on the tag so the browser reserves its space while loading */
  mediaSize?: MediaSize | null;
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

/**
 * width/height give the ratio so the browser reserves the space before
 * loading. The width is capped so the height never exceeds 80vh (the
 * max-height of medias): the box always matches the displayed media.
 * Quill drops the style attribute, the CSS fallback handles that case.
 */
function sizeAttributes(size: MediaSize | null | undefined) {
  if (!size) return "";
  return (
    ` width="${size.width}" height="${size.height}"` +
    ` style="width: min(100%, calc(80vh * ${size.width} / ${size.height})); height: auto;"`
  );
}

/** Removes the #t=… fragment added to videos */
function stripFragment(url: string) {
  return url.split("#")[0];
}

export function buildSimpleHtml({
  mediaUrl,
  mediaType,
  mediaSize,
  text,
}: SimpleDay) {
  const parts = [SIMPLE_MARKER];
  if (mediaUrl && mediaType === "image") {
    parts.push(
      `<p class="ql-align-center"><img src="${escapeHtml(mediaUrl)}"${sizeAttributes(mediaSize)}></p>`
    );
  }
  if (mediaUrl && mediaType === "video") {
    // #t=0.1 makes iOS display the first frame instead of a black box.
    // Not on blob: URLs (preview of a video not uploaded yet): Safari can't
    // play them with a fragment.
    const src = mediaUrl.startsWith("blob:")
      ? mediaUrl
      : `${stripFragment(mediaUrl)}#t=0.1`;
    parts.push(
      `<video class="${UPLOADED_VIDEO_CLASS}" src="${escapeHtml(src)}" controls playsinline preload="metadata"${sizeAttributes(mediaSize)}></video>`
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

export function readMediaSize(el: Element | null | undefined) {
  const width = Number(el?.getAttribute("width"));
  const height = Number(el?.getAttribute("height"));
  return width > 0 && height > 0 ? { width, height } : null;
}

function isUploadedVideo(el: Element) {
  return el.tagName === "VIDEO" && el.classList.contains(UPLOADED_VIDEO_CLASS);
}

function onlyLineBreaks(el: Element) {
  return Array.from(el.children).every((c) => c.tagName === "BR");
}

/**
 * Reads HTML made of at most one media (photo paragraph or uploaded video)
 * and plain text blocks. Returns null if the content has anything else
 * (formatting, several medias, YouTube videos…), meaning it can only be edited
 * with the advanced editor.
 */
export function parseSimpleHtml(html: string): SimpleDay | null {
  const doc = new DOMParser().parseFromString(html, "text/html");
  let mediaUrl: string | null = null;
  let mediaType: MediaType = "image";
  let mediaSize: MediaSize | null = null;
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

    const isImageParagraph =
      el.tagName === "P" &&
      el.children.length === 1 &&
      el.children[0].tagName === "IMG" &&
      !text;
    if (isImageParagraph || isUploadedVideo(el)) {
      if (mediaUrl) return null;
      const mediaEl = isImageParagraph ? el.children[0] : el;
      const src = mediaEl.getAttribute("src");
      if (!src) return null;
      mediaType = isImageParagraph ? "image" : "video";
      mediaUrl = mediaType === "video" ? stripFragment(src) : src;
      mediaSize = readMediaSize(mediaEl);
      continue;
    }
    if (["P", "H1", "H2", "H3"].includes(el.tagName) && onlyLineBreaks(el)) {
      if (text) lines.push(text);
      continue;
    }
    return null;
  }

  return { mediaUrl, mediaType, mediaSize, text: lines.join("\n") };
}

/**
 * Lossy conversion used when leaving the advanced editor for the simple one:
 * keeps the first photo or uploaded video and the text of each block.
 */
export function extractSimpleDay(html: string): SimpleDay {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const media = doc.body.querySelector(`img, video.${UPLOADED_VIDEO_CLASS}`);
  const mediaType: MediaType = media?.tagName === "VIDEO" ? "video" : "image";
  const src = media?.getAttribute("src") ?? null;
  const lines = Array.from(
    doc.body.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote, pre")
  )
    .map((el) => el.textContent?.trim() ?? "")
    .filter(Boolean);
  return {
    mediaUrl: src && mediaType === "video" ? stripFragment(src) : src,
    mediaType,
    mediaSize: readMediaSize(media),
    text: lines.join("\n"),
  };
}

export function isEmptySimpleDay(day: SimpleDay) {
  return !day.mediaUrl && !day.text.trim();
}

/** "4,2 Mo" */
export function formatSize(bytes: number) {
  return (bytes / 1_000_000).toFixed(1).replace(".", ",") + " Mo";
}
