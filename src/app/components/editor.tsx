// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// from https://quilljs.com/playground/react

import { UPLOADED_VIDEO_CLASS } from "@/lib/simple-day";
import Quill from "quill";
import { MediaResize } from "quill-media-resize";
import { RefObject, useEffect, useLayoutEffect, useRef } from "react";

Quill.register("modules/mediaResize", MediaResize);

const BlockEmbed = Quill.import("blots/block/embed");
const VIDEO_ATTRIBUTES = ["width", "height"];

/**
 * Video uploaded from the simple editor (<video> tag). Quill only knows
 * embedded videos (YouTube iframes) and would drop these otherwise.
 */
class UploadedVideo extends BlockEmbed {
  static blotName = "uploadedVideo";
  static tagName = "VIDEO";
  static className = UPLOADED_VIDEO_CLASS;

  static create(src) {
    const node = super.create();
    node.setAttribute("src", src);
    node.setAttribute("controls", "");
    node.setAttribute("playsinline", "");
    node.setAttribute("preload", "metadata");
    return node;
  }

  static value(node) {
    return node.getAttribute("src");
  }

  static formats(node) {
    return VIDEO_ATTRIBUTES.reduce((formats, attribute) => {
      if (node.hasAttribute(attribute)) {
        formats[attribute] = node.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  format(name, value) {
    if (VIDEO_ATTRIBUTES.includes(name)) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}

Quill.register(UploadedVideo);

/**
 * When a video (uploaded or YouTube) is the last block, there is no line
 * after it: the caret can't go there, so nothing can be typed below the video
 * and it can't be removed with Backspace. Adds an empty line in that case.
 */
function ensureLineAfterLastEmbed(quill) {
  if (quill.scroll.children.tail instanceof BlockEmbed) {
    quill.insertText(quill.getLength(), "\n", Quill.sources.SILENT);
  }
}

export default function Editor({
  readOnly = false,
  defaultValue,
  onTextChange,
  ref,
}: {
  readOnly?: boolean;
  defaultValue?: string;
  onTextChange?: (newValue: string) => void;
  ref?: RefObject;
}) {
  const containerRef = useRef(null);
  const defaultValueRef = useRef(defaultValue);
  const onTextChangeRef = useRef(onTextChange);

  useLayoutEffect(() => {
    onTextChangeRef.current = onTextChange;
  });

  useEffect(() => {
    if (ref) {
      ref.current?.enable(!readOnly);
    }
  }, [ref, readOnly]);

  useEffect(() => {
    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div")
    );
    const quill = new Quill(editorContainer, {
      theme: "snow",
      placeholder: "Écrivez quelque chose...",
      bounds: ".MuiDialogContent-root",
      modules: {
        toolbar: [
          ["bold", "italic", "underline", "strike"],
          [{ header: 1 }, { header: 2 }],
          [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
          [{ size: ["small", false, "large", "huge"] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ color: [] }, { background: [] }],
          [{ font: [] }],
          [{ align: [] }],
          ["link", "image", "video"],
        ],
        mediaResize: {},
      },
    });

    ref.current = quill;

    if (defaultValueRef.current) {
      const value = defaultValueRef.current;
      const delta = quill.clipboard.convert({ html: value });

      quill.setContents(delta, "silent");
    }
    ensureLineAfterLastEmbed(quill);

    quill.on(Quill.events.TEXT_CHANGE, () => {
      // e.g. a video inserted at the end, or the text after it removed
      ensureLineAfterLastEmbed(quill);
      if (onTextChangeRef.current) {
        onTextChangeRef.current(quill.root.innerHTML);
      }
    });

    return () => {
      ref.current = null;
      container.innerHTML = "";
    };
  }, [ref]);

  return <div ref={containerRef}></div>;
}
