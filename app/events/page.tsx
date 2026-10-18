import { EventRows } from "@/components/events";
import { getEvents } from "@/lib/data";

export const metadata = { title: "Events" };

export default async function EventsPage() {
  const events = await getEvents();
  const now = Date.now();
  const upcoming = events.filter((event) => new Date(event.starts_at).getTime() >= now).reverse();
  const past = events.filter((event) => new Date(event.starts_at).getTime() < now);

  return (
    <div className="sheet mx-auto max-w-[1180px] px-5 py-16 md:px-8 md:py-20">
      <p className="mono text-[11px] tracking-[0.22em] text-[var(--cyan)]">BOARD</p>
      <h1 className="serif mt-4 text-6xl md:text-7xl">Events</h1>
      <div className="mt-12">
        <EventRows events={upcoming} withSummary />
      </div>
      {past.length ? (
        <div className="mt-16">
          <p className="mono text-[11px] tracking-[0.18em] text-[var(--cyan)]">EARLIER</p>
          <div className="mt-4 opacity-80">
            <EventRows events={past} withSummary />
          </div>
        </div>
      ) : null}
    </div>
  );
}
