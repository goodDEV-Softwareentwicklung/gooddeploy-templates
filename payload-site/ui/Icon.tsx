import {
  Award,
  Briefcase,
  Building2,
  CalendarDays,
  ChartLine,
  CircleCheck,
  Clock,
  Cloud,
  Code,
  Globe,
  Handshake,
  Heart,
  House,
  Leaf,
  Lightbulb,
  MessageCircle,
  Rocket,
  Settings,
  Shield,
  Sparkles,
  Star,
  Target,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "./icons.ts";

const icons: Record<IconName, LucideIcon> = {
  briefcase: Briefcase,
  users: Users,
  handshake: Handshake,
  lightbulb: Lightbulb,
  rocket: Rocket,
  target: Target,
  chart: ChartLine,
  shield: Shield,
  award: Award,
  star: Star,
  sparkles: Sparkles,
  heart: Heart,
  leaf: Leaf,
  globe: Globe,
  clock: Clock,
  calendar: CalendarDays,
  wrench: Wrench,
  settings: Settings,
  code: Code,
  cloud: Cloud,
  truck: Truck,
  building: Building2,
  home: House,
  message: MessageCircle,
  check: CircleCheck,
};

export function Icon({ name, size = 22 }: { name?: string | null; size?: number }) {
  const Component = name ? icons[name as IconName] : undefined;
  if (!Component) return null;
  return <Component size={size} strokeWidth={1.8} aria-hidden />;
}
