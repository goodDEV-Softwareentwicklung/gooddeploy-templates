import { blockComponents, type BlockComponent } from "./components.ts";
import type { BlockContext, LayoutBlock } from "./types.ts";

/** Rendert eine Liste von Modulen; der Layout-Abschnitt ruft sie je Spalte erneut auf. */
export function RenderBlocks({
  blocks,
  context = { nested: false },
}: {
  blocks: LayoutBlock[] | null | undefined;
  context?: BlockContext;
}) {
  if (!blocks?.length) return null;
  return (
    <>
      {blocks.map((block, index) => {
        const Component = blockComponents[block.blockType] as BlockComponent<LayoutBlock> | undefined;
        const key = block.id ?? `${block.blockType}-${index}`;
        if (!Component) {
          if (process.env.NODE_ENV === "production") {
            console.warn(`[blocks] Unbekannter Blocktyp: ${block.blockType}`);
            return null;
          }
          return (
            <p key={key} className="block-unknown">
              Blocktyp „{block.blockType}“ hat keine Komponente.
            </p>
          );
        }
        return <Component key={key} block={block} context={context} />;
      })}
    </>
  );
}
