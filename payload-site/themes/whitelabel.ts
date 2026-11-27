/**
 * Theme „Neutral“ (Standard): moderne Grotesk, ruhige Farben, ohne Farben oder
 * Logo einer echten Marke. Ausgangspunkt für die Farben deines Kunden.
 */
import type { ThemeDefinition } from "./contract.ts";

export const whitelabel = {
  id: "whitelabel",
  label: "Neutral",
  description: "Moderne Grotesk, ruhige Farben, weiche Ecken",
  typography: {
    fontHead: "bricolage",
    fontBody: "inter",
    headWeight: 700,
    headTransform: "none",
    headTracking: "-0.015em",
  },
  layout: { radius: "10px", sectionSpace: "88px", containerWidth: "1180px" },
  defaultPalette: "sun",
  palettes: {
    // Kontraste geprüft: Weiß auf Petrol 7,2; Text auf Sonne 8,5; Text auf Grund 14,6
    sun: {
      label: "Petrol und Sonne",
      colors: {
        primary: "#1f5f6b",
        primaryInk: "#ffffff",
        accent: "#f2b33d",
        accentInk: "#1d2328",
        bg: "#f7f5f0",
        surface: "#ffffff",
        dark: "#123b43",
        darkInk: "#f7f5f0",
        ink: "#1d2328",
        muted: "#5a6470",
        line: "#e3dfd6",
        error: "#b3261e",
      },
    },
    // Weiß auf Pflaume 10,5; Text auf Minze 7,0
    plum: {
      label: "Pflaume und Minze",
      colors: {
        primary: "#5b2a6e",
        primaryInk: "#ffffff",
        accent: "#4fbf9f",
        accentInk: "#1f1a24",
        bg: "#f8f6f9",
        surface: "#ffffff",
        dark: "#2e1538",
        darkInk: "#f8f6f9",
        ink: "#1f1a24",
        muted: "#625a69",
        line: "#e6e0ea",
        error: "#b3261e",
      },
    },
  },
  components: {
    btnRadius: "10px",
    logoRadius: "12px",
    heroOverlay:
      "linear-gradient(90deg, color-mix(in srgb, var(--primary) 92%, transparent) 0%, color-mix(in srgb, var(--primary) 70%, transparent) 60%, color-mix(in srgb, var(--primary) 25%, transparent) 100%)",
    cardBorder: "1px solid var(--line)",
    cardShadow: "0 6px 20px color-mix(in srgb, var(--ink) 8%, transparent)",
    cardShadowHover: "0 12px 28px color-mix(in srgb, var(--ink) 12%, transparent)",
    quoteRadius: "14px",
  },
} as const satisfies ThemeDefinition;
