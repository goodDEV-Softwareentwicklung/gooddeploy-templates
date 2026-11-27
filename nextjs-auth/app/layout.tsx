import type { Metadata } from "next";
import "./globals.css";
import { PoweredBy } from "./powered-by";

export const metadata: Metadata = {
  title: "Startvorlage",
  description: "Next.js mit Anmeldung und Postgres",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <main>{children}</main>
        <PoweredBy />
      </body>
    </html>
  );
}
