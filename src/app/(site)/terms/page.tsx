import type { Metadata } from "next";
import { LegalPage } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms & conditions" };

export default function Terms() {
  return (
    <LegalPage title="Terms & conditions" updated="October 2026">
      <p>These terms apply to every event booked with {site.name}. By booking, you accept them for yourself and everyone in your booking.</p>
      <h2>Age requirement</h2>
      <p>All events are for participants aged <b>13 and over</b>. Participants aged 13 to 17 must have written consent from a parent or legal guardian, given during booking, and may be asked to attend with an adult.</p>
      <h2>Bookings and payment</h2>
      <ul>
        <li>Your spots are reserved when you submit a booking and confirmed once payment is received via {site.payment.method}.</li>
        <li>Unpaid bookings may be released [X hours/days] before the event.</li>
        <li>Prices list exactly what is included (for example, park entry fees, transport or guides).</li>
      </ul>
      <h2>Cancellations and changes</h2>
      <ul>
        <li>If you cancel: [your refund policy, e.g. full refund up to 72 hours before].</li>
        <li>We may change or cancel an event for safety reasons, such as severe weather. If we cancel, you can move to another date or receive a full refund.</li>
      </ul>
      <h2>Fitness, health and safety</h2>
      <ul>
        <li>Choose events that match your fitness. Each event is graded Easy, Moderate or Difficult.</li>
        <li>Tell us about any medical condition that may affect you on the day.</li>
        <li>Follow the instructions of guides and instructors at all times, and stay with the group.</li>
        <li>Outdoor activities carry risks. [Liability wording to be confirmed with your advocate and insurer.]</li>
      </ul>
      <h2>Photos and videos</h2>
      <p>We photograph and film our events. We only publish images of participants who gave photo consent when booking. You can withdraw consent at any time by emailing {site.email}.</p>
      <h2>Respect for nature</h2>
      <p>We follow Leave No Trace principles: stay on trails, carry out all litter and respect wildlife, local communities and park rules.</p>
    </LegalPage>
  );
}
