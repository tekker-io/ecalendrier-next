async function resizeToJpeg(
  file: Blob,
  maxDimension: number,
  quality: number
): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    // Browsers apply the EXIF orientation when decoding, so phone photos
    // keep the right rotation
    await img.decode();

    const scale = Math.min(
      1,
      maxDimension / Math.max(img.naturalWidth, img.naturalHeight)
    );
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    // JPEG has no transparency: use a white background for PNGs
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    return await new Promise((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Image encoding failed")),
        "image/jpeg",
        quality
      )
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Resizes and re-encodes a photo until it fits in maxBytes.
 * A phone photo usually ends up around 300 KB on the first attempt.
 */
export async function optimizeImage(
  file: Blob,
  maxBytes: number
): Promise<Blob> {
  const attempts: [number, number][] = [
    [1600, 0.8],
    [1280, 0.7],
    [1024, 0.6],
  ];
  let result: Blob = file;
  for (const [maxDimension, quality] of attempts) {
    result = await resizeToJpeg(file, maxDimension, quality);
    if (result.size <= maxBytes) return result;
  }
  return result;
}

/** Displayed size of a photo, EXIF orientation included */
export async function getImageSize(
  file: Blob
): Promise<{ width: number; height: number } | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { width: img.naturalWidth, height: img.naturalHeight };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
