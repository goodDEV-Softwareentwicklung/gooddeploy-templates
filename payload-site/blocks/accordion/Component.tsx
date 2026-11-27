import type { AccordionBlock } from "../../payload-types.ts";
import { Accordion } from "../../ui/Accordion.tsx";
import { BlockFrame } from "../BlockFrame.tsx";
import { RichText } from "../RichText.tsx";
import { toHeading } from "../mappers.ts";
import type { BlockComponentProps } from "../types.ts";

export function AccordionComponent({ block, context }: BlockComponentProps<AccordionBlock>) {
  return (
    <BlockFrame context={context}>
      <Accordion
        heading={toHeading(block)}
        items={(block.items ?? []).map((item) => ({
          title: item.title,
          content: <RichText data={item.content} />,
          open: Boolean(item.open),
        }))}
      />
    </BlockFrame>
  );
}
