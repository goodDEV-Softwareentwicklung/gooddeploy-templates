import type { ReactNode } from "react";
import { AccordionComponent } from "./accordion/Component.tsx";
import { CardsComponent } from "./cards/Component.tsx";
import { ContactComponent } from "./contact/Component.tsx";
import { CallToActionComponent } from "./cta/Component.tsx";
import { GalleryComponent } from "./gallery/Component.tsx";
import { HeroComponent } from "./hero/Component.tsx";
import { MediaTextComponent } from "./mediaText/Component.tsx";
import { QuoteComponent } from "./quote/Component.tsx";
import { ReusableComponent } from "./reusable/Component.tsx";
import { SectionComponent } from "./section/Component.tsx";
import { StatsComponent } from "./stats/Component.tsx";
import { TeamComponent } from "./team/Component.tsx";
import { TextComponent } from "./text/Component.tsx";
import type { BlockComponentProps, LayoutBlock, LayoutBlockType } from "./types.ts";

export type BlockComponent<T extends LayoutBlock> = (props: BlockComponentProps<T>) => ReactNode | Promise<ReactNode>;

/**
 * Zuordnung blockType → Komponente. Fehlt ein Modul aus payload-types.ts,
 * meldet der Compiler das.
 */
export const blockComponents = {
  section: SectionComponent,
  reusable: ReusableComponent,
  hero: HeroComponent,
  text: TextComponent,
  mediaText: MediaTextComponent,
  cards: CardsComponent,
  accordion: AccordionComponent,
  stats: StatsComponent,
  quote: QuoteComponent,
  cta: CallToActionComponent,
  gallery: GalleryComponent,
  team: TeamComponent,
  contact: ContactComponent,
} satisfies { [K in LayoutBlockType]: BlockComponent<Extract<LayoutBlock, { blockType: K }>> };
