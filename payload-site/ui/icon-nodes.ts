// Zeichen der Icons als SVG-Bausteine (ohne React), für das Favicon
// (lib/favicon.ts). Gleiche Zuordnung wie in Icon.tsx; dazu ein neutraler Kreis.

import * as briefcaseIcon from "lucide-react/icons/briefcase";
import * as usersIcon from "lucide-react/icons/users";
import * as handshakeIcon from "lucide-react/icons/handshake";
import * as lightbulbIcon from "lucide-react/icons/lightbulb";
import * as rocketIcon from "lucide-react/icons/rocket";
import * as targetIcon from "lucide-react/icons/target";
import * as chartLineIcon from "lucide-react/icons/chart-line";
import * as shieldIcon from "lucide-react/icons/shield";
import * as awardIcon from "lucide-react/icons/award";
import * as starIcon from "lucide-react/icons/star";
import * as sparklesIcon from "lucide-react/icons/sparkles";
import * as heartIcon from "lucide-react/icons/heart";
import * as leafIcon from "lucide-react/icons/leaf";
import * as globeIcon from "lucide-react/icons/globe";
import * as clockIcon from "lucide-react/icons/clock";
import * as calendarDaysIcon from "lucide-react/icons/calendar-days";
import * as wrenchIcon from "lucide-react/icons/wrench";
import * as settingsIcon from "lucide-react/icons/settings";
import * as codeIcon from "lucide-react/icons/code";
import * as cloudIcon from "lucide-react/icons/cloud";
import * as truckIcon from "lucide-react/icons/truck";
import * as buildingComplexIcon from "lucide-react/icons/building-complex"; // Building2 in Icon.tsx ist ein anderer Name dafür
import * as houseIcon from "lucide-react/icons/house";
import * as messageCircleIcon from "lucide-react/icons/message-circle";
import * as circleCheckIcon from "lucide-react/icons/circle-check";
import * as circleIcon from "lucide-react/icons/circle";
import type { IconName } from "./icons.ts";

/** Ein Element des Icons, z. B. ["path", { d: "…" }] */
export type IconNode = [tag: string, attributes: Record<string, string>][];

// lucide-react exportiert die Bausteine je Icon als __iconData; die Typen nennen nur die Komponente.
const nodeOf = (module: unknown): IconNode => (module as { __iconData: { node: IconNode } }).__iconData.node;

export const iconNodes: Record<IconName, IconNode> = {
  briefcase: nodeOf(briefcaseIcon),
  users: nodeOf(usersIcon),
  handshake: nodeOf(handshakeIcon),
  lightbulb: nodeOf(lightbulbIcon),
  rocket: nodeOf(rocketIcon),
  target: nodeOf(targetIcon),
  chart: nodeOf(chartLineIcon),
  shield: nodeOf(shieldIcon),
  award: nodeOf(awardIcon),
  star: nodeOf(starIcon),
  sparkles: nodeOf(sparklesIcon),
  heart: nodeOf(heartIcon),
  leaf: nodeOf(leafIcon),
  globe: nodeOf(globeIcon),
  clock: nodeOf(clockIcon),
  calendar: nodeOf(calendarDaysIcon),
  wrench: nodeOf(wrenchIcon),
  settings: nodeOf(settingsIcon),
  code: nodeOf(codeIcon),
  cloud: nodeOf(cloudIcon),
  truck: nodeOf(truckIcon),
  building: nodeOf(buildingComplexIcon),
  home: nodeOf(houseIcon),
  message: nodeOf(messageCircleIcon),
  check: nodeOf(circleCheckIcon),
};

/** Neutrales Zeichen, wenn kein Icon gewählt ist */
export const neutralIconNode: IconNode = nodeOf(circleIcon);
