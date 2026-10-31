/** Brand illustration of a merch item, shown until real product photos are uploaded. */
const SHAPES: Record<string, { body: string; extra?: string; badge: [number, number, number] }> = {
  tee: { body: "M120 70 160 58Q200 92 240 58L280 70 352 116 322 178 290 162V346H110V162L78 178 48 116Z", extra: "M160 58Q200 98 240 58", badge: [232, 128, 52] },
  hoodie: { body: "M138 84Q200 36 262 84L302 98 356 262 320 274 290 196V350H110V196L80 274 44 262 98 98Z", extra: "M160 86Q200 132 240 86M150 268H250V318H150Z", badge: [200, 178, 64] },
  cap: { body: "M108 232Q108 118 200 112Q292 118 292 232ZM108 232Q200 214 352 252Q302 274 200 266Q132 262 108 244Z", extra: "M200 112V232M154 122Q170 170 160 232M246 122Q230 170 240 232", badge: [200, 170, 58] },
  bottle: { body: "M166 54H234Q242 54 242 62V88H158V62Q158 54 166 54ZM172 88H228V112Q258 120 258 150V328Q258 352 234 352H166Q142 352 142 328V150Q142 120 172 112Z", extra: "M142 300H258", badge: [200, 214, 72] },
  buff: { body: "M128 92Q200 70 272 92V318Q200 340 128 318Z", extra: "M128 150Q200 130 272 150M128 260Q200 240 272 260", badge: [200, 205, 74] },
  tote: { body: "M104 150H296L310 352H90Z", extra: "M146 152Q146 70 200 70Q254 70 254 152M164 152Q164 92 200 92Q236 92 236 152", badge: [200, 252, 92] },
};

export function ProductArt({ art, className = "" }: { art: string; className?: string }) {
  const s = SHAPES[art] ?? SHAPES.tee;
  const [bx, by, bw] = s.badge;
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="Product illustration">
      <rect width="400" height="400" fill="#F7EFCA" />
      <g fill="none" stroke="#355A35" strokeOpacity=".1" strokeWidth="2">
        {[50, 80, 110, 140, 170, 200].map((r) => <ellipse key={r} cx="300" cy="90" rx={r * 1.25} ry={r * 0.8} />)}
      </g>
      <circle cx="320" cy="300" r="70" fill="#FFBA08" opacity=".9" />
      <path d={s.body} fill="#355A35" stroke="#1F3320" strokeWidth="5" strokeLinejoin="round" />
      {s.extra && <path d={s.extra} fill="none" stroke="#1F3320" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity=".55" />}
      <image href="/brand/peak-pals-badge-reversed.svg" x={bx - bw / 2} y={by - bw / 2} width={bw} height={bw} />
    </svg>
  );
}
