/** Branded illustration used when an event has no cover photo yet. Never a fake photo. */
const PALETTES = {
  EASY: { sky: "#FBD569", far: "#899536", near: "#355A35", sun: "#FFBA08" },
  MODERATE: { sky: "#F7EFCA", far: "#899536", near: "#355A35", sun: "#E85D04" },
  DIFFICULT: { sky: "#F7EFCA", far: "#8C3703", near: "#1F3320", sun: "#E85D04" },
} as const;

export function EventArt({ difficulty, activity, seed = 0, className = "" }: { difficulty: keyof typeof PALETTES; activity: string; seed?: number; className?: string }) {
  const p = PALETTES[difficulty];
  const s = (seed % 5) * 14;
  const sx = 230 + (seed % 3) * 60;
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label="Illustration: mountains and a rising sun">
      <rect width="400" height="260" fill={p.sky} />
      <g fill="none" stroke="#1F3320" strokeOpacity=".09" strokeWidth="1.4">
        {[40, 62, 84, 106, 128].map((r) => <ellipse key={r} cx={90 + s} cy="70" rx={r * 1.3} ry={r * 0.8} />)}
      </g>
      <circle cx={sx} cy="92" r="34" fill={p.sun} />
      {activity === "RUN_CHALLENGE" ? (
        <path d="M0 200 Q100 170 200 190 T400 175 V260 H0Z" fill={p.far} />
      ) : (
        <path d={`M0 210 L${70 + s} ${120 - s / 3} L${150 + s} 190 L${240 - s / 2} 104 L330 180 L400 140 V260 H0Z`} fill={p.far} />
      )}
      <path d={`M0 260 V226 L${110 + s} 150 L${190 + s} 214 L${280 - s} 168 L400 230 V260Z`} fill={p.near} />
      <path d="M40 260 C120 236 170 248 210 222 S300 206 360 196" fill="none" stroke="#F7EFCA" strokeWidth="5" strokeDasharray="12 10" strokeLinecap="round" opacity=".85" />
      {activity === "BOOTCAMP" && <g fill="#F7EFCA" opacity=".9"><circle cx="330" cy="62" r="5" /><circle cx="352" cy="44" r="3.5" /><circle cx="306" cy="40" r="3" /></g>}
    </svg>
  );
}
