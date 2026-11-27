import type { CardsBlock } from "../../payload-types.ts";
import { Cards, type CardItem } from "../../ui/Cards.tsx";
import { BlockFrame } from "../BlockFrame.tsx";
import { linkHref, toHeading, toImage, toLink } from "../mappers.ts";
import type { BlockComponentProps } from "../types.ts";

export function toCardItems(items: CardsBlock["items"]): CardItem[] {
  return (items ?? []).map((item) => ({
    title: item.title,
    text: item.text ?? undefined,
    icon: item.icon ?? undefined,
    image: toImage(item.image),
    tag: item.tag ?? undefined,
    details: (item.details ?? []).map((d) => d.text),
    href: linkHref(item.link),
    newTab: item.link?.newTab ?? undefined,
  }));
}

export function CardsComponent({ block, context }: BlockComponentProps<CardsBlock>) {
  return (
    <BlockFrame context={context}>
      <Cards
        heading={toHeading(block)}
        style={block.style ?? "image"}
        columns={Number(block.columns ?? 3) as 2 | 3 | 4}
        items={toCardItems(block.items)}
        moreLink={toLink(block.moreLink)}
      />
    </BlockFrame>
  );
}
