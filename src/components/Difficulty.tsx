import { DIFFICULTY } from "@/lib/format";

export function Peaks({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span className={`inline-flex items-end gap-px ${className}`} aria-hidden>
      {[1, 2, 3].map((i) => (
        <svg key={i} viewBox="0 0 10 9" className={`h-2.5 w-3 ${i <= n ? "opacity-100" : "opacity-30"}`}><path d="M0 9 5 0l5 9z" fill="currentColor" /></svg>
      ))}
    </span>
  );
}

export function DifficultyBadge({ level, size = "md" }: { level: keyof typeof DIFFICULTY; size?: "sm" | "md" }) {
  const d = DIFFICULTY[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border-2 border-night font-display font-bold ${d.cls} ${size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}>
      <Peaks n={d.peaks} />
      {d.label}
    </span>
  );
}
