/**
 * Alle Themes an einer Stelle: Auswahl im Admin, Auflösung und Tests lesen
 * von hier. Ein neues Theme: Datei unter themes/ (erfüllt ThemeDefinition),
 * hier eintragen, Schriften in themes/runtime.ts.
 */
import { bold } from "./bold.ts";
import { classic } from "./classic.ts";
import type { ThemeDefinition } from "./contract.ts";
import { whitelabel } from "./whitelabel.ts";

export const registeredThemes = [whitelabel, classic, bold] as const satisfies readonly ThemeDefinition[];

export type ThemeId = (typeof registeredThemes)[number]["id"];

/** Standard, wenn kein oder ein unbekanntes Theme gewählt ist */
export const defaultTheme: ThemeId = "whitelabel";
