const ITEMS = ["Day hikes", "Zumba", "Yoga", "Pilates", "Kata-box", "Virtual run challenges", "Team building", "Slow walks", "Earthing", "Sunrise summits"];

export function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden border-y-2 border-navy bg-orange py-3" aria-label="What we do">
      <div className="flex w-max animate-marquee gap-8 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-8 font-display text-xl font-bold text-navy" aria-hidden={i >= ITEMS.length}>
            {t}
            <svg viewBox="0 0 10 9" className="h-3 w-3.5 text-white"><path d="M0 9 5 0l5 9z" fill="currentColor" /></svg>
          </span>
        ))}
      </div>
    </div>
  );
}
