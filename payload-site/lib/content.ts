// Inhalte aus dem CMS lesen (Local API von Payload, ohne HTTP-Umweg). React
// `cache` verhindert doppelte Abfragen innerhalb einer Anfrage.
import config from "@payload-config";
import { getPayload } from "payload";
import { cache } from "react";
import type { Page, ReusableBlock, SiteSetting } from "../payload-types.ts";

const payloadClient = () => getPayload({ config });

export const getSiteSettings = cache(async (): Promise<SiteSetting> => {
  const payload = await payloadClient();
  return payload.findGlobal({ slug: "site-settings", depth: 1 });
});

// Tiefe 2: Seite → Modul → Verweis (z. B. Person) mit Bild.
export const findPage = cache(async (slug: string): Promise<Page | null> => {
  const payload = await payloadClient();
  const { docs } = await payload.find({ collection: "pages", where: { slug: { equals: slug } }, limit: 1, depth: 2 });
  return docs[0] ?? null;
});

// Tiefe 3: Modul aus der Bibliothek → Modul → Verweis (z. B. Person) → Bild.
export async function getReusableBlock(id: number): Promise<ReusableBlock | null> {
  const payload = await payloadClient();
  return payload.findByID({ collection: "reusable-blocks", id, depth: 3, disableErrors: true });
}

// Weiterleitung für einen Pfad ohne Seite (schon vereinheitlicht, lib/redirects.ts).
// Tiefe 1, damit Verweise auf Seiten ihre Adresse haben.
export async function findRedirect(path: string) {
  const payload = await payloadClient();
  const { docs } = await payload.find({ collection: "redirects", where: { from: { equals: path } }, limit: 1, depth: 1 });
  return docs[0] ?? null;
}
