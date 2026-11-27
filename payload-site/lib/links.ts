// Freie Link-Ziele (fields/link.ts, Typ „Adresse“): erlaubt sind nur
// http(s):, mailto:, tel:, relative Pfade und Sprungmarken (#…). Alles andere
// (javascript:, data:, vbscript: …) lehnt das Admin-Panel beim Speichern ab,
// und blocks/mappers.ts verwirft es beim Rendern.
import { safeInternalPath } from "./paths.ts";

const allowedSchemes = new Set(["http:", "https:", "mailto:", "tel:"]);

/** Sicheres Ziel oder `null` */
export function safeLinkUrl(url: string | null | undefined): string | null {
  const value = (url ?? "").trim();
  // Steuerzeichen und Backslashes: Browser entfernen bzw. deuten sie (z. B. „java\tscript:“, „/\host“).
  if (!value || /[\u0000-\u001f\u007f\\]/.test(value)) return null;
  if (value.startsWith("#")) return value;
  if (value.startsWith("/")) return safeInternalPath(value);
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value);
  if (!scheme) return value; // relativer Pfad wie „kontakt“ oder „./preise“
  if (!allowedSchemes.has(scheme[1].toLowerCase() + ":")) return null;
  if (/^https?:/i.test(value)) {
    try {
      new URL(value);
    } catch {
      return null;
    }
  }
  return value;
}

/** Prüfung des Felds `url` beim Speichern (Fehlertext am Feld) */
export function validateLinkUrl(value: unknown): true | string {
  if (value === null || value === undefined || value === "") return true;
  return typeof value === "string" && safeLinkUrl(value)
    ? true
    : "Erlaubt sind https://…, mailto:…, tel:…, ein Pfad wie /kontakt oder eine Sprungmarke wie #formular.";
}
