import type { Block } from "payload";
import { Accordion } from "./accordion/config.ts";
import { Cards } from "./cards/config.ts";
import { Contact } from "./contact/config.ts";
import { CallToAction } from "./cta/config.ts";
import { Gallery } from "./gallery/config.ts";
import { Hero } from "./hero/config.ts";
import { MediaText } from "./mediaText/config.ts";
import { Quote } from "./quote/config.ts";
import { Stats } from "./stats/config.ts";
import { Team } from "./team/config.ts";
import { Text } from "./text/config.ts";

/**
 * Welche Module wo erlaubt sind. Verschachtelung ist begrenzt:
 * Seite → Abschnitt → Modul. In Spalten gibt es keine Abschnitte und keinen Hero.
 */
export const columnBlocks: Block[] = [Text, MediaText, Cards, Accordion, Stats, Quote, CallToAction, Gallery, Team, Contact];

/** Module, die auch für sich auf der Seite stehen (ohne Abschnitt) */
export const pageContentBlocks: Block[] = [Hero, ...columnBlocks];
