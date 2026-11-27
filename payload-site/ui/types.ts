/**
 * Neutrale Props der Darstellungsschicht. ui/ kennt Payload nicht: Die
 * Module unter blocks/ bilden Payload-Daten auf diese Typen ab.
 */
import type { ReactNode } from "react";

export type UiImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** Fokuspunkt in Prozent (0–100) */
  focalX?: number;
  focalY?: number;
};

export type UiLinkAppearance = "accent" | "primary" | "outline";

export type UiLink = {
  href: string;
  label: string;
  newTab?: boolean;
  appearance?: UiLinkAppearance;
};

export type UiHeading = {
  eyebrow?: string;
  title?: string;
  intro?: string;
};

/** Fertig gerenderter Fließtext (z. B. aus Lexical), ui/ setzt ihn nur ein */
export type UiRichText = ReactNode;
