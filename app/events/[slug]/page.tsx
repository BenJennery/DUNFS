import Link from "next/link";
import { notFound } from "next/navigation";
import { rsvp } from "@/lib/actions";
import { getEvent } from "@/lib/data";
import { formatWhen } from "@/lib/time";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { event } = await getEvent(slug);
  return { title: event?.title ?? "Event" };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { session, event, going } = await getEvent(slug);
  if (!event) notFound();

  return (
    <article className="sheet mx-auto max-w-[1180px] px-5 py-16 md:px-8 md:py-20">
      <Link href="/events" className="mono text-[11px] tracking-[0.18em] text-[var(--cyan)]">
        EVENTS
      </Link>
      <p className="mono mt-8 text-[11px] tracking-[0.16em] text-[var(--gold)]">{formatWhen(event.starts_at)}</p>
      <h1 className="serif mt-4 max-w-3xl text-5xl leading-[0.95] md:text-7xl">{event.title}</h1>
      <p className="mt-6 text-[var(--paper-dim)]">
        {event.location || "Location to be confirmed"}
        {event.ends_at ? ` · until ${formatWhen(event.ends_at)}` : ""}
        {event.rsvp_count ? ` · ${event.rsvp_count} going` : ""}
      </p>
      {event.summary ? <p className="mt-8 max-w-xl text-lg leading-relaxed">{event.summary}</p> : null}
      {event.details ? (
        <div className="mt-8 max-w-xl whitespace-pre-wrap text-[var(--paper-dim)] leading-relaxed">{event.details}</div>
      ) : null}

      <form action={rsvp} className="mt-12 flex items-center gap-4">
        <input type="hidden" name="event_id" value={event.id} />
        <input type="hidden" name="slug" value={event.slug} />
        <input type="hidden" name="intent" value={going ? "leave" : "join"} />
        {session.user ? (
          <button className="btn" type="submit">
            {going ? "Cancel RSVP" : "RSVP"}
          </button>
        ) : (
          <Link href={`/login?next=/events/${event.slug}`} className="btn">
            Sign in to RSVP
          </Link>
        )}
      </form>
    </article>
  );
}
