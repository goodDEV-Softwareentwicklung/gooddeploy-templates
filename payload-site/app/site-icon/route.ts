// Favicon und Apple-Icon der Website (lib/favicon.ts): mit Logo eine
// Weiterleitung auf das Logo, sonst das gewählte Icon in der Primärfarbe als PNG.
// ?size=apple liefert 180 × 180 Pixel für den Home-Bildschirm.
import sharp from "sharp";
import { getSiteSettings } from "../../lib/content.ts";
import { faviconSource, iconSizes, iconSvg, type IconSize } from "../../lib/favicon.ts";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const size: IconSize = new URL(request.url).searchParams.get("size") === "apple" ? "apple" : "icon";
  // Die Adresse im Layout ändert sich mit dem Stand (?v=…); ohne sie kurz zwischenspeichern.
  const cache = { "Cache-Control": "public, max-age=300" };
  let source;
  try {
    source = faviconSource(await getSiteSettings());
  } catch {
    source = faviconSource(null); // ohne Datenbank: neutrales Zeichen statt Fehler
  }
  if (source.kind === "logo") {
    return new Response(null, { status: 307, headers: { Location: source.url, ...cache } });
  }
  const png = await sharp(Buffer.from(iconSvg(source, size)))
    .resize(iconSizes[size], iconSizes[size])
    .png()
    .toBuffer();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png", ...cache } });
}
