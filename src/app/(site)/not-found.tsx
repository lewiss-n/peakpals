import Link from "next/link";

export default function NotFound() {
  return (
    <div className="topo">
      <div className="wrap flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="hand text-4xl text-brown">Hmm, wrong turn.</p>
        <h1 className="mt-2 text-6xl">This trail doesn&apos;t exist</h1>
        <p className="mt-4 max-w-md text-lg text-moss">The page may have moved, or the event has been taken down.</p>
        <div className="mt-8 flex gap-3"><Link href="/" className="btn btn-primary">Back to base camp</Link><Link href="/events" className="btn btn-ghost">See events</Link></div>
      </div>
    </div>
  );
}
