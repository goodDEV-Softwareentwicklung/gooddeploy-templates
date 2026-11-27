// Pfad ohne Seite: Weiterleitung aus der Sammlung `redirects`, sonst 404.
// Next.js leitet aus Server-Komponenten mit 308 (Eintrag 301) bzw. 307
// (Eintrag 302) weiter; Suchmaschinen behandeln sie wie 301 und 302.
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { findRedirect } from "../../lib/content.ts";
import { normalizeRedirectPath, redirectTarget } from "../../lib/redirects.ts";

export async function notFoundOrRedirect(path: string): Promise<never> {
  const from = normalizeRedirectPath(path);
  const target = from && from !== "/" ? redirectTarget(await findRedirect(from)) : null;
  if (!target) notFound();
  if (target.permanent) permanentRedirect(target.href);
  redirect(target.href);
}
