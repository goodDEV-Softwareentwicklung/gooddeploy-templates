import type { TextBlock } from "../../payload-types.ts";
import { TextContent } from "../../ui/TextContent.tsx";
import { BlockFrame } from "../BlockFrame.tsx";
import { RichText } from "../RichText.tsx";
import { toHeading } from "../mappers.ts";
import type { BlockComponentProps } from "../types.ts";

export function TextComponent({ block, context }: BlockComponentProps<TextBlock>) {
  const width = block.width ?? "prose";
  return (
    <BlockFrame context={context}>
      <TextContent
        heading={toHeading(block)}
        width={width}
        content={<RichText data={block.content} className={width === "full" ? "prose prose--full" : "prose"} />}
      />
    </BlockFrame>
  );
}
