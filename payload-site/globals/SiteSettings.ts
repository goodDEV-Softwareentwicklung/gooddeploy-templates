// Global „Website“: Name und Logo, Menü, Fuß und Gestaltung (Theme, Farben).
// Layout und Module lesen es über lib/content.ts.
import type { Field, GlobalConfig } from "payload";
import { array } from "payload/shared";
import { linkField } from "../fields/link.ts";
import { colorLabels, isColor } from "../themes/colors.ts";
import type { OverridableColor } from "../themes/contract.ts";
import { defaultTheme } from "../themes/registry.ts";
import { getTheme, isPaletteOf, paletteOptions, themeOptions } from "../themes/resolve.ts";
import { iconOptions } from "../ui/icons.ts";

/** Eigene Farbe als Hex-Wert; leer = Wert aus Theme und Farbvariante */
const colorField = (name: OverridableColor): Field => ({
  name,
  label: colorLabels[name],
  type: "text",
  admin: { width: "50%", placeholder: "#1f5f6b" },
  validate: (value: string | null | undefined) => (!value || isColor(value) ? true : "Farbe als Hex-Wert, z. B. #1f5f6b"),
});

/** Höchstzahl der Unterpunkte je Menüpunkt */
export const maxSubmenuItems = 8;

const loggedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user);

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Website",
  admin: { group: "Verwaltung", description: "Name, Logo, Menü, Fuß und Gestaltung der Website" },
  access: { read: () => true, update: loggedIn },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Allgemein",
          fields: [
            {
              name: "siteName",
              label: "Name (vollständig)",
              type: "text",
              required: true,
              admin: { description: "z. B. Musterfirma GmbH; steht im Fuß und im Titel der Seiten" },
            },
            {
              type: "row",
              fields: [
                { name: "shortName", label: "Kurzname (neben dem Logo)", type: "text", admin: { width: "50%" } },
                {
                  name: "tagline",
                  label: "Zusatz unter dem Kurznamen",
                  type: "text",
                  admin: { width: "50%", description: "z. B. der Ort" },
                },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "logo", label: "Logo", type: "upload", relationTo: "media", admin: { width: "50%" } },
                {
                  name: "logoIcon",
                  label: "Icon, wenn kein Logo",
                  type: "select",
                  options: [...iconOptions],
                  defaultValue: "briefcase",
                  admin: { width: "50%" },
                },
              ],
            },
            {
              name: "logoDark",
              label: "Logo für dunkle Flächen",
              type: "upload",
              relationTo: "media",
              admin: { description: "Helle Fassung des Logos für den dunklen Fuß. Ohne Bild steht dort das normale Logo." },
            },
            { name: "description", label: "Standard-Beschreibung für Suchmaschinen", type: "textarea", maxLength: 300 },
          ],
        },
        {
          label: "Menü",
          fields: [
            {
              name: "navigation",
              label: "Hauptmenü",
              type: "array",
              maxRows: 8,
              labels: { singular: "Menüpunkt", plural: "Menüpunkte" },
              admin: {
                description: "Ein Menüpunkt kann Unterpunkte haben (eine Ebene). Mit Ziel „Kein Ziel“ gruppiert er nur seine Unterpunkte.",
              },
              fields: [
                linkField({ appearance: false, required: true, allowNoTarget: true }),
                {
                  name: "children",
                  label: "Unterpunkte",
                  type: "array",
                  maxRows: maxSubmenuItems,
                  labels: { singular: "Unterpunkt", plural: "Unterpunkte" },
                  admin: { initCollapsed: true },
                  validate: (value, options) => {
                    const sibling = options.siblingData as { link?: { type?: string | null } };
                    if (sibling?.link?.type === "none" && !value?.length)
                      return "Ein Menüpunkt ohne Ziel braucht mindestens einen Unterpunkt.";
                    // eigene Prüfung ersetzt die Standardprüfung: Anzahl (maxRows) hier mitprüfen
                    return array(value, options);
                  },
                  fields: [linkField({ appearance: false, required: true })],
                },
              ],
            },
            {
              name: "headerActions",
              label: "Knöpfe neben dem Menü",
              type: "array",
              maxRows: 2,
              labels: { singular: "Knopf", plural: "Knöpfe" },
              admin: { description: "z. B. „Kontakt“; auf dem Smartphone unten im Menü" },
              fields: [linkField({ required: true })],
            },
          ],
        },
        {
          label: "Fuß",
          fields: [
            { name: "contactAddress", label: "Adresse", type: "textarea" },
            {
              type: "row",
              fields: [
                { name: "contactEmail", label: "E-Mail", type: "email", admin: { width: "50%" } },
                { name: "contactPhone", label: "Telefon", type: "text", admin: { width: "50%" } },
              ],
            },
            {
              type: "row",
              fields: [
                linkField({ name: "imprint", label: "Impressum", appearance: false }),
                linkField({ name: "privacy", label: "Datenschutz", appearance: false }),
              ],
            },
            {
              name: "footerLinks",
              label: "Weitere Links unter „Rechtliches“",
              type: "array",
              maxRows: 6,
              labels: { singular: "Link", plural: "Links" },
              fields: [linkField({ appearance: false, required: true })],
            },
          ],
        },
        {
          label: "Gestaltung",
          fields: [
            { name: "theme", label: "Theme", type: "select", required: true, defaultValue: defaultTheme, options: themeOptions },
            {
              name: "palette",
              label: "Farbvariante",
              type: "select",
              options: paletteOptions,
              // nur die Varianten des gewählten Themes
              filterOptions: ({ data, options }) =>
                options.filter((option) => isPaletteOf(getTheme(data?.theme), typeof option === "string" ? option : option.value)),
              validate: (value: string | null | undefined, { data }: { data: { theme?: string | null } }) =>
                !value || isPaletteOf(getTheme(data?.theme), value) ? true : "Diese Farbvariante gehört nicht zum gewählten Theme.",
              admin: { description: "leer = Standard des Themes" },
            },
            {
              name: "colors",
              label: "Eigene Farben (optional, überschreiben die Farbvariante)",
              type: "group",
              admin: {
                description:
                  "Leer = Wert aus Theme und Farbvariante. Fläche und Text darauf brauchen genug Kontrast (WCAG AA: mindestens 4,5:1). Gilt für den hellen Modus; im dunklen Modus bleiben die Grundflächen dunkel.",
              },
              fields: [
                { type: "row", fields: [colorField("primary"), colorField("primaryInk")] },
                { type: "row", fields: [colorField("accent"), colorField("accentInk")] },
                { type: "row", fields: [colorField("dark"), colorField("darkInk")] },
                { type: "row", fields: [colorField("bg")] },
              ],
            },
          ],
        },
      ],
    },
  ],
};
