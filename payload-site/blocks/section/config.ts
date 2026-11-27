import type { ArrayFieldValidation, Block, FieldHook } from "payload";
import { headingFields } from "../../fields/heading.ts";
import { blockAdmin, blockGroups } from "../shared.ts";
import { columnBlocks } from "../registry.ts";
import { columnCount, sectionLayoutOptions, type SectionLayout } from "./layouts.ts";

/** Fehlende Spalten beim Speichern ergänzen, damit das Layout sofort passt. */
const padColumns: FieldHook = ({ value, siblingData }) => {
  const wanted = columnCount(siblingData?.layout as SectionLayout | undefined);
  const columns = Array.isArray(value) ? [...value] : [];
  while (columns.length < wanted) columns.push({ blocks: [] });
  return columns;
};

const validateColumns: ArrayFieldValidation = (value, { siblingData }) => {
  const layout = (siblingData as { layout?: SectionLayout } | undefined)?.layout;
  const wanted = columnCount(layout);
  const count = Array.isArray(value) ? value.length : (value ?? 0);
  if (count > wanted) {
    return `Das Layout hat ${wanted} Spalte(n), es gibt aber ${count}. Bitte überzählige Spalten leeren und entfernen oder ein anderes Layout wählen.`;
  }
  return true;
};

/**
 * Layout-Abschnitt: Hintergrund, Breite und Abstand liegen hier, nicht an
 * jedem Modul. Höchstens zwei Ebenen: Seite → Abschnitt → Modul (Module können
 * eigene Einträge haben, aber keine weiteren Abschnitte).
 */
export const Section: Block = {
  slug: "section",
  interfaceName: "SectionBlock",
  labels: { singular: "Abschnitt (Layout)", plural: "Abschnitte" },
  admin: blockAdmin("section", blockGroups.structure, "Abschnitt mit Spalten, darin weitere Module"),
  fields: [
    {
      type: "collapsible",
      label: "Layout und Gestaltung",
      admin: { initCollapsed: false },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "layout",
              label: "Spalten",
              type: "select",
              required: true,
              defaultValue: "oneColumn",
              options: sectionLayoutOptions,
              admin: { width: "34%" },
            },
            {
              name: "background",
              label: "Hintergrund",
              type: "select",
              defaultValue: "none",
              options: [
                { value: "none", label: "Seitenhintergrund" },
                { value: "surface", label: "Fläche (hell)" },
                { value: "primary", label: "Primärfarbe" },
                { value: "dark", label: "Dunkel" },
              ],
              admin: { width: "33%" },
            },
            {
              name: "width",
              label: "Breite",
              type: "select",
              defaultValue: "normal",
              options: [
                { value: "narrow", label: "Schmal" },
                { value: "normal", label: "Normal" },
                { value: "wide", label: "Breit" },
              ],
              admin: { width: "33%" },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "spacing",
              label: "Abstand oben/unten",
              type: "select",
              defaultValue: "normal",
              options: [
                { value: "none", label: "Kein" },
                { value: "small", label: "Klein" },
                { value: "normal", label: "Normal" },
                { value: "large", label: "Groß" },
              ],
              admin: { width: "34%" },
            },
            {
              name: "verticalAlign",
              label: "Spalten ausrichten",
              type: "select",
              defaultValue: "top",
              options: [
                { value: "top", label: "Oben" },
                { value: "center", label: "Mittig" },
              ],
              admin: { width: "33%" },
            },
            {
              name: "anchor",
              label: "Sprungmarke",
              type: "text",
              admin: { width: "33%", description: "ohne #, z. B. leistungen" },
            },
          ],
        },
      ],
    },
    ...headingFields(),
    {
      name: "columns",
      label: "Spalten",
      type: "array",
      minRows: 1,
      maxRows: 4,
      labels: { singular: "Spalte", plural: "Spalten" },
      admin: {
        description: "Die Anzahl ergibt sich aus dem Layout; fehlende Spalten werden beim Speichern ergänzt.",
      },
      hooks: { beforeValidate: [padColumns] },
      validate: validateColumns,
      fields: [
        {
          name: "blocks",
          label: "Module",
          type: "blocks",
          blocks: columnBlocks,
          labels: { singular: "Modul", plural: "Module" },
        },
      ],
    },
  ],
};
