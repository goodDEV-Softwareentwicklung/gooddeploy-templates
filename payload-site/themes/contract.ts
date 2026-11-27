/**
 * Vertrag für Themes. Ein Theme ist eine Datei unter themes/ und erfüllt
 * `ThemeDefinition`. ui/ kennt kein Theme beim Namen; es liest nur
 * CSS-Variablen (Tokens). Schriften lädt themes/runtime.ts (nur Frontend).
 */

/**
 * Kennung einer Schrift (Kleinbuchstaben, z. B. `barlow`). themes/runtime.ts
 * lädt sie mit `next/font/local` unter der CSS-Variable `--font-<kennung>`.
 */
export type FontName = string;

/** Farbrollen; eine Palette liefert alle, die Website darf einzelne überschreiben */
export type ColorTokens = {
  primary: string;
  primaryInk: string;
  accent: string;
  accentInk: string;
  bg: string;
  surface: string;
  dark: string;
  darkInk: string;
  ink: string;
  muted: string;
  line: string;
  error: string;
};

/** Farben, die im Global „Website“ überschrieben werden dürfen */
export type OverridableColor = "primary" | "primaryInk" | "accent" | "accentInk" | "bg" | "dark" | "darkInk";

export type Palette = {
  /** Anzeige im Admin, z. B. „Grün und Gelb“ */
  label: string;
  colors: ColorTokens;
};

export type TypographyTokens = {
  fontHead: FontName;
  fontBody: FontName;
  headWeight: number;
  headTransform: "none" | "uppercase";
  headTracking: string;
};

export type LayoutTokens = {
  radius: string;
  /** Grundabstand der Abschnitte oben und unten */
  sectionSpace: string;
  containerWidth: string;
};

/**
 * Komponenten-Tokens: Abweichungen einzelner Komponenten als CSS-Variable. Jede ui-Komponente liest ihre
 * Variablen mit Standardwert (`var(--card-shadow, …)`); ein Theme setzt nur,
 * was abweicht. Werte sind CSS-Ausdrücke und dürfen andere Tokens nutzen
 * (z. B. `var(--accent)`).
 */
export const componentTokenNames = {
  // Knöpfe
  btnRadius: "--btn-radius",
  btnFont: "--btn-font",
  btnFontSize: "--btn-font-size",
  btnFontSizeLg: "--btn-font-size-lg",
  btnPaddingLg: "--btn-padding-lg",
  btnTransform: "--btn-transform",
  btnTracking: "--btn-tracking",
  btnBorderColor: "--btn-border-color",
  btnShadow: "--btn-shadow",
  btnShadowHover: "--btn-shadow-hover",
  btnHoverTransform: "--btn-hover-transform",
  btnOutlineBg: "--btn-outline-bg",
  btnOutlineColor: "--btn-outline-color",
  // Logo
  logoRadius: "--logo-radius",
  logoMarkTransform: "--logo-mark-transform",
  logoMarkBg: "--logo-mark-bg",
  logoMarkColor: "--logo-mark-color",
  logoMarkBorder: "--logo-mark-border",
  /** Breite und Höhe des Logo-Zeichens (Standard 44px), z. B. für ein breites Logo */
  logoMarkWidth: "--logo-mark-width",
  logoMarkHeight: "--logo-mark-height",
  logoMarkPadding: "--logo-mark-padding",
  /** `none` blendet Name und Zusatz neben dem Logo aus, wenn das Logo den Namen schon enthält */
  logoTextDisplay: "--logo-text-display",
  /**
   * Logo-Zeichen auf dunkler Fläche (Fuß). Ohne Wert gelten die Tokens oben. Für Logos als Bild
   * mit eigenem hellen Hintergrund: helle Plakette mit Innenabstand statt eines harten Kastens.
   */
  logoMarkDarkBg: "--logo-mark-dark-bg",
  logoMarkDarkPadding: "--logo-mark-dark-padding",
  logoMarkDarkRadius: "--logo-mark-dark-radius",
  // Hero und Überschriften
  heroClip: "--hero-clip",
  heroOverlay: "--hero-overlay",
  heroSplitBg: "--hero-split-bg",
  heroTitleSize: "--hero-title-size",
  /** Seitentitel im Kopf der Unterseiten (Standard clamp(2.4rem, 5vw, 4.2rem)) */
  heroPageTitleSize: "--hero-page-title-size",
  heroTitleLineHeight: "--hero-title-line-height",
  heroTitleWeight: "--hero-title-weight",
  heroTitleStyle: "--hero-title-style",
  heroImageRadius: "--hero-image-radius",
  heroImageTransform: "--hero-image-transform",
  heroImageBorder: "--hero-image-border",
  heroImageShadow: "--hero-image-shadow",
  heroStickerBorder: "--hero-sticker-border",
  heroStickerTransform: "--hero-sticker-transform",
  /** Breite der feinen Linien links und rechts der Dachzeile im Hero (0 = keine) */
  eyebrowRule: "--eyebrow-rule",
  titleWeight: "--title-weight",
  // Karten und Flächen
  cardBg: "--card-bg",
  cardBorder: "--card-border",
  cardBorderTop: "--card-border-top",
  cardShadow: "--card-shadow",
  cardShadowHover: "--card-shadow-hover",
  cardHoverTransform: "--card-hover-transform",
  cardBodyPaddingInline: "--card-body-padding-inline",
  cardFrameOutline: "--card-frame-outline",
  cardFrameBorderBottom: "--card-frame-border-bottom",
  cardFrameOutlineOffset: "--card-frame-outline-offset",
  cardFrameMargin: "--card-frame-margin",
  /** Icon-Kacheln und Formular-Widgets */
  panelBorder: "--panel-border",
  panelShadow: "--panel-shadow",
  // Zitat
  quoteRadius: "--quote-radius",
  quoteBorder: "--quote-border",
  quoteShadow: "--quote-shadow",
  quoteTextSize: "--quote-text-size",
  quoteTextStyle: "--quote-text-style",
  // Kennzahlen-Band
  bandBg: "--band-bg",
  bandTileBorderWidth: "--band-tile-border-width",
  // Galerie
  galleryImageBorder: "--gallery-image-border",
  /** Neigung der Galeriebilder (ungerade −, gerade +), z. B. 2deg */
  galleryTilt: "--gallery-tilt",
} as const;

export type ComponentTokenName = keyof typeof componentTokenNames;
export type ComponentTokens = Partial<Record<ComponentTokenName, string>>;

export type ThemeDefinition = {
  /** Kennung, gleich dem Dateinamen, z. B. `bold` */
  id: string;
  label: string;
  description: string;
  typography: TypographyTokens;
  layout: LayoutTokens;
  /** 2 bis 4 Paletten; Schlüssel = Kennung (z. B. `green`) */
  palettes: Record<string, Palette>;
  defaultPalette: string;
  /** Abweichungen einzelner Komponenten vom Standard */
  components: ComponentTokens;
};
