import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { setEnquiryStatus } from "@/lib/actions/admin";
import { fmtDate } from "@/lib/format";

export const metadata = { title: "Enquiries" };
const LABEL = { NEW: "New", CONTACTED: "Contacted", CLOSED: "Closed" } as const;
const TONE = { NEW: "bg-gold/30", CONTACTED: "bg-olive/25", CLOSED: "bg-night/10" } as const;

export default async function Enquiries() {
  const rows = await db.select().from(schema.enquiries).orderBy(desc(schema.enquiries.createdAt)).limit(300);
  return (
    <div className="flex flex-col gap-6">
      <div><p className="kicker">Team building</p><h1 className="mt-1 text-4xl">Enquiries</h1></div>
      <ul className="flex flex-col gap-4">
        {rows.map((e) => (
          <li key={e.id} className="sticker bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-moss">{fmtDate(e.createdAt, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                <p className="font-display text-xl font-bold text-forest">{e.organisation}</p>
                <p className="text-sm">{e.contactName} · <a className="underline" href={`mailto:${e.email}`}>{e.email}</a>{e.phone && <> · <a className="underline" href={`tel:${e.phone}`}>{e.phone}</a></>}</p>
                <p className="mt-1 text-sm">{e.groupSize ? `${e.groupSize} people` : "Group size not given"}{e.preferredDate ? ` · ${e.preferredDate}` : ""}{e.interests.length ? ` · ${e.interests.join(", ")}` : ""}</p>
                {e.message && <p className="mt-3 whitespace-pre-line rounded-2xl bg-cream p-3 text-sm">{e.message}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`rounded-full px-3 py-1 font-display text-sm font-bold ${TONE[e.status]}`}>{LABEL[e.status]}</span>
                <div className="flex gap-2">
                  {(Object.keys(LABEL) as (keyof typeof LABEL)[]).filter((s) => s !== e.status).map((s) => (
                    <form key={s} action={setEnquiryStatus}><input type="hidden" name="id" value={e.id} /><input type="hidden" name="status" value={s} /><button className="btn btn-ghost !min-h-9 !px-3 !py-1 text-sm">Mark {LABEL[s].toLowerCase()}</button></form>
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}
        {!rows.length && <li className="sticker bg-white p-10 text-center text-moss">No enquiries yet.</li>}
      </ul>
    </div>
  );
}
