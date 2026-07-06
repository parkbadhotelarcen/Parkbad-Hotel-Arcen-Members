import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parkbad Hotel Arcen Members",
  description: "Digitaal loyaliteitssysteem voor hotelgasten.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#005651",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
