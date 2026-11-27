/**
 * Bild von einer URL holen, für `import_image`. Schutz vor Abrufen ins interne
 * Netz (SSRF):
 * - nur https, ohne Zugangsdaten in der Adresse;
 * - jede Adresse wird über `net.BlockList` geprüft (nicht über Schreibweisen):
 *   private, lokale, reservierte Netze und jede IPv6-Adresse, in der eine
 *   IPv4-Adresse steckt (IPv4-mapped, IPv4-compatible, NAT64, 6to4, Teredo);
 * - die Prüfung sitzt im Verbindungsaufbau selbst (`lookup` von https.request):
 *   verbunden wird genau mit der geprüften Adresse, ein zweites Auflösen mit
 *   anderem Ergebnis (DNS-Rebinding) gibt es nicht;
 * - Weiterleitungen nur von Hand, höchstens drei, jede wird neu geprüft;
 * - nur Bildtypen, Größe hart begrenzt beim Lesen (auch ohne Content-Length).
 */
import { lookup as dnsLookup } from "node:dns/promises";
import type { IncomingHttpHeaders } from "node:http";
import { request as httpsRequest } from "node:https";
import { BlockList, isIP, type LookupFunction } from "node:net";
import { imageMimeTypes, maxUploadBytes } from "../../collections/Media.ts";

/** Dieselben Grenzen wie beim Hochladen im Admin-Panel (collections/Media.ts) */
export const allowedImageTypes = imageMimeTypes;
export const maxImageBytes = maxUploadBytes;

export type LookupFn = (host: string) => Promise<{ address: string; family?: number }[]>;

const defaultLookup: LookupFn = (host) => dnsLookup(host, { all: true, verbatim: true });

// Gesperrte Netze (IANA Special-Purpose Registries für IPv4 und IPv6, dazu alle
// IPv6-Formen mit eingebetteter IPv4). Zwei Listen: Eine BlockList prüft IPv4-Adressen
// auch gegen IPv6-Regeln (als ::ffff:a.b.c.d), ::ffff:0:0/96 sperrte sonst jede IPv4.
const blockedV4 = new BlockList();
const blockedV6 = new BlockList();
for (const [net, prefix] of [
  ["0.0.0.0", 8], // „dieses Netz“
  ["10.0.0.0", 8],
  ["100.64.0.0", 10], // Carrier-grade NAT
  ["127.0.0.0", 8],
  ["169.254.0.0", 16], // Link-local, Metadaten-Dienste (169.254.169.254)
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24], // 6to4-Relay
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4], // Multicast
  ["240.0.0.0", 4], // reserviert und Broadcast
] as const) {
  blockedV4.addSubnet(net, prefix, "ipv4");
}
for (const [net, prefix] of [
  ["::", 96], // unspecified, Loopback und IPv4-compatible (::a.b.c.d)
  ["::ffff:0:0", 96], // IPv4-mapped
  ["::ffff:0:0:0", 96], // IPv4-translated
  ["64:ff9b::", 96], // NAT64
  ["64:ff9b:1::", 48], // NAT64, lokal
  ["100::", 64], // Discard
  ["2001::", 32], // Teredo
  ["2001:2::", 48], // Benchmarking
  ["2001:db8::", 32], // Dokumentation
  ["2001:10::", 28], // ORCHID
  ["2002::", 16], // 6to4
  ["fc00::", 7], // Unique Local
  ["fe80::", 10], // Link-local
  ["fec0::", 10], // Site-local (veraltet)
  ["ff00::", 8], // Multicast
] as const) {
  blockedV6.addSubnet(net, prefix, "ipv6");
}

/** Interne, lokale oder reservierte Adresse (IPv4 und IPv6, jede Schreibweise); Unbekanntes gilt als intern */
export function isPrivateAddress(address: string): boolean {
  const ip = address.replace(/^\[|\]$/g, "").replace(/%.*$/, "");
  const family = isIP(ip);
  if (family === 0) return true;
  return family === 4 ? blockedV4.check(ip, "ipv4") : blockedV6.check(ip, "ipv6");
}

const internalMessage = "Interne Adressen sind nicht erlaubt.";

/** Fehlertext für die KI oder `undefined`, wenn die URL abgerufen werden darf */
export async function checkImageUrl(raw: string, lookup: LookupFn = defaultLookup): Promise<string | undefined> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "Ungültige URL.";
  }
  if (url.protocol !== "https:") return "Nur https-Adressen sind erlaubt.";
  if (url.username || url.password) return "Adressen mit Zugangsdaten sind nicht erlaubt.";
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) return internalMessage;
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host).catch(() => []);
  if (addresses.length === 0) return "Adresse nicht auflösbar.";
  if (addresses.some(({ address }) => isPrivateAddress(address))) return internalMessage;
  return undefined;
}

/**
 * `lookup` für den Verbindungsaufbau: löst einmal auf, lehnt ab, sobald eine
 * Adresse intern ist, und gibt nur geprüfte Adressen weiter.
 */
export function pinnedLookup(lookup: LookupFn = defaultLookup): LookupFunction {
  return (hostname, options, callback) => {
    lookup(hostname)
      .then((found) => {
        const addresses = found.map(({ address, family }) => ({ address, family: family ?? isIP(address) }));
        if (addresses.length === 0) throw Object.assign(new Error("Adresse nicht auflösbar."), { code: "ENOTFOUND" });
        if (addresses.some(({ address }) => isPrivateAddress(address))) throw Object.assign(new Error(internalMessage), { code: "EBLOCKED" });
        if (options.all) (callback as unknown as (err: null, list: typeof addresses) => void)(null, addresses);
        else callback(null, addresses[0].address, addresses[0].family);
      })
      .catch((err: NodeJS.ErrnoException) => callback(err, "", 0));
  };
}

export type ImageResponse = { status: number; headers: IncomingHttpHeaders; body: AsyncIterable<Buffer>; abort: () => void };
export type GetFn = (url: URL, lookup: LookupFunction) => Promise<ImageResponse>;

/** GET über https mit der geprüften Adresse, ohne Weiterleitungen, mit Zeitlimit */
export const httpsGet: GetFn = (url, lookup) =>
  new Promise((resolve, reject) => {
    const req = httpsRequest(url, { method: "GET", lookup, timeout: 15_000, headers: { accept: allowedImageTypes.join(",") } }, (res) =>
      resolve({ status: res.statusCode ?? 0, headers: res.headers, body: res, abort: () => res.destroy() }),
    );
    req.on("timeout", () => req.destroy(new Error("Zeitüberschreitung beim Abruf.")));
    req.on("error", reject);
    req.end();
  });

export type FetchedImage = { data: Buffer; mimetype: string; name: string; size: number };

/** Dateiname aus der URL, sonst „bild“, mit Endung passend zum Typ */
export function imageFileName(url: URL, mimetype: string): string {
  const extension = mimetype.split("/")[1].replace("jpeg", "jpg");
  const base = decodeURIComponent(url.pathname.split("/").pop() ?? "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "bild"}.${extension}`;
}

/** Liest höchstens `limit` Bytes; bricht beim Überschreiten ab */
async function readLimited(response: ImageResponse, limit: number): Promise<Buffer | "too-large"> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of response.body) {
    total += chunk.length;
    if (total > limit) {
      response.abort();
      return "too-large";
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

const header = (headers: IncomingHttpHeaders, name: string) => {
  const value = headers[name];
  return Array.isArray(value) ? value[0] : value;
};

const tooLarge = { error: "Bild ist größer als 10 MB." };

/** Holt das Bild; folgt höchstens drei Weiterleitungen und prüft jede Station. Wirft nicht. */
export async function fetchImage(
  raw: string,
  options: { lookup?: LookupFn; get?: GetFn; maxBytes?: number } = {},
): Promise<FetchedImage | { error: string }> {
  const { lookup = defaultLookup, get = httpsGet, maxBytes = maxImageBytes } = options;
  let current = raw;
  try {
    for (let hop = 0; hop < 4; hop++) {
      const problem = await checkImageUrl(current, lookup);
      if (problem) return { error: problem };
      const url = new URL(current);
      const response = await get(url, pinnedLookup(lookup));
      if (response.status >= 300 && response.status < 400) {
        response.abort();
        const location = header(response.headers, "location");
        if (!location) return { error: "Weiterleitung ohne Ziel." };
        current = new URL(location, current).toString();
        continue;
      }
      if (response.status < 200 || response.status >= 300) {
        response.abort();
        return { error: `Abruf fehlgeschlagen (HTTP ${response.status}).` };
      }
      const mimetype = (header(response.headers, "content-type") ?? "").split(";")[0].trim().toLowerCase();
      if (!allowedImageTypes.includes(mimetype)) {
        response.abort();
        return { error: `Kein erlaubtes Bildformat (${mimetype || "unbekannt"}).` };
      }
      if (Number(header(response.headers, "content-length") ?? 0) > maxBytes) {
        response.abort();
        return tooLarge;
      }
      const data = await readLimited(response, maxBytes);
      if (data === "too-large") return tooLarge;
      return { data, mimetype, name: imageFileName(url, mimetype), size: data.length };
    }
    return { error: "Zu viele Weiterleitungen." };
  } catch (err) {
    // Interne Adresse beim Verbinden (DNS-Rebinding) oder Netzfehler: knapp, ohne Details zum Ziel.
    return { error: (err as { code?: string })?.code === "EBLOCKED" ? internalMessage : "Abruf fehlgeschlagen." };
  }
}
