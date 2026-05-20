import type { Metadata } from "next";
import { Providers } from "@/providers/providers";
import { APP_DESCRIPTION, APP_TITLE } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_TITLE} — Medellín`,
  description: APP_DESCRIPTION,
  applicationName: APP_TITLE,
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-black antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
