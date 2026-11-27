/**
 * Farbkontexte. Jede Fläche mit eigener Farbe trägt eine dieser globalen
 * Klassen aus app/(site)/globals.css: Sie setzt Textfarbe und die
 * Kontext-Variablen für Links, gedämpften Text, Dachzeile und Knöpfe darin.
 * Helle Flächen (Kacheln, Karten) setzen `light` und erben so nie die helle
 * Schrift eines dunklen oder farbigen Abschnitts. tests/themes.test.ts prüft
 * die Kontraste der Paletten.
 */
export const toneClasses = {
  light: "tone-light",
  primary: "tone-primary",
  dark: "tone-dark",
} as const;

export type ToneContext = keyof typeof toneClasses;

export type SectionTone = "none" | "surface" | "primary" | "dark";


/** Farbkontext je Hintergrund eines Abschnitts (bzw. einer Fläche mit diesem Ton) */
export const toneContextOf: Record<SectionTone, ToneContext> = {
  none: "light",
  surface: "light",
  primary: "primary",
  dark: "dark",
};

/** Globale Klasse des Farbkontexts für einen Ton */
export function toneClass(tone: SectionTone): string {
  return toneClasses[toneContextOf[tone]];
}
