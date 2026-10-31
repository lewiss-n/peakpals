export function SpotsBar({ left, capacity }: { left: number; capacity: number }) {
  const pct = Math.round(((capacity - left) / capacity) * 100);
  const hot = left > 0 && left <= Math.max(3, capacity * 0.2);
  return (
    <div className="flex items-center gap-3">
      <div className="h-3 flex-1 overflow-hidden rounded-full border-2 border-night bg-cream" aria-hidden>
        <div className={`h-full ${left === 0 ? "bg-brown" : hot ? "bg-orange" : "bg-olive"}`} style={{ width: `${Math.max(pct, 4)}%` }} />
      </div>
      <span className="shrink-0 font-display text-sm font-bold">
        {left === 0 ? "Fully booked" : hot ? `Only ${left} left!` : `${left} of ${capacity} spots left`}
      </span>
    </div>
  );
}
