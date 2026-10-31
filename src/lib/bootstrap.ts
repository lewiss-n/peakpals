import path from "node:path";
import fs from "node:fs/promises";
import bcrypt from "bcryptjs";
import { count, eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { databaseUrl, db, schema, sqlClient } from "./db";
import { saveImage } from "./media";

const log = (...a: unknown[]) => console.log("[bootstrap]", ...a);

export async function bootstrap() {
  if (!databaseUrl()) {
    log("DATABASE_URL not set, skipping");
    return;
  }
  const sql = sqlClient();
  // one instance at a time
  await sql`select pg_advisory_lock(424242)`;
  try {
    const migrationsFolder = process.env.MIGRATIONS_DIR ?? path.join(process.cwd(), "drizzle");
    await migrate(db, { migrationsFolder });
    log("migrations applied");
    await ensureAdmin();
    if (process.env.SEED_DEMO === "true") await seedDemo();
  } finally {
    await sql`select pg_advisory_unlock(424242)`;
  }
}

async function ensureAdmin() {
  const [{ n }] = await db.select({ n: count() }).from(schema.users);
  if (n > 0) return;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    log("No admin user yet. Set ADMIN_EMAIL and ADMIN_PASSWORD and restart to create one.");
    return;
  }
  if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters");
  await db.insert(schema.users).values({ email, name: process.env.ADMIN_NAME ?? "Admin", passwordHash: await bcrypt.hash(password, 12) });
  log("admin user created:", email);
}

function nextSaturday(weeksAhead: number, hour: number, minute = 0) {
  const now = new Date();
  const nai = new Date(now.getTime() + 3 * 3600e3);
  const dow = nai.getUTCDay();
  const add = ((6 - dow + 7) % 7 || 7) + weeksAhead * 7;
  const d = new Date(Date.UTC(nai.getUTCFullYear(), nai.getUTCMonth(), nai.getUTCDate() + add, hour - 3, minute));
  return d;
}

async function seedDemo() {
  const [{ n: eventCount }] = await db.select({ n: count() }).from(schema.events);
  if (eventCount === 0) {
    await db.insert(schema.events).values([
      {
        slug: "karura-forest-waterfall-walk", title: "Karura Forest Waterfall Walk", activity: "HIKE", difficulty: "EASY", zone: "NEAR_NAIROBI",
        region: "Karura Forest, Nairobi", meetingPoint: "Karura Forest, Limuru Road gate", startsAt: nextSaturday(0, 7, 30),
        durationHours: 3, distanceKm: 8, elevationGainM: 120, priceKes: 1500, capacity: 30, guideRatio: "1 guide : 10 hikers",
        summary: "A gentle loop under the trees to the waterfall and caves. Perfect for your very first Peak Pals walk.",
        description: "Ease into the weekend with a shaded forest walk right inside the city. We'll follow wide trails past the river, stop at the waterfall and the caves, and finish with a slow, barefoot earthing moment on the grass.\n\nGreat for beginners, families with teens and anyone who wants fresh air without a long drive.",
        inclusions: ["Forest entry fee", "Trained guide", "Water and a fruit snack"], bring: ["Comfortable walking shoes", "1 litre of water", "Light rain jacket"],
      },
      {
        slug: "ngong-hills-ridge-walk", title: "Ngong Hills Ridge Walk", activity: "HIKE", difficulty: "MODERATE", zone: "NEAR_NAIROBI",
        region: "Ngong Hills, Kajiado", meetingPoint: "Ngong Hills Forest Station gate", startsAt: nextSaturday(1, 6, 30),
        durationHours: 5, distanceKm: 12, elevationGainM: 450, highestPointM: 2460, priceKes: 2500, capacity: 25, guideRatio: "1 guide : 8 hikers",
        summary: "Walk the famous knuckles of the Ngong Hills with wide views over the Rift Valley.",
        description: "A classic Nairobi ridge hike: rolling up and down the seven peaks of the Ngong Hills, with the city on one side and the Great Rift Valley on the other. Expect a few steep climbs, plenty of wind and a big sense of achievement.\n\nYou should be comfortable walking for 4 to 5 hours.",
        inclusions: ["Entry fees", "Trained guides", "Group photos", "Snacks at the summit"], bring: ["Hiking shoes with grip", "2 litres of water", "Sunscreen and a hat", "Warm layer"],
      },
      {
        slug: "sunrise-yoga-and-pilates", title: "Sunrise Yoga & Pilates Bootcamp", activity: "BOOTCAMP", difficulty: "EASY", zone: "NEAR_NAIROBI",
        region: "Nairobi Arboretum", meetingPoint: "Nairobi Arboretum main lawn", startsAt: nextSaturday(1, 7, 0),
        durationHours: 2, priceKes: 1000, capacity: 40, instructor: "[Instructor name]",
        summary: "Stretch, breathe and strengthen outdoors with a certified instructor. All levels welcome.",
        description: "Start your Saturday on the grass with a flowing yoga session followed by core-focused Pilates. Our instructor offers easier and harder options for every move, so it works whether it's your first class or your hundredth.",
        inclusions: ["Certified instructor", "Mats provided", "Herbal tea after the session"], bring: ["Comfortable clothes", "Water bottle", "Small towel"],
      },
      {
        slug: "zumba-and-kata-box-bootcamp", title: "Zumba & Kata-box Bootcamp", activity: "BOOTCAMP", difficulty: "MODERATE", zone: "NEAR_NAIROBI",
        region: "Nairobi", meetingPoint: "[Venue to be confirmed]", startsAt: nextSaturday(2, 8, 0),
        durationHours: 2, priceKes: 1200, capacity: 40, instructor: "[Instructor name]",
        summary: "High-energy dance cardio, then a kata-box round to finish strong. Bring your loudest playlist energy.",
        description: "Part dance party, part workout. We warm up with Zumba, move into kata-box combinations and cool down together. Expect to sweat and laugh.",
        inclusions: ["Instructor-led session", "Water station"], bring: ["Trainers", "Water bottle", "Towel"],
      },
      {
        slug: "mount-longonot-crater-rim", title: "Mount Longonot Crater Rim", activity: "HIKE", difficulty: "DIFFICULT", zone: "OUT_OF_NAIROBI",
        region: "Mt Longonot National Park, Naivasha", meetingPoint: "Pick-up: [Nairobi pick-up point]", startsAt: nextSaturday(3, 6, 0),
        durationHours: 7, distanceKm: 13.5, elevationGainM: 700, highestPointM: 2776, priceKes: 4500, capacity: 20, guideRatio: "1 guide : 6 hikers",
        summary: "Climb the volcano, then circle the crater rim to the summit. Steep, dusty and absolutely worth it.",
        description: "One of Kenya's most rewarding day hikes. A steep climb to the rim is followed by a full loop around the crater, with views down into the forested caldera and across Lake Naivasha.\n\nThis is a demanding day with loose ground. You should already be comfortable with moderate hikes.",
        inclusions: ["Return transport from Nairobi", "KWS park entry fees", "Trained guides", "Packed lunch"], bring: ["Hiking boots", "3 litres of water", "Buff or scarf for dust", "Sunscreen, hat and sunglasses"],
      },
      {
        slug: "peak-pals-50k-month", title: "Peak Pals 50K Month", activity: "RUN_CHALLENGE", difficulty: "EASY", zone: "VIRTUAL",
        region: "Anywhere", meetingPoint: "Online. Log your kilometres from anywhere.", startsAt: nextSaturday(0, 6, 0),
        durationHours: 720, distanceKm: 50, priceKes: 1000, capacity: 500,
        summary: "Run or walk 50 km over 30 days, at your pace, wherever you are. Finish together with the community.",
        description: "A virtual challenge for recreational runners and walkers. Cover 50 km in 30 days, in as many sessions as you like, and share your progress with the Peak Pals community. Perfect for building a habit.",
        inclusions: ["Challenge registration", "Weekly check-ins", "Finisher shout-out"], bring: ["Any running or walking app to track your distance"],
      },
      {
        slug: "elephant-hill-summit", title: "Elephant Hill Summit", activity: "HIKE", difficulty: "DIFFICULT", zone: "OUT_OF_NAIROBI",
        region: "Aberdare Range", meetingPoint: "Pick-up: [Nairobi pick-up point]", startsAt: nextSaturday(5, 5, 0),
        durationHours: 9, distanceKm: 15, elevationGainM: 1000, highestPointM: 3590, priceKes: 5500, capacity: 16, guideRatio: "1 guide : 5 hikers",
        summary: "A long day through bamboo and moorland to one of the Aberdares' best viewpoints.",
        description: "Our toughest day hike. We climb through forest and bamboo onto open moorland to the summit of Elephant Hill. Cold mornings, muddy sections and big rewards.\n\nRecommended only after you've completed at least one Difficult hike.",
        inclusions: ["Return transport", "Forest fees", "Trained guides", "Packed lunch"], bring: ["Waterproof hiking boots", "Warm jacket and gloves", "3 litres of water", "Headlamp"],
      },
    ]);
    log("demo events added");
  }

  const [{ n: productCount }] = await db.select({ n: count() }).from(schema.products);
  if (productCount === 0) {
    await db.insert(schema.products).values([
      { slug: "conquer-your-peak-tee", name: "Conquer Your Peak Tee", category: "Apparel", art: "tee", priceKes: 1800, featured: true, sortOrder: 1,
        sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Forest", "Cream"],
        summary: "Soft cotton tee with the Peak Pals badge on the chest and the trail motto on the back.",
        description: "Our everyday trail tee. Breathable cotton, a relaxed fit and the full Peak Pals badge on the left chest. Wear it on the trail, at bootcamp or on the commute." },
      { slug: "trail-crew-hoodie", name: "Trail Crew Hoodie", category: "Apparel", art: "hoodie", priceKes: 3800, featured: true, sortOrder: 2,
        sizes: ["S", "M", "L", "XL"], colors: ["Forest", "Earth Brown"],
        summary: "Cosy heavyweight hoodie for cold summit mornings and campfire evenings.",
        description: "A warm, heavyweight hoodie with a roomy front pocket and the Peak Pals badge. Perfect for 5 am starts and chilly descents." },
      { slug: "peak-pals-cap", name: "Peak Pals Trail Cap", category: "Headwear", art: "cap", priceKes: 1200, featured: true, sortOrder: 3,
        colors: ["Forest", "Savanna Gold"],
        summary: "Lightweight, adjustable cap to keep the sun off on open ridges.",
        description: "Breathable, quick-drying and adjustable at the back. Embroidered badge on the front." },
      { slug: "summit-water-bottle", name: "Summit Water Bottle", category: "Gear", art: "bottle", priceKes: 2200, featured: true, sortOrder: 4,
        summary: "750 ml insulated steel bottle. Keeps water cold all the way up.",
        description: "Double-walled stainless steel keeps drinks cold for hours. Leak-proof lid and a loop to clip it to your pack." },
      { slug: "multi-buff", name: "Peak Pals Buff", category: "Accessories", art: "buff", priceKes: 800, sortOrder: 5,
        colors: ["Forest", "Sunset Orange"],
        summary: "Neck gaiter, headband or dust mask: one buff, a dozen uses on dusty trails.",
        description: "Stretchy, breathable tube you can wear a dozen ways. A must for dusty crater-rim hikes." },
      { slug: "canvas-tote", name: "Trailhead Tote", category: "Accessories", art: "tote", priceKes: 1000, sortOrder: 6,
        summary: "Sturdy canvas tote for market runs, gym kit and post-hike snacks.",
        description: "Heavy canvas tote with long handles and the full Peak Pals logo." },
    ]);
    log("demo merch added");
  }

  const [{ n: albumCount }] = await db.select({ n: count() }).from(schema.albums);
  if (albumCount === 0) {
    const dir = process.env.SEED_DIR ?? path.join(process.cwd(), "seed", "images");
    let files: string[] = [];
    try { files = (await fs.readdir(dir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort(); } catch { /* none */ }
    if (!files.length) return;
    const captions: Record<string, string> = {
      "trail-companions": "Two pals, one trail, a whole lot of mountain.",
      "green-valley": "That moment the valley opens up below you.",
      "snowy-ridges": "Last light on the ridges.",
      "winding-meadow-path": "Wildflowers and a path that keeps going.",
      "forest-trail": "Into the green, one step at a time.",
      "ridge-walker": "Walking the knife edge.",
    };
    const [album] = await db.insert(schema.albums).values({
      slug: "trail-moments", title: "Trail Moments", date: new Date(Date.now() - 21 * 864e5),
      location: "Past Peak Pals adventures",
      story: "A few of our favourite frames from past hikes: big views, quiet forest paths and the friends who made every climb lighter. More albums land here after every event.",
      guideNote: "Every photo here is real. No filters needed.",
    }).returning();
    let cover: string | null = null;
    for (const [i, f] of files.entries()) {
      const key = f.replace(/\.[^.]+$/, "");
      const row = await saveImage(await fs.readFile(path.join(dir, f)), { albumId: album.id, caption: captions[key] ?? null, alt: captions[key] ?? "Peak Pals hike photo", sortOrder: i });
      if (key === "trail-companions" || !cover) cover = row.id;
    }
    await db.update(schema.albums).set({ coverMediaId: cover }).where(eq(schema.albums.id, album.id));
    log(`starter album added with ${files.length} photos`);
  }
}
