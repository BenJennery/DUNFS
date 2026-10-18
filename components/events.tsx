import Link from "next/link";
import { formatWhen } from "@/lib/time";
import type { SocietyEvent } from "@/lib/types";

export function EventRows({ events, withSummary = false }: { events: SocietyEvent[]; withSummary?: boolean }) {
  if (!events.length) {
    return <p className="text-[var(--paper-dim)]">Nothing on the board yet.</p>;
  }

  return (
    <ul>
      {events.map((event) => (
        <li key={event.id} className="border-b border-[var(--line)]">
          <Link href={`/events/${event.slug}`} className="group grid gap-2 py-6 md:grid-cols-12 md:gap-6">
            <time className="mono text-[11px] tracking-[0.14em] text-[var(--cyan)] md:col-span-4 md:pt-2">
              {formatWhen(event.starts_at)}
            </time>
            <span className="md:col-span-5">
              <span className="serif block text-3xl leading-none group-hover:italic md:text-4xl">{event.title}</span>
              {withSummary && event.summary ? (
                <span className="mt-3 block max-w-md text-sm leading-relaxed text-[var(--paper-dim)]">{event.summary}</span>
              ) : null}
            </span>
            <span className="text-sm text-[var(--paper-dim)] md:col-span-3 md:pt-2 md:text-right">{event.location}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
