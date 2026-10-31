import { EventForm } from "@/components/admin/EventForm";

export const metadata = { title: "New event" };

export default function NewEvent() {
  return (
    <div>
      <p className="kicker">Events</p>
      <h1 className="mt-1 text-4xl">New event</h1>
      <EventForm />
    </div>
  );
}
