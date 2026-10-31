/** Lightweight server-rendered SVG charts (no client JS). */

export function TrendChart({ data, series }: { data: Record<string, number | string>[]; series: { key: string; label: string; color: string; fill?: boolean }[] }) {
  const W = 760, H = 240, pl = 36, pr = 28, pt = 14, pb = 28;
  const max = Math.max(4, ...data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0)));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const x = (i: number) => pl + (data.length <= 1 ? 0 : (i / (data.length - 1)) * (W - pl - pr));
  const y = (v: number) => pt + (1 - v / top) * (H - pt - pb);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(top * t));
  const labelEvery = Math.ceil(data.length / 7);
  const fmt = (s: string) => new Date(s + "T12:00:00").toLocaleDateString("en-KE", { day: "numeric", month: "short" });
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Daily ${series.map((s) => s.label.toLowerCase()).join(" and ")}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pl} x2={W - pr} y1={y(t)} y2={y(t)} stroke="#1F3320" strokeOpacity=".08" />
            <text x={pl - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#4B5A47">{t}</text>
          </g>
        ))}
        {data.map((d, i) => (i % labelEvery === 0 || i === data.length - 1) && (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#4B5A47">{fmt(String(d.day))}</text>
        ))}
        {series.map((s) => {
          const pts = data.map((d, i) => `${x(i).toFixed(1)},${y(Number(d[s.key]) || 0).toFixed(1)}`);
          return (
            <g key={s.key}>
              {s.fill && <path d={`M${x(0)},${y(0)} L${pts.join(" L")} L${x(data.length - 1)},${y(0)} Z`} fill={s.color} fillOpacity=".15" />}
              <polyline points={pts.join(" ")} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {data.map((d, i) => (
                <circle key={i} cx={x(i)} cy={y(Number(d[s.key]) || 0)} r={data.length > 40 ? 0 : 3} fill={s.color}>
                  <title>{`${fmt(String(d.day))}: ${d[s.key]} ${s.label.toLowerCase()}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-4 text-sm">
        {series.map((s) => <span key={s.key} className="inline-flex items-center gap-2 font-semibold"><span className="h-1 w-5 rounded-full" style={{ background: s.color }} />{s.label}</span>)}
      </figcaption>
    </figure>
  );
}

export function BarList({ items, empty = "No data yet" }: { items: { label: string; value: number; href?: string }[]; empty?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length) return <p className="py-6 text-center text-sm text-moss">{empty}</p>;
  return (
    <ul className="flex flex-col gap-2">
      {items.map((i) => (
        <li key={i.label} className="relative flex items-center justify-between gap-3 overflow-hidden rounded-xl px-3 py-2 text-sm">
          <span className="absolute inset-y-0 left-0 rounded-xl bg-olive/20" style={{ width: `${(i.value / max) * 100}%` }} aria-hidden />
          <span className="relative truncate font-semibold">{i.label}</span>
          <span className="relative font-display font-bold text-forest">{i.value.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}

export function Donut({ items }: { items: { label: string; value: number; color: string }[] }) {
  const total = items.reduce((a, b) => a + b.value, 0);
  if (!total) return <p className="py-6 text-center text-sm text-moss">No data yet</p>;
  let acc = 0;
  const r = 40, c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" className="size-28 shrink-0 -rotate-90" role="img" aria-label={items.map((i) => `${i.label} ${Math.round((i.value / total) * 100)}%`).join(", ")}>
        {items.map((i) => {
          const len = (i.value / total) * c;
          const el = <circle key={i.label} cx="50" cy="50" r={r} fill="none" stroke={i.color} strokeWidth="16" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} />;
          acc += len;
          return el;
        })}
      </svg>
      <ul className="flex flex-col gap-1.5 text-sm">
        {items.map((i) => <li key={i.label} className="flex items-center gap-2"><span className="size-3 rounded-full" style={{ background: i.color }} /><span className="font-semibold capitalize">{i.label}</span><span className="text-moss">{Math.round((i.value / total) * 100)}%</span></li>)}
      </ul>
    </div>
  );
}
