import type { MediaTextBlock } from "../../payload-types.ts";
import { MediaText } from "../../ui/MediaText.tsx";
import { BlockFrame } from "../BlockFrame.tsx";
import { RichText } from "../RichText.tsx";
import { toImage, toLinks } from "../mappers.ts";
import type { BlockComponentProps } from "../types.ts";

export function MediaTextComponent({ block, context }: BlockComponentProps<MediaTextBlock>) {
  return (
    <BlockFrame context={context}>
      <MediaText
        image={toImage(block.image)}
        imagePosition={block.imagePosition ?? "left"}
        eyebrow={block.eyebrow ?? undefined}
        title={block.title ?? undefined}
        content={block.content ? <RichText data={block.content} /> : undefined}
        links={toLinks(block.links)}
        // Bild über Text nur in schmalen Spalten; in voller Breite nebeneinander (schmal stapelt das CSS)
        stacked={context.nested && !context.fullWidth}
      />
    </BlockFrame>
  );
}
