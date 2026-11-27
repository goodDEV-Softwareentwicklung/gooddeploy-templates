"use client";
// Live-Vorschau im Admin-Panel (lib/preview.ts): Speichert Payload beim Tippen
// einen Entwurf, schickt das Admin-Panel der Vorschau eine Nachricht, und diese
// Seite lädt ihre Inhalte neu. Nur in der Vorschau eingebunden. Gleiches
// Verhalten wie RefreshRouteOnSave aus @payloadcms/live-preview-react, ohne
// zusätzliches Paket; Admin-Panel und Website teilen sich die Adresse.
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LivePreviewRefresh() {
  const router = useRouter();
  useEffect(() => {
    const origin = window.location.origin;
    const onMessage = (event: MessageEvent) => {
      // nur Nachrichten des eigenen Admin-Panels
      if (event.origin === origin && event.data?.type === "payload-document-event") router.refresh();
    };
    window.addEventListener("message", onMessage);
    // dem Admin-Panel melden, dass die Vorschau bereit ist
    (window.opener ?? window.parent)?.postMessage({ type: "payload-live-preview", ready: true }, origin);
    router.refresh();
    return () => window.removeEventListener("message", onMessage);
  }, [router]);
  return null;
}
