export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="topo">
      <div className="wrap max-w-3xl py-14">
        <p className="kicker">Last updated {updated}</p>
        <h1 className="mt-2 text-5xl">{title}</h1>
        <div className="sticker mt-8 bg-white p-6 sm:p-10 [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-2xl [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:space-y-1">
          {children}
        </div>
        <p className="mt-4 text-sm text-moss">This page is a plain-language starting point. Please have it reviewed by a qualified advocate before launch.</p>
      </div>
    </div>
  );
}
