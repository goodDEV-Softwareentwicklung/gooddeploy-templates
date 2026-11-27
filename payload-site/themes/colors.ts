/**
 * Farbwerte und Kontrast nach WCAG 2.x (relative Luminanz). Reine Funktionen,
 * genutzt von tests/themes.test.ts.
 */
import type { ColorTokens, OverridableColor } from "./contract.ts";

const colorPattern = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;

/** Hex-Farbe `#rgb` oder `#rrggbb` (nur solche Werte landen im CSS) */
export function isColor(value: unknown): value is string {
  return typeof value === "string" && colorPattern.test(value);
}

/** Kanäle 0–255 einer Hex-Farbe; `undefined` bei ungültigem Wert */
export function hexToRgb(hex: string): [number, number, number] | undefined {
  if (!isColor(hex)) return undefined;
  const digits = hex.length === 4 ? [...hex.slice(1)].map((d) => d + d) : hex.slice(1).match(/../g)!;
  return digits.map((d) => parseInt(d, 16)) as [number, number, number];
}

/** Relative Luminanz nach WCAG 2.x, 0 (schwarz) bis 1 (weiß) */
export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) throw new Error(`Keine Hex-Farbe: ${hex}`);
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Kontrastverhältnis (1 bis 21), unabhängig von der Reihenfolge */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** WCAG AA für normalen Text */
export const AA_MIN_CONTRAST = 4.5;

export function meetsAA(a: string, b: string): boolean {
  return contrastRatio(a, b) >= AA_MIN_CONTRAST;
}

/** Paare Text/Fläche, die jede Palette mindestens mit AA erfüllen muss */
export const contrastPairs = [
  ["ink", "bg"],
  ["muted", "bg"],
  ["primaryInk", "primary"],
  ["accentInk", "accent"],
  ["darkInk", "dark"],
] as const satisfies readonly (readonly [keyof ColorTokens, keyof ColorTokens])[];

/** Bezeichnungen der Farbrollen im Admin */
export const colorLabels: Record<keyof ColorTokens, string> = {
  primary: "Primärfarbe",
  primaryInk: "Text auf Primär",
  accent: "Akzentfarbe",
  accentInk: "Text auf Akzent",
  bg: "Seitenhintergrund",
  surface: "Fläche",
  dark: "Dunkle Fläche",
  darkInk: "Text auf Dunkel",
  ink: "Text",
  muted: "Gedämpfter Text",
  line: "Linie",
  error: "Fehler",
};

/** Gegenfarbe je überschreibbarer Farbe (Fläche und Text darauf) */
export const contrastPartner: Record<OverridableColor, keyof ColorTokens> = {
  primary: "primaryInk",
  primaryInk: "primary",
  accent: "accentInk",
  accentInk: "accent",
  bg: "ink",
  dark: "darkInk",
  darkInk: "dark",
};

export const overridableColors = Object.keys(contrastPartner) as OverridableColor[];
