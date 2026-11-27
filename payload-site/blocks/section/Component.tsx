import type { SectionBlock } from "../../payload-types.ts";
import { Section } from "../../ui/Section.tsx";
import { RenderBlocks } from "../RenderBlocks.tsx";
import { toHeading } from "../mappers.ts";
import type { BlockComponentProps } from "../types.ts";
import { columnCount, gridTemplate } from "./layouts.ts";

/** Abschnitt mit Spalten; rendert je Spalte die Module (zweite und letzte Ebene). */
export function SectionComponent({ block }: BlockComponentProps<SectionBlock>) {
  const count = columnCount(block.layout);
  // Mehr Spalten als das Layout vorsieht werden nicht angezeigt (Validierung beim Speichern).
  const columns = (block.columns ?? []).slice(0, count);
  return (
    <Section
      tone={block.background ?? "none"}
      width={block.width ?? "normal"}
      spacing={block.spacing ?? "normal"}
      anchor={block.anchor ?? undefined}
      heading={toHeading(block)}
      columns={gridTemplate(block.layout)}
      align={block.verticalAlign ?? "top"}
    >
      {columns.map((column, index) => (
        <div key={column.id ?? index} className="layout-grid__column">
          <RenderBlocks blocks={column.blocks} context={{ nested: true, fullWidth: block.layout === "oneColumn" }} />
        </div>
      ))}
    </Section>
  );
}
