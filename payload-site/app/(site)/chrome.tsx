// Kopf und Fuß der Website aus dem Global „Website“ (lib/content.ts).
import type { ReactNode } from "react";
import { toImage, toLink, toLinks, toNavigation, type LinkData } from "../../blocks/mappers.ts";
import type { SiteSetting } from "../../payload-types.ts";
import { Footer } from "../../ui/Footer.tsx";
import { Header } from "../../ui/Header.tsx";
import { Icon } from "../../ui/Icon.tsx";
import { Image } from "../../ui/Image.tsx";
import { flattenNavigation } from "../../ui/navigation.ts";
import type { UiLink } from "../../ui/types.ts";

// Name, falls im Global noch nichts steht (z. B. vor dem ersten Speichern).
export const fallbackName = "Website";

function logoOf(settings: SiteSetting): ReactNode {
  const image = toImage(settings.logo);
  if (image) return <Image image={image} sizes="200px" fit="contain" />;
  return <Icon name={settings.logoIcon ?? "briefcase"} size={22} />;
}

/** Logo im dunklen Fuß: helle Fassung, sonst das normale Logo */
function darkLogoOf(settings: SiteSetting): { logo: ReactNode; logoForDark: boolean } {
  const image = toImage(settings.logoDark);
  if (image) return { logo: <Image image={image} sizes="200px" fit="contain" />, logoForDark: true };
  return { logo: logoOf(settings), logoForDark: false };
}

const links = (rows: { link: LinkData }[] | null | undefined) => toLinks(rows);

export function SiteHeader({ settings }: { settings: SiteSetting }) {
  const actions = (settings.headerActions ?? [])
    .map((row) => toLink(row.link))
    .filter((l): l is UiLink => Boolean(l))
    .map((l) => ({ ...l, appearance: l.appearance ?? "accent" }));
  return (
    <Header
      homeHref="/"
      name={settings.shortName || settings.siteName || fallbackName}
      place={settings.tagline ?? undefined}
      logo={logoOf(settings)}
      navigation={toNavigation(settings.navigation)}
      actions={actions}
    />
  );
}

export function SiteFooter({ settings }: { settings: SiteSetting }) {
  const name = settings.siteName || fallbackName;
  const legal = [toLink(settings.imprint), toLink(settings.privacy), ...links(settings.footerLinks)].filter((l): l is UiLink => Boolean(l));
  return (
    <Footer
      name={name}
      shortName={settings.shortName || name}
      place={settings.tagline ?? undefined}
      {...darkLogoOf(settings)}
      pages={flattenNavigation(toNavigation(settings.navigation))}
      address={(settings.contactAddress ?? "").split("\n").filter(Boolean)}
      email={settings.contactEmail ?? undefined}
      phone={settings.contactPhone ?? undefined}
      legal={legal}
      year={new Date().getFullYear()}
    />
  );
}
