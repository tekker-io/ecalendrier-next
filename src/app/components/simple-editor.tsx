"use client";

import { sendEvent } from "@/lib/firebaseClient";
import { optimizeImage } from "@/lib/image";
import {
  formatSize,
  FREE_SIZE_LIMIT,
  headingLevel,
  MAX_SIZE_LIMIT,
  MediaSize,
  MediaType,
} from "@/lib/simple-day";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import StarIcon from "@mui/icons-material/Star";
import VideocamIcon from "@mui/icons-material/Videocam";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PremiumDialog } from "./premium-dialog";
import { Spinner } from "./spinner";

/** A media already uploaded, or one picked on this device and not saved yet */
export type SimpleMedia =
  | { kind: "remote"; type: MediaType; url: string; size: MediaSize | null }
  | { kind: "local"; type: MediaType; blob: Blob };

export function useMediaPreviewUrl(media: SimpleMedia | null) {
  const localBlob = media?.kind === "local" ? media.blob : null;
  // Created and revoked in the same effect: React may run effects twice (dev
  // strict mode), a URL created during render could be revoked while still
  // displayed. Safari loads videos lazily and then fails on revoked URLs.
  const [objectUrl, setObjectUrl] = useState<{
    blob: Blob;
    url: string;
  } | null>(null);
  useEffect(() => {
    if (!localBlob) return;
    const url = URL.createObjectURL(localBlob);
    setObjectUrl({ blob: localBlob, url });
    return () => URL.revokeObjectURL(url);
  }, [localBlob]);
  if (!media) return null;
  if (media.kind === "remote") return media.url;
  // Ignores the URL of a previous blob until the effect has run
  return objectUrl?.blob === media.blob ? objectUrl.url : null;
}

/** Shows the first frame on iOS, which otherwise displays a black box */
function showFirstFrame(e: React.SyntheticEvent<HTMLVideoElement>) {
  const video = e.currentTarget;
  if (video.currentTime === 0) video.currentTime = 0.1;
}

function isVideoFile(file: File) {
  // Some Android browsers leave the type empty
  return (
    file.type.startsWith("video/") || /\.(mp4|mov|m4v|webm)$/i.test(file.name)
  );
}

function MediaInput({
  onFile,
  children,
  className,
}: {
  onFile: (file: File) => void;
  children: React.ReactNode;
  className: string;
}) {
  return (
    <label className={className}>
      <input
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Allows picking the same file again later
          e.target.value = "";
          if (file) onFile(file);
        }}
      />
      {children}
    </label>
  );
}

const MIN_OPTIMIZATION_DURATION = 4000;

function TooLargePanel({
  file,
  onOptimized,
  onCancel,
}: {
  file: File;
  onOptimized: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const [optimizing, setOptimizing] = useState(false);

  async function optimize() {
    if (optimizing) return;
    sendEvent("Optimize photo", { size: file.size });
    setOptimizing(true);
    try {
      // The optimization always shows its progress for at least a few
      // seconds, even when it is faster
      const [blob] = await Promise.all([
        optimizeImage(file, FREE_SIZE_LIMIT),
        new Promise((resolve) =>
          setTimeout(resolve, MIN_OPTIMIZATION_DURATION),
        ),
      ]);
      if (blob.size > FREE_SIZE_LIMIT) {
        toast.error(
          "Impossible de réduire suffisamment cette photo, essayez-en une autre.",
        );
        return;
      }
      onOptimized(blob);
    } catch (err) {
      console.error(err);
      toast.error("Impossible d'optimiser cette photo, essayez-en une autre.");
    } finally {
      setOptimizing(false);
    }
  }

  return (
    <div className="rounded-lg bg-yellow-50 border border-yellow-300 p-4 text-black">
      <p className="font-bold text-lg mb-1">
        Votre photo pèse {formatSize(file.size)}
      </p>
      <p className="mb-4">
        Le mode gratuit est limité à {formatSize(FREE_SIZE_LIMIT)} par case.
        Vous pouvez optimiser votre photo gratuitement, ou passer en mode
        premium pour garder vos photos en qualité HD.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={optimize}
          disabled={optimizing}
          className="flex-1 flex items-center justify-center gap-2 rounded bg-green text-white font-bold py-3 px-4 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
        >
          {optimizing ? (
            <>
              <Spinner />
              Optimisation de votre photo…
            </>
          ) : (
            "Optimiser ma photo (gratuit)"
          )}
        </button>
        <Link
          href="/premium"
          target="_blank"
          onClick={() => sendEvent("Click premium from photo limit")}
          className="flex-1 flex items-center justify-center gap-2 rounded bg-yellow-400 text-black font-bold py-3 px-4"
        >
          <StarIcon />
          Garder la qualité HD – 7 € à vie
        </Link>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="mt-3 underline cursor-pointer text-sm"
      >
        Choisir une autre photo
      </button>
    </div>
  );
}

export function SimpleEditor({
  media,
  onMediaChange,
  text,
  onTextChange,
  premium,
  onSwitchToAdvanced,
}: {
  media: SimpleMedia | null;
  onMediaChange: (media: SimpleMedia | null) => void;
  text: string;
  onTextChange: (text: string) => void;
  premium: boolean;
  onSwitchToAdvanced: () => void;
}) {
  const [tooLargeFile, setTooLargeFile] = useState<File | null>(null);
  const [videoUpsellOpen, setVideoUpsellOpen] = useState(false);
  const previewUrl = useMediaPreviewUrl(media);

  function onVideo(file: File) {
    if (!premium) {
      sendEvent("Video selected without premium", { size: file.size });
      setVideoUpsellOpen(true);
      return;
    }
    if (file.size > MAX_SIZE_LIMIT) {
      toast.error(
        `Cette vidéo pèse ${formatSize(file.size)}, la limite est de ${formatSize(MAX_SIZE_LIMIT)}. Essayez une vidéo plus courte.`,
      );
      return;
    }
    sendEvent("Video selected", { size: file.size });
    setTooLargeFile(null);
    onMediaChange({ kind: "local", type: "video", blob: file });
  }

  function onFile(file: File) {
    if (isVideoFile(file)) {
      onVideo(file);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Ce fichier n'est ni une photo ni une vidéo.");
      return;
    }
    if (file.size > MAX_SIZE_LIMIT) {
      toast.error(
        `Cette photo est trop lourde (${formatSize(file.size)}), la limite est de ${formatSize(MAX_SIZE_LIMIT)}.`,
      );
      return;
    }
    if (!premium && file.size > FREE_SIZE_LIMIT) {
      sendEvent("Photo too large", { size: file.size });
      setTooLargeFile(file);
      return;
    }
    setTooLargeFile(null);
    onMediaChange({ kind: "local", type: "image", blob: file });
  }

  const level = headingLevel(text);
  const textSize =
    level === 1 ? "text-3xl" : level === 2 ? "text-2xl" : "text-xl";

  return (
    <div className="flex flex-col gap-4 text-black">
      {videoUpsellOpen && (
        <PremiumDialog
          feature="video"
          onClose={() => setVideoUpsellOpen(false)}
        />
      )}
      {tooLargeFile ? (
        <TooLargePanel
          file={tooLargeFile}
          onCancel={() => setTooLargeFile(null)}
          onOptimized={(blob) => {
            setTooLargeFile(null);
            onMediaChange({ kind: "local", type: "image", blob });
          }}
        />
      ) : media && previewUrl ? (
        <div className="flex flex-col items-center gap-2">
          {media.type === "video" ? (
            <video
              // No #t=0.1 fragment here: Safari fails on blob: URLs with it
              src={previewUrl}
              controls
              playsInline
              preload="metadata"
              onLoadedMetadata={showFirstFrame}
              className="max-h-[45vh] max-w-full rounded bg-black"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Photo de la case"
              className="max-h-[45vh] max-w-full rounded"
            />
          )}
          <div className="flex gap-4 text-sm">
            <MediaInput onFile={onFile} className="underline cursor-pointer">
              Changer
            </MediaInput>
            <button
              type="button"
              className="underline cursor-pointer"
              onClick={() => onMediaChange(null)}
            >
              Retirer
            </button>
          </div>
        </div>
      ) : (
        <MediaInput
          onFile={onFile}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-400 py-10 px-4 cursor-pointer text-gray-600 hover:bg-gray-100"
        >
          <span className="flex gap-2">
            <AddAPhotoIcon fontSize="large" />
            <VideocamIcon fontSize="large" />
          </span>
          <span className="font-bold">Ajouter une photo ou une vidéo</span>
          {!premium && (
            <span className="text-xs flex items-center gap-1">
              <StarIcon fontSize="inherit" className="text-yellow-500" />
              Vidéos réservées au mode premium
            </span>
          )}
        </MediaInput>
      )}

      <label className="flex flex-col gap-2">
        <span className="font-bold">Votre message</span>
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          rows={3}
          placeholder="Joyeux Noël ! 🎄"
          className={`rounded border border-gray-400 px-3 py-2 outline-none w-full text-center font-bold ${textSize}`}
        />
      </label>

      <button
        type="button"
        onClick={onSwitchToAdvanced}
        className="self-center underline cursor-pointer text-sm text-gray-600"
      >
        Passer à l&apos;éditeur avancé (mise en forme, plusieurs photos, vidéos
        YouTube…)
      </button>
    </div>
  );
}
