import { getReusableBlock } from "../../lib/content.ts";
import type { ReusableBlockReference } from "../../payload-types.ts";
import { RenderBlocks } from "../RenderBlocks.tsx";
import type { BlockComponentProps } from "../types.ts";

/** Fügt die Module eines Bibliothekseintrags ein (eine Ebene, keine Verweise in Verweisen). */
export async function ReusableComponent({ block, context }: BlockComponentProps<ReusableBlockReference>) {
  // Immer selbst laden: In der Seite ist der Verweis nur bis Tiefe 2 aufgelöst,
  // Bilder von Personen im Modul lägen auf Tiefe 3.
  const ref = block.reference;
  const id = typeof ref === "object" && ref !== null ? ref.id : ref;
  const doc = typeof id === "number" ? await getReusableBlock(id) : null;
  if (!doc) return null;
  return <RenderBlocks blocks={doc.layout} context={context} />;
}
