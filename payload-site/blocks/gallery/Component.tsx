import type { GalleryBlock } from "../../payload-types.ts";
import type { UiImage } from "../../ui/types.ts";
import { Gallery } from "../../ui/Gallery.tsx";
import { BlockFrame } from "../BlockFrame.tsx";
import { toHeading, toImage } from "../mappers.ts";
import type { BlockComponentProps } from "../types.ts";

export function GalleryComponent({ block, context }: BlockComponentProps<GalleryBlock>) {
  const images = (block.images ?? []).map(toImage).filter((i): i is UiImage => Boolean(i));
  if (images.length === 0) return null;
  return (
    <BlockFrame context={context}>
      <Gallery heading={toHeading(block)} images={images} />
    </BlockFrame>
  );
}
