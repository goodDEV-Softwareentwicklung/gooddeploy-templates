import type { CallToActionBlock } from "../../payload-types.ts";
import { CallToAction } from "../../ui/CallToAction.tsx";
import { toLinks } from "../mappers.ts";
import type { BlockComponentProps } from "../types.ts";

/** Band mit eigenem Hintergrund; in Spalten als Kasten */
export function CallToActionComponent({ block, context }: BlockComponentProps<CallToActionBlock>) {
  const cta = (
    <CallToAction
      eyebrow={block.eyebrow ?? undefined}
      title={block.title}
      text={block.text ?? undefined}
      links={toLinks(block.links)}
      tone={block.tone ?? "primary"}
      nested={context.nested}
    />
  );
  return context.nested ? <div className="block-in-column">{cta}</div> : cta;
}
