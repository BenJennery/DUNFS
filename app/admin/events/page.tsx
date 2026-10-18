import Link from "next/link";
import { Flash } from "@/components/chrome";
import { createEvent } from "@/lib/actions";
import { adminEvents } from "@/lib/data";
import { formatWhen } from "@/lib/time";

export const metadata = { title: "Events admin" };

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { rows, error } = await adminEvents();

  return (
    <div>
      <h1 className="serif text-5xl">Events</h1>
      <Flash notice={params.notice} error={params.error || error} />
      <form action={createEvent} className="mt-8 grid gap-5 border-b border-[var(--line)] pb-10">
        <label className="field">
          <span>Title</span>
          <input name="title" required />
        </label>
        <label className="field">
          <span>Summary</span>
          <input name="summary" />
        </label>
        <label className="field">
          <span>Details</span>
          <textarea name="details" />
        </label>
        <label className="field">
          <span>Location</span>
          <input name="location" />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field">
            <span>Starts, UK time</span>
            <input name="starts_at" type="datetime-local" required />
          </label>
          <label className="field">
            <span>Ends, UK time</span>
            <input name="ends_at" type="datetime-local" />
          </label>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input name="published" type="checkbox" defaultChecked />
          Published
        </label>
        <button className="btn w-fit" type="submit">
          Create event
        </button>
      </form>
      <ul className="mt-6">
        {rows.map((event) => (
          <li key={event.id} className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[var(--line)] py-4">
            <div>
              <Link href={`/admin/events/${event.id}`} className="serif text-2xl">
                {event.title}
              </Link>
              <p className="mt-1 text-sm text-[var(--paper-dim)]">
                {formatWhen(event.starts_at)} · {event.published ? "Published" : "Draft"} · {event.rsvp_count} going
              </p>
            </div>
            <Link href={`/events/${event.slug}`} className="text-sm text-[var(--cyan)]">
              View
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
