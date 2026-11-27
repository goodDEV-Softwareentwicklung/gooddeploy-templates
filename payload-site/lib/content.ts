// Inhalte aus dem CMS lesen (Local API von Payload, ohne HTTP-Umweg). React
// `cache` verhindert doppelte Abfragen innerhalb einer Anfrage.
import config from "@payload-config";
import { headers } from "next/headers";
import { getPayload } from "payload";
import { cache } from "react";
import type { Page, ReusableBlock, SiteSetting } from "../payload-types.ts";

const payloadClient = () => getPayload({ config });

export const getSiteSettings = cache(async (): Promise<SiteSetting> => {
  const payload = await payloadClient();
  // Rechte wie ohne Anmeldung: Menüpunkte auf unveröffentlichte Seiten bleiben ohne Ziel.
  return payload.findGlobal({ slug: "site-settings", depth: 1, overrideAccess: false });
});

// Angemeldetes Konto der Anfrage (Cookie des Admin-Panels) oder null.
export const currentUser = cache(async () => {
  const payload = await payloadClient();
  const { user } = await payload.auth({ headers: await headers() });
  return user ?? null;
});

/**
 * Seite nach Adresse; Tiefe 2: Seite → Modul → Verweis (z. B. Person) mit Bild.
 * Ohne `draft` immer der veröffentlichte Stand, auch für Angemeldete. Mit
 * `draft` (Live-Vorschau) der neueste Entwurf, aber nur mit Anmeldung: Payload
 * prüft die Rechte des Kontos, ohne Konto bleibt es beim veröffentlichten Stand.
 */
export const findPage = cache(async (slug: string, draft = false): Promise<Page | null> => {
  const payload = await payloadClient();
  const user = draft ? await currentUser() : null;
  if (user) {
    const { docs } = await payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
      draft: true,
      overrideAccess: false,
      user,
    });
    return docs[0] ?? null;
  }
  const { docs } = await payload.find({
    collection: "pages",
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
    limit: 1,
    depth: 2,
    overrideAccess: false,
  });
  return docs[0] ?? null;
});

// Tiefe 3: Modul aus der Bibliothek → Modul → Verweis (z. B. Person) → Bild.
export async function getReusableBlock(id: number): Promise<ReusableBlock | null> {
  const payload = await payloadClient();
  return payload.findByID({ collection: "reusable-blocks", id, depth: 3, disableErrors: true, overrideAccess: false });
}

// Weiterleitung für einen Pfad ohne Seite (schon vereinheitlicht, lib/redirects.ts).
// Tiefe 1, damit Verweise auf Seiten ihre Adresse haben.
export async function findRedirect(path: string) {
  const payload = await payloadClient();
  const { docs } = await payload.find({ collection: "redirects", where: { from: { equals: path } }, limit: 1, depth: 1, overrideAccess: false });
  return docs[0] ?? null;
}
