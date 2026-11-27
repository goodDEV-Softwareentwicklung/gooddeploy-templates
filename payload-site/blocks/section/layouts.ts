/** Spalten-Layouts des Abschnitts; Breiten als CSS-Grid-Spalten. */
export const sectionLayouts = {
  oneColumn: { label: "1 Spalte", columns: ["1fr"] },
  halfHalf: { label: "2 Spalten (1/2 + 1/2)", columns: ["1fr", "1fr"] },
  twoThirdsOneThird: { label: "2 Spalten (2/3 + 1/3)", columns: ["2fr", "1fr"] },
  oneThirdTwoThirds: { label: "2 Spalten (1/3 + 2/3)", columns: ["1fr", "2fr"] },
  thirds: { label: "3 Spalten (je 1/3)", columns: ["1fr", "1fr", "1fr"] },
  quarters: { label: "4 Spalten (je 1/4)", columns: ["1fr", "1fr", "1fr", "1fr"] },
} as const;

export type SectionLayout = keyof typeof sectionLayouts;

export const sectionLayoutOptions = Object.entries(sectionLayouts).map(([value, { label }]) => ({
  value,
  label,
}));

export function columnCount(layout: SectionLayout | null | undefined): number {
  return sectionLayouts[layout ?? "oneColumn"]?.columns.length ?? 1;
}

export function gridTemplate(layout: SectionLayout | null | undefined): string {
  return (sectionLayouts[layout ?? "oneColumn"] ?? sectionLayouts.oneColumn).columns.join(" ");
}
