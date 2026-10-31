import type { Metadata } from "next";
import { LegalPage } from "@/components/Prose";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy policy" updated="October 2026">
      <p>{site.name} (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains what personal data we collect, why, and your rights under Kenya&apos;s Data Protection Act, 2019.</p>
      <h2>What we collect</h2>
      <ul>
        <li><b>Bookings:</b> your name, email, phone number, the names and ages of participants, any notes you share (such as medical or dietary needs) and, for participants under 18, a parent or guardian&apos;s name, phone number and consent.</li>
        <li><b>Consents:</b> whether you agreed to photography and to these terms, and when.</li>
        <li><b>Enquiries and newsletter:</b> the contact details and message you send us.</li>
        <li><b>Website analytics:</b> pages viewed, the referring website, device type and browser. We use a random identifier stored in a first-party cookie. We do not store your IP address, and we do not track you if your browser sends a Do Not Track or Global Privacy Control signal.</li>
      </ul>
      <h2>Why we use it</h2>
      <ul>
        <li>To manage your booking, keep you safe on the day and contact you about the event.</li>
        <li>To reply to enquiries and, if you subscribed, send you news about upcoming adventures.</li>
        <li>To publish photos and videos of participants who have given photo consent.</li>
        <li>To understand how the website is used so we can improve it.</li>
      </ul>
      <h2>Sharing</h2>
      <p>We share booking details only with guides, instructors and partners who need them to run your event (for example, park authorities). We never sell your data.</p>
      <h2>How long we keep it</h2>
      <p>Booking records are kept for [retention period] after the event, then deleted or anonymised. Analytics data is kept for [retention period]. You can unsubscribe from emails at any time.</p>
      <h2>Your rights</h2>
      <p>You can ask to access, correct or delete your personal data, object to its use or withdraw consent (including photo consent) at any time. Contact us at <a className="underline" href={`mailto:${site.email}`}>{site.email}</a>. You can also complain to the Office of the Data Protection Commissioner.</p>
      <h2>Contact</h2>
      <p>Data controller: {site.name}, {site.city}. Email: {site.email}. Phone: {site.phone}.</p>
    </LegalPage>
  );
}
