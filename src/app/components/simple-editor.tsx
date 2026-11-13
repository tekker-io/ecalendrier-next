"use client";

import { sendEvent } from "@/lib/firebaseClient";
import { optimizeImage } from "@/lib/image";
import {
  formatSize,
  FREE_SIZE_LIMIT,
  headingLevel,
  MAX_SIZE_LIMIT,
  PhotoSize,
} from "@/lib/simple-day";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import StarIcon from "@mui/icons-material/Star";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Spinner } from "./spinner";

/** A photo already uploaded, or one picked on this device and not saved yet */
export type SimplePhoto =
  | { kind: "remote"; url: string; size: PhotoSize | null }
  | { kind: "local"; blob: Blob };

export function usePhotoPreviewUrl(photo: SimplePhoto | null) {
  const localBlob = photo?.kind === "local" ? photo.blob : null;
  const objectUrl = useMemo(
    () => (localBlob ? URL.createObjectURL(localBlob) : null),
    [localBlob],
  );
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);
  if (!photo) return null;
  return photo.kind === "remote" ? photo.url : objectUrl;
}

function PhotoInput({
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
        accept="image/*"
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
  photo,
  onPhotoChange,
  text,
  onTextChange,
  premium,
  onSwitchToAdvanced,
}: {
  photo: SimplePhoto | null;
  onPhotoChange: (photo: SimplePhoto | null) => void;
  text: string;
  onTextChange: (text: string) => void;
  premium: boolean;
  onSwitchToAdvanced: () => void;
}) {
  const [tooLargeFile, setTooLargeFile] = useState<File | null>(null);
  const previewUrl = usePhotoPreviewUrl(photo);

  function onFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Ce fichier n'est pas une photo.");
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
    onPhotoChange({ kind: "local", blob: file });
  }

  const level = headingLevel(text);
  const textSize =
    level === 1 ? "text-3xl" : level === 2 ? "text-2xl" : "text-xl";

  return (
    <div className="flex flex-col gap-4 text-black">
      {tooLargeFile ? (
        <TooLargePanel
          file={tooLargeFile}
          onCancel={() => setTooLargeFile(null)}
          onOptimized={(blob) => {
            setTooLargeFile(null);
            onPhotoChange({ kind: "local", blob });
          }}
        />
      ) : photo && previewUrl ? (
        <div className="flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Photo de la case"
            className="max-h-[45vh] max-w-full rounded"
          />
          <div className="flex gap-4 text-sm">
            <PhotoInput onFile={onFile} className="underline cursor-pointer">
              Changer la photo
            </PhotoInput>
            <button
              type="button"
              className="underline cursor-pointer"
              onClick={() => onPhotoChange(null)}
            >
              Retirer la photo
            </button>
          </div>
        </div>
      ) : (
        <PhotoInput
          onFile={onFile}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-400 py-10 px-4 cursor-pointer text-gray-600 hover:bg-gray-100"
        >
          <AddAPhotoIcon fontSize="large" />
          <span className="font-bold">Ajouter une photo</span>
        </PhotoInput>
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
