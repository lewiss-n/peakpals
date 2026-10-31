import { sql } from "drizzle-orm";
import { db } from "./db";

export const RANGES = { "7d": 7, "30d": 30, "90d": 90 } as const;
export type RangeKey = keyof typeof RANGES;

type Row = Record<string, unknown>;
const rows = async <T extends Row>(q: ReturnType<typeof sql>) => (await db.execute<T>(q)) as unknown as T[];

export async function getDashboard(range: RangeKey) {
  const days = RANGES[range];
  const since = sql`(date_trunc('day', now() at time zone 'Africa/Nairobi') - make_interval(days => ${days - 1})) at time zone 'Africa/Nairobi'`;
  const prevSince = sql`(date_trunc('day', now() at time zone 'Africa/Nairobi') - make_interval(days => ${days * 2 - 1})) at time zone 'Africa/Nairobi'`;

  const [totals] = await rows<{ views: number; visitors: number; sessions: number; pviews: number; pvisitors: number }>(sql`
    select
      count(*) filter (where created_at >= ${since})::int as views,
      count(distinct visitor_id) filter (where created_at >= ${since})::int as visitors,
      count(distinct session_id) filter (where created_at >= ${since})::int as sessions,
      count(*) filter (where created_at < ${since})::int as pviews,
      count(distinct visitor_id) filter (where created_at < ${since})::int as pvisitors
    from page_views where created_at >= ${prevSince}`);

  const [bk] = await rows<{ bookings: number; people: number; revenue: number; pending: number; pbookings: number }>(sql`
    select
      count(*) filter (where created_at >= ${since} and status <> 'CANCELLED')::int as bookings,
      coalesce(sum(participant_count) filter (where created_at >= ${since} and status <> 'CANCELLED'),0)::int as people,
      coalesce(sum(total_kes) filter (where created_at >= ${since} and status = 'CONFIRMED'),0)::int as revenue,
      coalesce(sum(total_kes) filter (where created_at >= ${since} and status = 'PENDING'),0)::int as pending,
      count(*) filter (where created_at < ${since} and status <> 'CANCELLED')::int as pbookings
    from bookings where created_at >= ${prevSince}`);

  const daily = await rows<{ day: string; views: number; visitors: number; bookings: number }>(sql`
    with d as (
      select generate_series(date_trunc('day', now() at time zone 'Africa/Nairobi') - make_interval(days => ${days - 1}),
                             date_trunc('day', now() at time zone 'Africa/Nairobi'), interval '1 day')::date as day
    ),
    pv as (
      select (created_at at time zone 'Africa/Nairobi')::date as day, count(*)::int as views, count(distinct visitor_id)::int as visitors
      from page_views where created_at >= ${since} group by 1
    ),
    b as (
      select (created_at at time zone 'Africa/Nairobi')::date as day, count(*)::int as bookings
      from bookings where created_at >= ${since} and status <> 'CANCELLED' group by 1
    )
    select to_char(d.day, 'YYYY-MM-DD') as day, coalesce(pv.views,0)::int as views, coalesce(pv.visitors,0)::int as visitors, coalesce(b.bookings,0)::int as bookings
    from d left join pv on pv.day = d.day left join b on b.day = d.day order by d.day`);

  const topPages = await rows<{ path: string; views: number; visitors: number }>(sql`
    select path, count(*)::int as views, count(distinct visitor_id)::int as visitors
    from page_views where created_at >= ${since} group by path order by views desc limit 8`);
  const referrers = await rows<{ source: string; visitors: number }>(sql`
    select coalesce(utm_source, referrer, 'Direct') as source, count(distinct visitor_id)::int as visitors
    from page_views where created_at >= ${since} group by 1 order by visitors desc limit 8`);
  const devices = await rows<{ device: string; visitors: number }>(sql`
    select device, count(distinct visitor_id)::int as visitors from page_views where created_at >= ${since} group by device order by visitors desc`);
  const browsers = await rows<{ browser: string; visitors: number }>(sql`
    select coalesce(browser,'Other') as browser, count(distinct visitor_id)::int as visitors from page_views where created_at >= ${since} group by 1 order by visitors desc limit 6`);
  const eventFunnel = await rows<{ id: string; title: string; slug: string; starts_at: string; capacity: number; booked: number; views: number; bookings: number }>(sql`
    select e.id, e.title, e.slug, e.starts_at, e.capacity,
      coalesce((select sum(participant_count) from bookings b where b.event_id = e.id and b.status <> 'CANCELLED'),0)::int as booked,
      coalesce((select count(*) from page_views p where p.path = '/events/' || e.slug and p.created_at >= ${since}),0)::int as views,
      coalesce((select count(*) from bookings b where b.event_id = e.id and b.status <> 'CANCELLED' and b.created_at >= ${since}),0)::int as bookings
    from events e where e.starts_at >= now() - interval '6 hours' order by e.starts_at limit 8`);
  const [counts] = await rows<{ subscribers: number; newSubs: number; enquiries: number; newEnquiries: number; upcoming: number; merchPending: number; merchRevenue: number; merchItems: number }>(sql`
    select (select count(*) from subscribers)::int as "subscribers",
      (select count(*) from subscribers where created_at >= ${since})::int as "newSubs",
      (select count(*) from enquiries)::int as "enquiries",
      (select count(*) from enquiries where status = 'NEW')::int as "newEnquiries",
      (select count(*) from events where starts_at >= now() and published)::int as "upcoming",
      (select count(*) from merch_orders where status = 'PENDING')::int as "merchPending",
      coalesce((select sum(total_kes) from merch_orders where status in ('PAID','FULFILLED') and created_at >= ${since}),0)::int as "merchRevenue",
      coalesce((select sum(quantity) from merch_orders where status <> 'CANCELLED' and created_at >= ${since}),0)::int as "merchItems"`);
  const [live] = await rows<{ now: number }>(sql`select count(distinct visitor_id)::int as now from page_views where created_at >= now() - interval '5 minutes'`);

  return { days, totals, bk, daily, topPages, referrers, devices, browsers, eventFunnel, counts, live: live?.now ?? 0 };
}
