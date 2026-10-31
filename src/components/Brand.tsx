/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

/** Full Peak Pals badge logo (ring + PEAK PALS ADVENTURES). */
export function BrandLockup({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="group block shrink-0" aria-label="Peak Pals Adventures, home">
      <img
        src={light ? "/brand/peak-pals-badge-reversed.svg" : "/brand/peak-pals-badge-primary.svg"}
        alt="Peak Pals Adventures"
        width={84}
        height={84}
        className={`transition-all duration-300 group-hover:-rotate-6 ${compact ? "size-14" : "size-[68px] lg:size-[84px]"}`}
      />
    </Link>
  );
}
