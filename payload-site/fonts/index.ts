/**
 * Schriften der Themes, lokal eingebunden: Der Build braucht kein Netz und
 * Besucher laden nichts von Google. Dateien: Fontsource 5.3.0, Teilmenge
 * „latin“ (enthält Umlaute, ß und €). Lizenzen (SIL OFL 1.1) in licenses/,
 * Herkunft in README.md dieses Ordners.
 *
 * next/font/local verlangt Literale direkt im Aufruf, daher keine Hilfsfunktion.
 */
import localFont from "next/font/local";

export const barlowCondensed = localFont({
  src: [
    { path: "./files/barlow-condensed-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./files/barlow-condensed-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-barlow",
  preload: false,
});

export const bricolageGrotesque = localFont({
  src: "./files/bricolage-grotesque-latin-wght-normal.woff2",
  weight: "200 800",
  variable: "--font-bricolage",
  preload: false,
});

export const cormorantGaramond = localFont({
  src: "./files/cormorant-garamond-latin-wght-normal.woff2",
  weight: "300 700",
  variable: "--font-cormorant",
  preload: false,
});

export const inter = localFont({
  src: "./files/inter-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-inter",
  preload: false,
});
