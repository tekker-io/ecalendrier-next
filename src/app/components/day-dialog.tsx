"use client";

import {
  deleteFile,
  getFile,
  sendEvent,
  uploadMedia,
  writeFile,
} from "@/lib/firebaseClient";
import { getImageSize } from "@/lib/image";
import {
  buildSimpleHtml,
  extractSimpleDay,
  formatSize,
  FREE_SIZE_LIMIT,
  hasSimpleMarker,
  isEmptySimpleDay,
  MAX_SIZE_LIMIT,
  parseSimpleHtml,
  PhotoSize,
  SimpleDay,
} from "@/lib/simple-day";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Switch from "@mui/material/Switch";
import useMediaQuery from "@mui/material/useMediaQuery";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "./button";
import {
  SimpleEditor,
  SimplePhoto,
  usePhotoPreviewUrl,
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

async function toSimplePhoto({
  photoUrl,
  photoSize,
}: SimpleDay): Promise<SimplePhoto | null> {
  if (!photoUrl) return null;
  // Images inlined by the advanced editor become a separate file once saved
  // from the simple editor
  if (photoUrl.startsWith("data:")) {
    return { kind: "local", blob: await (await fetch(photoUrl)).blob() };
  }
  return { kind: "remote", url: photoUrl, size: photoSize ?? null };
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
  // The photo of the simple editor is stored next to the day's HTML file
  const mediaPath = fileName.replace(/\.html$/, "-media");
  const encodedMediaPath = encodeURIComponent(mediaPath);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [mode, setMode] = useState<EditorMode>("advanced");
  // HTML of the advanced editor, or of the day when viewing it
  const [fileContent, setFileContent] = useState<string>("");
  const [initialContent, setInitialContent] = useState<string>("");
  const [photo, setPhoto] = useState<SimplePhoto | null>(null);
  const [text, setText] = useState("");
  const quillRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width:639px)");
  const photoPreviewUrl = usePhotoPreviewUrl(photo);

  function loadSimpleDay(day: SimpleDay) {
    setText(day.text);
    toSimplePhoto(day).then(setPhoto);
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
    let photoUrl: string | null = null;
    let photoSize: PhotoSize | null = null;
    if (photo?.kind === "remote") {
      photoUrl = photo.url;
      photoSize = photo.size;
    }
    if (photo?.kind === "local") {
      // Not uploaded yet: the advanced editor inlines images
      photoUrl = await blobToDataUrl(photo.blob);
      photoSize = await getImageSize(photo.blob);
    }
    sendEvent("Switch to advanced editor");
    setFileContent(buildSimpleHtml({ photoUrl, photoSize, text }));
    setPreview(false);
    setMode("advanced");
  }

  function switchToSimple() {
    let day = parseSimpleHtml(fileContent);
    if (!day) {
      const confirmed = window.confirm(
        "La mise en forme sera perdue : seuls la première photo et le texte seront conservés. Continuer ?"
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

    let photoUrl: string | null = null;
    let photoSize: PhotoSize | null = null;
    if (photo?.kind === "remote") {
      photoUrl = photo.url;
      photoSize = photo.size;
    }
    if (photo?.kind === "local") {
      if (!premium && photo.blob.size > FREE_SIZE_LIMIT) {
        toast.error(
          `Votre photo pèse ${formatSize(photo.blob.size)}, changez-la pour pouvoir enregistrer.`
        );
        return null;
      }
      photoSize = await getImageSize(photo.blob);
      const url = await uploadMedia(mediaPath, photo.blob);
      // Bypasses caches when the photo is replaced
      photoUrl = `${url}&v=${Date.now()}`;
    }
    return buildSimpleHtml({ photoUrl, photoSize, text });
  }

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      const html = await buildHtmlToSave();
      if (html === null) return;
      sendEvent("Save day", { editor: mode });
      await writeFile(fileName, html);
      // The photo was removed or replaced by inline content: clean it up
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
    }
  }

  const simpleEditing = editing && mode === "simple";
  const displayedHtml = simpleEditing
    ? buildSimpleHtml({ photoUrl: photoPreviewUrl, text })
    : fileContent;

  return (
    <Dialog
      open={true}
      onClose={onClose}
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
                photo={photo}
                onPhotoChange={setPhoto}
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
      {editing && !loading && (
        <DialogActions className="px-6 pb-4">
          <Button onClick={onClose}>
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
