/** Business details shown across the site. Edit these before launch. */
export const site = {
  name: "Peak Pals Adventures",
  tagline: "Conquer your peak",
  url: process.env.SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  city: "Nairobi, Kenya",
  email: "hello@peakpals.co.ke", // [placeholder]
  phone: "+254 700 000 000", // [placeholder]
  whatsapp: "254700000000", // [placeholder] international format, no +
  payment: {
    method: "M-Pesa Paybill",
    paybill: "[PAYBILL]",
    account: "your booking reference",
  },
  socials: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "TikTok", href: "https://tiktok.com/" },
    { label: "Facebook", href: "https://facebook.com/" },
  ],
};
