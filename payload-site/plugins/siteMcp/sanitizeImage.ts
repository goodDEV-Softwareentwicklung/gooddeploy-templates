/**
 * Bilder aus fremder Hand unschädlich machen (Upload-Link und import_image):
 * 1. Typ an den ersten Bytes erkennen, nicht an Name oder Content-Type des Clients.
 *    Nur Rasterbilder; kein SVG (kann Skripte enthalten), kein HEIC, kein PDF.
 * 2. Mit sharp dekodieren und neu kodieren. Gespeichert wird nur das neu erzeugte
 *    Bild: Angehängte Daten, Polyglot-Dateien (Bild und Skript zugleich) und
 *    Metadaten (EXIF mit GPS, ICC-Kommentare) gehen dabei verloren.
 * 3. Grenzen gegen Dekompressionsbomben: Dateigröße und Pixelzahl; Ergebnis höchstens
 *    2560 px Kantenlänge wie beim Hochladen im Admin-Panel (collections/Media.ts).
 * Den Dateinamen vergibt der Server.
 */
import sharp from "sharp";
import { maxUploadBytes, uploadResize } from "../../collections/Media.ts";

export { maxUploadBytes };
export const maxInputPixels = 40_000_000;

export type ImageFormat = "jpeg" | "png" | "webp" | "gif" | "avif";

/** Format an den Magic Bytes; `undefined` für alles andere */
export function sniffImageFormat(data: Uint8Array): ImageFormat | undefined {
  const at = (offset: number, bytes: number[]) => bytes.every((b, i) => data[offset + i] === b);
  const ascii = (offset: number, text: string) =>
    at(
      offset,
      [...text].map((c) => c.charCodeAt(0)),
    );
  if (data.length < 12) return undefined;
  if (at(0, [0xff, 0xd8, 0xff])) return "jpeg";
  if (at(0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (ascii(0, "GIF87a") || ascii(0, "GIF89a")) return "gif";
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "webp";
  if (ascii(4, "ftyp") && (ascii(8, "avif") || ascii(8, "avis"))) return "avif";
  return undefined;
}

export type CleanImage = {
  data: Buffer;
  mimetype: string;
  extension: string;
  width: number;
  height: number;
};

/** Neu kodiert; AVIF wird zu WebP (schneller zu kodieren, überall darstellbar) */
export async function sanitizeImage(input: Uint8Array): Promise<CleanImage | { error: string }> {
  if (input.length > maxUploadBytes) return { error: "Bild ist größer als 10 MB." };
  const format = sniffImageFormat(input);
  if (!format) {
    return { error: "Kein erlaubtes Bildformat (erlaubt: JPEG, PNG, WebP, GIF, AVIF)." };
  }
  try {
    const animated = format === "gif" || format === "webp";
    // sequentialRead: libvips liest zeilenweise statt das ganze Bild in den Speicher
    const image = sharp(input, {
      limitInputPixels: maxInputPixels,
      animated,
      failOn: "error",
      sequentialRead: true,
    });
    const meta = await image.metadata();
    if (meta.format === undefined) return { error: "Bild konnte nicht gelesen werden." };
    // rotate(): EXIF-Ausrichtung anwenden, bevor die Metadaten wegfallen
    // resize: große Fotos auf höchstens 2560 px (JPEG wird dabei schon verkleinert dekodiert)
    const pipeline = image.rotate().resize(uploadResize);
    const target = format === "avif" ? "webp" : format;
    const encoded =
      target === "jpeg"
        ? pipeline.jpeg({ quality: 86 })
        : target === "png"
          ? pipeline.png({ compressionLevel: 9 })
          : target === "gif"
            ? pipeline.gif()
            : pipeline.webp({ quality: 88 });
    const { data, info } = await encoded.toBuffer({ resolveWithObject: true });
    return {
      data,
      mimetype: `image/${target}`,
      extension: target === "jpeg" ? "jpg" : target,
      width: info.width,
      height: info.height,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/pixel limit/i.test(message)) return { error: "Bild hat zu viele Pixel (höchstens 40 Megapixel)." };
    return { error: "Bild konnte nicht gelesen werden (beschädigt oder kein echtes Bild)." };
  }
}
