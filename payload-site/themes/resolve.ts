/**
 * Auflösung Theme → Palette → eigene Farben und Ausgabe als CSS-Variablen.
 * Das Layout schreibt das Ergebnis zur Laufzeit in die Seite; Umschalten im
 * Global „Website“ braucht keinen Build.
 */
import { isColor, overridableColors } from "./colors.ts";
import { componentTokenNames, type ColorTokens, type ComponentTokenName, type OverridableColor, type ThemeDefinition } from "./contract.ts";
import { defaultTheme, registeredThemes, type ThemeId } from "./registry.ts";

export const themes: Readonly<Record<ThemeId, ThemeDefinition>> = Object.fromEntries(
  registeredThemes.map((theme) => [theme.id, theme]),
) as unknown as Record<ThemeId, ThemeDefinition>;

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && Object.hasOwn(themes, value);
}

/** Theme nach Kennung; unbekannt oder leer → Standard-Theme */
export function getTheme(id: string | null | undefined): ThemeDefinition {
  return isThemeId(id) ? themes[id] : themes[defaultTheme];
}

export function isPaletteOf(theme: ThemeDefinition, paletteId: unknown): paletteId is string {
  return typeof paletteId === "string" && Object.hasOwn(theme.palettes, paletteId);
}

/** Palette des Themes; unbekannt oder leer → `defaultPalette` */
export function paletteId(theme: ThemeDefinition, id: string | null | undefined): string {
  return isPaletteOf(theme, id) ? id : theme.defaultPalette;
}

export type ColorOverrides = Partial<Record<OverridableColor, string | null>>;

/** Auswahl aus dem Global „Website“ (Theme, Farbvariante, eigene Farben) */
export type ThemeSelection = {
  theme?: string | null;
  palette?: string | null;
  colors?: ColorOverrides | null;
};

export type ResolvedTheme = {
  theme: ThemeDefinition;
  paletteId: string;
  /** Farben der Palette mit gültigen eigenen Farben */
  colors: ColorTokens;
};

/** Nur gültige Hex-Werte für überschreibbare Farben; alles andere wird verworfen */
export function validOverrides(overrides: ColorOverrides | null | undefined): Partial<ColorTokens> {
  const result: Partial<ColorTokens> = {};
  for (const key of overridableColors) {
    const value = overrides?.[key];
    if (isColor(value)) result[key] = value;
  }
  return result;
}

export function resolveTheme(selection: ThemeSelection | null | undefined = {}): ResolvedTheme {
  const theme = getTheme(selection?.theme);
  const id = paletteId(theme, selection?.palette);
  return {
    theme,
    paletteId: id,
    colors: { ...theme.palettes[id].colors, ...validOverrides(selection?.colors) },
  };
}

/** Farben aus Theme und Farbvariante ohne eigene Farben (Vorgaben im Farbwähler) */
export function paletteColors(theme: string | null | undefined, palette: string | null | undefined): ColorTokens {
  return resolveTheme({ theme, palette }).colors;
}

/** Schrift-Kennung → CSS-Variable, die die Laufzeit des Themes setzt */
const fontVariable = (name: string) => `var(--font-${name.replace(/[^a-z0-9-]/g, "")})`;

/** Zeichen, mit denen ein Wert die Regel verlassen könnte */
const unsafeValue = /[;{}<>]/;

/** Alle Tokens als CSS-Variablen: Farben, Typografie, Layout, Komponenten */
export function themeVariables({ theme, colors }: ResolvedTheme): Record<string, string> {
  const { typography: type, layout } = theme;
  const variables: Record<string, string> = {
    "--primary": colors.primary,
    "--primary-ink": colors.primaryInk,
    "--accent": colors.accent,
    "--accent-ink": colors.accentInk,
    "--bg": colors.bg,
    "--surface": colors.surface,
    "--dark": colors.dark,
    "--dark-ink": colors.darkInk,
    "--ink": colors.ink,
    "--muted": colors.muted,
    "--line": colors.line,
    "--error": colors.error,
    "--radius": layout.radius,
    "--font-head": fontVariable(type.fontHead),
    "--font-body": fontVariable(type.fontBody),
    "--head-weight": String(type.headWeight),
    "--head-transform": type.headTransform,
    "--head-tracking": type.headTracking,
    "--section-space": layout.sectionSpace,
    "--container-width": layout.containerWidth,
  };
  for (const [key, value] of Object.entries(theme.components) as [ComponentTokenName, string][]) {
    if (Object.hasOwn(componentTokenNames, key) && value && !unsafeValue.test(value)) {
      variables[componentTokenNames[key]] = value;
    }
  }
  return variables;
}

/** CSS-Regel für :root; Farben sind geprüft, alle übrigen Werte kommen aus dem Code */
/**
 * Dunkler Modus (folgt der Systemeinstellung): gleiche Grundflächen für alle
 * Themes; Primär- und Akzentfarbe bleiben, Links und Dachzeilen auf dunklem
 * Grund nehmen die Akzentfarbe (ui/site.css). tests/themes.test.ts prüft die
 * Kontraste für alle Paletten.
 */
export const darkColors = {
  bg: "#121417",
  surface: "#1b1e22",
  ink: "#eceef0",
  muted: "#a6adb5",
  line: "#2e333a",
  dark: "#0b0d0f",
  darkInk: "#eceef0",
} as const satisfies Partial<ColorTokens>;

const declarations = (variables: Record<string, string>) =>
  Object.entries(variables)
    .filter(([, value]) => !unsafeValue.test(value))
    .map(([name, value]) => `${name}:${value}`)
    .join(";");

export function themeCss(resolved: ResolvedTheme): string {
  const dark = {
    "--bg": darkColors.bg,
    "--surface": darkColors.surface,
    "--ink": darkColors.ink,
    "--muted": darkColors.muted,
    "--line": darkColors.line,
    "--dark": darkColors.dark,
    "--dark-ink": darkColors.darkInk,
  };
  return `:root{${declarations(themeVariables(resolved))}}@media (prefers-color-scheme: dark){:root{${declarations(dark)}}}`;
}

type Option = { value: string; label: string };

/** Auswahl „Theme“ im Admin, aus der Registry */
export const themeOptions: Option[] = registeredThemes.map((t) => ({
  value: t.id,
  label: `${t.label} – ${t.description}`,
}));

/** Alle Farbvarianten (Werteliste der Auswahl; im Admin nach Theme gefiltert) */
export const paletteOptions: Option[] = registeredThemes.flatMap((t) =>
  Object.entries(t.palettes).map(([value, p]) => ({ value, label: p.label })),
);
