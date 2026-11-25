// Welche Adressen die Anmeldung akzeptiert (Schutz vor gefälschten Hosts und
// Cross-Site-Anfragen). gooddeploy setzt GOODDEPLOY_URL für jede Version auf
// ihre öffentliche Adresse (Preview bzw. Live). Eigene Domains trägst du in
// BETTER_AUTH_ALLOWED_HOSTS ein (Komma-Liste, z. B. "app.example.de,www.example.de").
type Env = Record<string, string | undefined>;

function hostOf(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}

export function allowedHosts(env: Env = process.env): string[] {
  const hosts = new Set<string>();
  for (const url of [env.GOODDEPLOY_URL, env.BETTER_AUTH_URL]) {
    const h = hostOf(url);
    if (h) hosts.add(h);
  }
  for (const h of (env.BETTER_AUTH_ALLOWED_HOSTS ?? "").split(",")) {
    if (h.trim()) hosts.add(h.trim());
  }
  if (env.NODE_ENV !== "production") {
    hosts.add("localhost:3000");
  }
  // Better Auth verlangt mindestens einen Eintrag; beim Build gibt es noch
  // keine Adresse.
  if (hosts.size === 0) hosts.add("localhost:3000");
  return [...hosts];
}

export function fallbackURL(env: Env = process.env): string | undefined {
  return env.BETTER_AUTH_URL || env.GOODDEPLOY_URL || undefined;
}
