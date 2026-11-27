import type { Metadata } from "next";
import { getSiteSettings } from "../../lib/content.ts";
import { faviconHref, faviconSource } from "../../lib/favicon.ts";
import { themeFonts } from "../../themes/runtime.ts";
import { resolveTheme, themeCss } from "../../themes/resolve.ts";
import { fallbackName, SiteFooter, SiteHeader } from "./chrome.tsx";
import { PoweredBy } from "./powered-by.tsx";
import "./globals.css";

// Inhalte kommen zur Laufzeit aus der Datenbank (beim Build gibt es keine).
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = settings.siteName || fallbackName;
  // Favicon aus Logo, Icon und Theme; die Adresse ändert sich mit ihnen (lib/favicon.ts).
  const icon = faviconSource(settings);
  return {
    icons: { icon: faviconHref(icon), apple: faviconHref(icon, "apple") },
    title: { default: name, template: `%s · ${settings.shortName || name}` },
    description: settings.description ?? undefined,
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  // Theme → Farbvariante → eigene Farben; ungültige Werte fallen auf die Vorgaben zurück.
  const theme = resolveTheme(settings);
  const fonts = themeFonts[theme.theme.id as keyof typeof themeFonts] ?? themeFonts.whitelabel;
  return (
    <html lang="de" className={fonts.map((f) => f.variable).join(" ")}>
      <head>
        <style>{themeCss(theme)}</style>
      </head>
      <body>
        <div className="site">
          <SiteHeader settings={settings} />
          <main>{children}</main>
          <SiteFooter settings={settings} />
        </div>
        <PoweredBy />
      </body>
    </html>
  );
}
