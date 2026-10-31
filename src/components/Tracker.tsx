"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/** First-party, cookie-light page view tracking. Respects Do Not Track / GPC. */
export function Tracker() {
  const path = usePathname();
  const params = useSearchParams();
  const last = useRef<string>("");
  useEffect(() => {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;
    if (last.current === path) return;
    const first = last.current === "";
    last.current = path;
    const body = JSON.stringify({
      path,
      referrer: first ? document.referrer : "",
      utm: params.get("utm_source") ?? undefined,
      w: window.innerWidth,
    });
    if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
    }
  }, [path, params]);
  return null;
}
