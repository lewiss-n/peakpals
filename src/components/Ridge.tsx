/** Layered mountain-ridge divider between sections. */
export function Ridge({ from = "#FBF7E6", back = "#899536", front = "#355A35", className = "" }: { from?: string; back?: string; front?: string; className?: string }) {
  return (
    <div className={`relative -mb-px h-16 w-full sm:h-24 ${className}`} style={{ background: from }} aria-hidden>
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <path d="M0 100V62l90-34 70 26 110-46 120 52 90-30 130 44 100-58 110 40 80-22 120 46 110-50 90 28 120-36 100 30V100Z" fill={back} />
        <path d="M0 100V78l130-28 90 22 120-36 140 44 110-24 130 30 120-40 110 30 100-18 130 32 110-26 150 30V100Z" fill={front} />
      </svg>
    </div>
  );
}
