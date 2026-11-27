/**
 * Schriften je Theme (nur Frontend: next/font gehört nicht in payload.config,
 * Migrationen oder Tests). Das Layout setzt die Klassen des aktiven Themes.
 */
import { barlowCondensed, bricolageGrotesque, cormorantGaramond, inter } from "../fonts/index.ts";
import type { ThemeId } from "./registry.ts";

export const themeFonts: Record<ThemeId, { variable: string }[]> = {
  whitelabel: [bricolageGrotesque, inter],
  classic: [cormorantGaramond, inter],
  bold: [barlowCondensed, inter],
};
