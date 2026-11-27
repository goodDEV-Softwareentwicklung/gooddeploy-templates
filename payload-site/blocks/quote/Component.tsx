import type { QuoteBlock } from "../../payload-types.ts";
import { Quote } from "../../ui/Quote.tsx";
import { BlockFrame } from "../BlockFrame.tsx";
import { toImage } from "../mappers.ts";
import type { BlockComponentProps } from "../types.ts";

export function QuoteComponent({ block, context }: BlockComponentProps<QuoteBlock>) {
  return (
    <BlockFrame context={context}>
      <Quote text={block.text} person={block.person ?? undefined} role={block.role ?? undefined} image={toImage(block.image)} />
    </BlockFrame>
  );
}
