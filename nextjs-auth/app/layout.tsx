import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Startvorlage",
  description: "Next.js mit Anmeldung und Postgres auf gooddeploy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
