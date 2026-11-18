"use client";

import {
  deleteFile,
  getFile,
  sendEvent,
  uploadMedia,
  writeFile,
} from "@/lib/firebaseClient";
import { getImageSize, getVideoSize } from "@/lib/image";
import {
  buildSimpleHtml,
  extractSimpleDay,
  formatSize,
  FREE_SIZE_LIMIT,
  hasSimpleMarker,
  isEmptySimpleDay,
  MAX_SIZE_LIMIT,
  MediaSize,
  parseSimpleHtml,
  SimpleDay,
} from "@/lib/simple-day";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import LinearProgress from "@mui/material/LinearProgress";
import Switch from "@mui/material/Switch";
import useMediaQuery from "@mui/material/useMediaQuery";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "./button";
import {
  SimpleEditor,
  SimpleMedia,
  useMediaPreviewUrl,
} from "./simple-editor";
import { Spinner } from "./spinner";

const Editor = dynamic(() => import("./editor"), { ssr: false });

type EditorMode = "simple" | "advanced";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function toSimpleMedia({
  mediaUrl,
  mediaType,
  mediaSize,
}: SimpleDay): Promise<SimpleMedia | null> {
  if (!mediaUrl) return null;
  // Images inlined by the advanced editor become a separate file once saved
  // from the simple editor
  if (mediaUrl.startsWith("data:")) {
    return {
      kind: "local",
      type: mediaType,
      blob: await (await fetch(mediaUrl)).blob(),
    };
  }
  return {
    kind: "remote",
    type: mediaType,
    url: mediaUrl,
    size: mediaSize ?? null,
  };
}

export function DayDialog({
  onClose,
  fileName,
  editing,
  premium,
}: {
  onClose: () => void;
  fileName: string;
  editing: boolean;
  premium: boolean;
}) {
  // The media of the simple editor is stored next to the day's HTML file
  const mediaPath = fileName.replace(/\.html$/, "-media");
  const encodedMediaPath = encodeURIComponent(mediaPath);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Share of the media uploaded while saving, between 0 and 1
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);
  const [mode, setMode] = useState<EditorMode>("advanced");
  // HTML of the advanced editor, or of the day when viewing it
  const [fileContent, setFileContent] = useState<string>("");
  const [initialContent, setInitialContent] = useState<string>("");
  const [media, setMedia] = useState<SimpleMedia | null>(null);
  const [text, setText] = useState("");
  const quillRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width:639px)");
  const mediaPreviewUrl = useMediaPreviewUrl(media);

  function loadSimpleDay(day: SimpleDay) {
    setText(day.text);
    toSimpleMedia(day).then(setMedia);
  }

  useEffect(() => {
    setLoading(true);
    getFile(fileName)
      .catch(() => "")
      .then((content) => {
        setFileContent(content);
        setInitialContent(content);
        if (!editing) return;
        // Empty days and days saved from the simple editor open in the
        // simple editor, everything else in the advanced one
        const simpleDay = parseSimpleHtml(content);
        const isSimple =
          simpleDay !== null &&
          (hasSimpleMarker(content) || isEmptySimpleDay(simpleDay));
        if (isSimple) loadSimpleDay(simpleDay);
        setMode(isSimple ? "simple" : "advanced");
        sendEvent("Open editor", { mode: isSimple ? "simple" : "advanced" });
      })
      .finally(() => setLoading(false));
  }, [fileName, editing]);

  async function switchToAdvanced() {
    if (media?.kind === "local" && media.type === "video") {
      // Videos are too heavy to be inlined like images
      toast.error(
        "Enregistrez d'abord votre vidéo avant de passer à l'éditeur avancé."
      );
      return;
    }
    let mediaUrl: string | null = null;
    let mediaSize: MediaSize | null = null;
    if (media?.kind === "remote") {
      mediaUrl = media.url;
      mediaSize = media.size;
    }
    if (media?.kind === "local") {
      // Not uploaded yet: the advanced editor inlines images
      mediaUrl = await blobToDataUrl(media.blob);
      mediaSize = await getImageSize(media.blob);
    }
    sendEvent("Switch to advanced editor");
    setFileContent(
      buildSimpleHtml({
        mediaUrl,
        mediaType: media?.type ?? "image",
        mediaSize,
        text,
      })
    );
    setPreview(false);
    setMode("advanced");
  }

  function switchToSimple() {
    let day = parseSimpleHtml(fileContent);
    if (!day) {
      const confirmed = window.confirm(
        "La mise en forme sera perdue : seuls la première photo ou vidéo et le texte seront conservés. Continuer ?"
      );
      if (!confirmed) return;
      day = extractSimpleDay(fileContent);
    }
    sendEvent("Switch to simple editor");
    loadSimpleDay(day);
    setPreview(false);
    setMode("simple");
  }

  async function buildHtmlToSave(): Promise<string | null> {
    if (mode === "advanced") {
      if (!premium && fileContent.length > FREE_SIZE_LIMIT) return null;
      if (fileContent.length > MAX_SIZE_LIMIT) return null;
      return fileContent;
    }

    let mediaUrl: string | null = null;
    let mediaSize: MediaSize | null = null;
    if (media?.kind === "remote") {
      mediaUrl = media.url;
      mediaSize = media.size;
    }
    if (media?.kind === "local") {
      const isVideo = media.type === "video";
      // Videos are premium only, and up to 100 MB like premium photos
      const limit = premium ? MAX_SIZE_LIMIT : isVideo ? 0 : FREE_SIZE_LIMIT;
      if (media.blob.size > limit) {
        toast.error(
          `Votre ${isVideo ? "vidéo" : "photo"} pèse ${formatSize(media.blob.size)}, changez-la pour pouvoir enregistrer.`
        );
        return null;
      }
      mediaSize = isVideo
        ? await getVideoSize(media.blob)
        : await getImageSize(media.blob);
      setUploadProgress(0);
      const url = await uploadMedia(mediaPath, media.blob, setUploadProgress);
      // Bypasses caches when the media is replaced
      mediaUrl = `${url}&v=${Date.now()}`;
    }
    return buildSimpleHtml({
      mediaUrl,
      mediaType: media?.type ?? "image",
      mediaSize,
      text,
    });
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      const html = await buildHtmlToSave();
      if (html === null) return;
      sendEvent("Save day", { editor: mode });
      await writeFile(fileName, html);
      // The media was removed or replaced by inline content: clean it up
      if (
        initialContent.includes(encodedMediaPath) &&
        !html.includes(encodedMediaPath)
      ) {
        deleteFile(mediaPath).catch(() => {});
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("L'enregistrement a échoué, veuillez réessayer.");
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  }

  // Closing during an upload would lose it
  function close() {
    if (!saving) onClose();
  }

  const simpleEditing = editing && mode === "simple";
  const displayedHtml = simpleEditing
    ? buildSimpleHtml({
        mediaUrl: mediaPreviewUrl,
        mediaType: media?.type ?? "image",
        text,
      })
    : fileContent;

  return (
    <Dialog
      open={true}
      onClose={close}
      maxWidth={simpleEditing ? "sm" : "lg"}
      fullWidth={simpleEditing}
      fullScreen={editing && isMobile}
    >
      <DialogContent>
        {loading ? (
          <Spinner color="black" />
        ) : (
          <>
            {editing && (
              <div className="mb-3 text-right">
                Prévisualiser :{" "}
                <Switch
                  checked={preview}
                  onChange={() => setPreview(!preview)}
                />
              </div>
            )}
            {simpleEditing && !preview && (
              <SimpleEditor
                media={media}
                onMediaChange={setMedia}
                text={text}
                onTextChange={setText}
                premium={premium}
                onSwitchToAdvanced={switchToAdvanced}
              />
            )}
            {editing && mode === "advanced" && !preview && (
              <>
                <Editor
                  ref={quillRef}
                  defaultValue={fileContent}
                  onTextChange={(text) => {
                    setFileContent(text);
                  }}
                />
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={switchToSimple}
                    className="underline cursor-pointer text-sm text-gray-600"
                  >
                    Passer à l&apos;éditeur simplifié
                  </button>
                </div>
              </>
            )}
            {(!editing || preview) && (
              <div className="ql-snow">
                <div
                  className="ql-editor"
                  dangerouslySetInnerHTML={{
                    __html:
                      displayedHtml ||
                      "<i>Le père noël n'est pas encore passé par là...</i>",
                  }}
                />
              </div>
            )}
            {editing &&
              mode === "advanced" &&
              !premium &&
              fileContent.length > FREE_SIZE_LIMIT && (
                <p className="text-red mt-4">
                  Chaque jour est limité à 2 Mo de données. Réduisez la taille
                  de vos images, utilisez l&apos;éditeur simplifié qui les
                  optimise automatiquement, ou{" "}
                  <Link href="/premium" target="_blank" className="!underline">
                    activez le mode premium
                  </Link>
                  .
                </p>
              )}
          </>
        )}
      </DialogContent>
      {uploadProgress !== null && (
        <div className="px-6 pt-2 text-black text-sm">
          <p className="mb-1">
            Envoi en cours… {Math.round(uploadProgress * 100)} %
            {media?.type === "video" && " · Ne fermez pas cette fenêtre"}
          </p>
          <LinearProgress
            variant="determinate"
            value={uploadProgress * 100}
          />
        </div>
      )}
      {editing && !loading && (
        <DialogActions className="px-6 pb-4">
          <Button onClick={close}>
            <span className="text-black">Annuler</span>
          </Button>
          <Button onClick={save} theme="success">
            {saving ? <Spinner /> : "Enregistrer"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
