import { getSiteSettings } from "../../lib/content.ts";
import type { HeroBlock } from "../../payload-types.ts";
import { Hero } from "../../ui/Hero.tsx";
import { Icon } from "../../ui/Icon.tsx";
import { toImage, toLinks } from "../mappers.ts";
import type { BlockComponentProps } from "../types.ts";

export async function HeroComponent({ block }: BlockComponentProps<HeroBlock>) {
  const settings = await getSiteSettings();
  return (
    <Hero
      variant={block.variant}
      eyebrow={block.eyebrow ?? undefined}
      title={block.title}
      text={block.text ?? undefined}
      image={toImage(block.image)}
      links={toLinks(block.links)}
      badge={block.variant === "split" && settings.logoIcon ? <Icon name={settings.logoIcon} size={28} /> : undefined}
    />
  );
}
