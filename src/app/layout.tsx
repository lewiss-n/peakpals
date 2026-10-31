import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Peak Pals Adventures · Conquer your peak", template: "%s · Peak Pals Adventures" },
  description: "Guided day hikes, outdoor fitness bootcamps and virtual run challenges in and around Nairobi. Move, connect with nature and find your people.",
  openGraph: { type: "website", siteName: site.name, images: ["/images/trail-companions.webp"] },
};

export const viewport: Viewport = { themeColor: "#355A35" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
