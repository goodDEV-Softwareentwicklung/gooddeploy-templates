import type { UiLink } from "./types.ts";

/**
 * Punkt der Hauptnavigation: Link mit optionalen Unterpunkten (eine Ebene).
 * Ohne `href` ist der Punkt nur eine Gruppe und braucht Unterpunkte.
 */
export type UiNavItem = {
  label: string;
  href?: string;
  newTab?: boolean;
  children: UiLink[];
};

/** Alle Ziele flach (z. B. Seitenliste im Fuß): Punkt mit Ziel, sonst seine Unterpunkte */
export function flattenNavigation(items: UiNavItem[]): UiLink[] {
  return items.flatMap((item) => (item.href ? [{ href: item.href, label: item.label, newTab: item.newTab }] : item.children));
}
