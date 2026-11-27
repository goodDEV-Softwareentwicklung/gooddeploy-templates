// Logo (Anmeldeseite) und Icon (Kopf des Admin-Panels) der Website statt des
// Payload-Logos (ST-14-14, Kriterium 7). Server-Komponenten: Payload übergibt
// `payload`; gelesen wird das Global „Website“ mit den Rechten eines Besuchers
// (die Anmeldeseite hat noch kein Konto). Ohne Datenbank oder Einstellungen
// bleibt ein neutrales Zeichen (lib/admin-graphics.ts).
import type { Payload } from "payload";
import { adminBrand, type AdminBrand, type AdminBrandSettings } from "../../lib/admin-graphics.ts";
import styles from "./AdminGraphics.module.css";

async function loadBrand(payload: Payload | undefined): Promise<AdminBrand> {
  try {
    const settings = await payload?.findGlobal({ slug: "site-settings", depth: 1, overrideAccess: false });
    return adminBrand(settings as AdminBrandSettings | undefined);
  } catch {
    return adminBrand(null);
  }
}

export async function AdminLogo({ payload }: { payload?: Payload }) {
  const brand = await loadBrand(payload);
  if (brand.logoUrl) {
    return <img className={styles.logoImage} src={brand.logoUrl} alt={brand.name} />;
  }
  return (
    <span className={styles.logo}>
      <img src={brand.iconUrl} width={48} height={48} alt="" />
      <span>{brand.name}</span>
    </span>
  );
}

export async function AdminIcon({ payload }: { payload?: Payload }) {
  const brand = await loadBrand(payload);
  return <img className={styles.icon} src={brand.iconUrl} alt={brand.name} />;
}
