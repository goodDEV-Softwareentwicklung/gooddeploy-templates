// Zähler für Versuche je Schlüssel (z. B. Fehlversuche beim Anmelden je
// E-Mail-Adresse) in Postgres, damit die Grenze über alle Instanzen gilt
// (Tabelle auth_throttle, eine Zeile je Schlüssel und Zeitfenster).
import { sql } from "@/db";
import type { Throttle } from "./auth-options.ts";

export const pgThrottle: Throttle = {
  // Ein Upsert zählt und liest in einem Schritt; die Zeilensperre ordnet
  // gleichzeitige Anfragen, keine sieht einen veralteten Stand. Ist das
  // Zeitfenster abgelaufen, beginnt es neu.
  async reserve(key, max, windowSeconds) {
    const [row] = await sql()`
      insert into auth_throttle (key, window_start, n) values (${key}, now(), 1)
      on conflict (key) do update set
        n = case when auth_throttle.window_start < now() - make_interval(secs => ${windowSeconds})
                 then 1 else auth_throttle.n + 1 end,
        window_start = case when auth_throttle.window_start < now() - make_interval(secs => ${windowSeconds})
                 then now() else auth_throttle.window_start end
      returning n`;
    // Alte Zeilen gelegentlich entfernen.
    if (Math.random() < 0.01) {
      await sql()`delete from auth_throttle where window_start < now() - interval '1 day'`;
    }
    return row.n <= max;
  },
  async release(key) {
    await sql()`update auth_throttle set n = greatest(n - 1, 0) where key = ${key}`;
  },
};
