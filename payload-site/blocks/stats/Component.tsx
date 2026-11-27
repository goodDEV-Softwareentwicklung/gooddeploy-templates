import type { StatsBlock } from "../../payload-types.ts";
import { Stats } from "../../ui/Stats.tsx";
import { BlockFrame } from "../BlockFrame.tsx";
import { toHeading } from "../mappers.ts";
import type { BlockComponentProps } from "../types.ts";

export function StatsComponent({ block, context }: BlockComponentProps<StatsBlock>) {
  const stats = (
    <Stats
      heading={toHeading(block)}
      variant={block.variant ?? "band"}
      items={(block.items ?? []).map((item) => ({ value: item.value, label: item.label }))}
      nested={context.nested}
    />
  );
  // Das Band zeichnet auf oberster Ebene seinen Hintergrund selbst.
  if (block.variant === "band" && !context.nested) return stats;
  return <BlockFrame context={context}>{stats}</BlockFrame>;
}
