// Einrichtungscode für das erste Konto: Solange es kein Konto gibt, könnte
// sonst jeder, der /admin zuerst aufruft, das Admin-Konto anlegen (Live hat
// eine eigene, anfangs leere Datenbank). Der Code hängt nur an
// PAYLOAD_SECRET (HMAC-SHA256), steht beim Start im Log (gooddeploy logs)
// und gilt, bis das erste Konto existiert.
import { createHmac, timingSafeEqual } from "node:crypto";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; // Base32 (RFC 4648)

// setupCode: 16 Zeichen Base32 (80 Bit) in Vierergruppen, z. B. ABCD-EFGH-IJKL-MNOP.
export function setupCode(secret: string): string {
  const mac = createHmac("sha256", secret).update("first-user").digest();
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of mac) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5 && out.length < 16) {
      out += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
    if (out.length === 16) break;
  }
  return out.match(/.{4}/g)!.join("-");
}

// normalize entfernt nur Leerzeichen und Bindestriche. Jedes andere Zeichen
// bleibt stehen und macht den Code ungültig (vorher fielen Zeichen außerhalb
// von Base32 wie 0, 1, 8, 9 still weg, sodass „…H6JS1“ als richtig galt).
// Großschreibung nur für ASCII: toUpperCase() machte z. B. aus „ı“ ein „I“
// und aus „ß“ ein „SS“. \s umfasst auch Unicode-Leerzeichen (geschütztes
// Leerzeichen, BOM), das hilft beim Kopieren und Einfügen.
const normalize = (s: string) =>
  s.replace(/[\s-]/g, "").replace(/[a-z]/g, (c) => c.toUpperCase());

// validSetupCode vergleicht in konstanter Zeit; Groß-/Kleinschreibung,
// Leerzeichen und Bindestriche zählen nicht, alle anderen Zeichen schon.
export function validSetupCode(secret: string, input: unknown): boolean {
  if (typeof input !== "string") return false;
  const want = Buffer.from(normalize(setupCode(secret)));
  const got = Buffer.from(normalize(input));
  // Die Länge ist fest (16) und kein Geheimnis; timingSafeEqual braucht gleich lange Puffer.
  return got.length === want.length && timingSafeEqual(got, want);
}
