/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// from https://quilljs.com/playground/react

import Quill from "quill";
import { RefObject, useEffect, useLayoutEffect, useRef } from "react";

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
    });

    ref.current = quill;

    if (defaultValueRef.current) {
      const value = defaultValueRef.current;
      const delta = quill.clipboard.convert({ html: value });

      quill.setContents(delta, "silent");
    }

    quill.on(Quill.events.TEXT_CHANGE, () => {
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
