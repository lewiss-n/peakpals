import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tracker } from "@/components/Tracker";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:font-bold">Skip to content</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <Suspense><Tracker /></Suspense>
    </>
  );
}
