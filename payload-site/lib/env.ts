// Alle Umgebungsvariablen der App an einer Stelle, gelesen nur auf dem
// Server und zur Laufzeit. Es gibt bewusst keine NEXT_PUBLIC_-Variablen:
// Previews und Live nutzen dasselbe Image.

type Env = Record<string, string | undefined>;

function value(env: Env, name: string): string | undefined {
  const v = env[name]?.trim();
  return v ? v : undefined;
}

// next build lädt payload.config.ts, braucht aber weder Datenbank noch
// Geheimnis: Alle Seiten sind dynamisch.
function isBuild(env: Env): boolean {
  return env.NEXT_PHASE === "phase-production-build";
}

export function payloadSecret(env: Env = process.env): string {
  const secret = value(env, "PAYLOAD_SECRET");
  if (secret) return secret;
  if (isBuild(env)) return "build-placeholder-not-used-at-runtime";
  if (env.NODE_ENV !== "production") return "local-development-only";
  throw new Error(
    "PAYLOAD_SECRET fehlt. Setz ihn mit `gooddeploy env add PAYLOAD_SECRET --both` (Wert z. B. aus `openssl rand -base64 32`) und deploye neu.",
  );
}

// DATABASE_URL läuft über den Verbindungs-Pool von gooddeploy (5 gleichzeitig
// arbeitende Verbindungen je Datenbank); die Sperre für Migrationen braucht
// eine durchgehende Sitzung und nimmt DATABASE_URL_UNPOOLED (lib/migrate-on-start.ts).
export function databaseUrl(env: Env = process.env): string | undefined {
  return value(env, "DATABASE_URL") ?? value(env, "DATABASE_URL_UNPOOLED");
}

export function unpooledDatabaseUrl(env: Env = process.env): string | undefined {
  return value(env, "DATABASE_URL_UNPOOLED") ?? value(env, "DATABASE_URL");
}

export type S3Settings = {
  bucket: string;
  endpoint?: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
};

// Pflicht für Uploads; S3_ENDPOINT fehlt nur bei AWS, S3_REGION hat einen Standard.
export const requiredS3Variables = ["S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"] as const;

// s3Settings liefert den S3-Speicher für Uploads oder null, wenn er nicht
// vollständig eingerichtet ist. Ohne S3 ist das Hochladen aus (E223): Das
// Dateisystem im Container ist nicht dauerhaft, jede neue Version beginnt leer.
export function s3Settings(env: Env = process.env): S3Settings | null {
  if (requiredS3Variables.some((name) => !value(env, name))) return null;
  const endpoint = value(env, "S3_ENDPOINT");
  return {
    bucket: value(env, "S3_BUCKET")!,
    endpoint,
    region: value(env, "S3_REGION") ?? "us-east-1",
    accessKeyId: value(env, "S3_ACCESS_KEY_ID")!,
    secretAccessKey: value(env, "S3_SECRET_ACCESS_KEY")!,
    // Die meisten S3-Anbieter außer AWS (z. B. MinIO, Garage) brauchen Pfad-Adressen.
    forcePathStyle: (value(env, "S3_FORCE_PATH_STYLE") ?? (endpoint ? "true" : "false")) === "true",
  };
}

// missingS3Variables nennt die fehlenden Pflicht-Variablen, wenn S3 nur
// teilweise eingerichtet ist (sonst leer). Der Start schreibt das ins Log.
export function missingS3Variables(env: Env = process.env): string[] {
  const set = Object.keys(env).some((name) => name.startsWith("S3_") && value(env, name));
  if (!set) return [];
  return requiredS3Variables.filter((name) => !value(env, name));
}
