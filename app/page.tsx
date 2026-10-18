import Link from "next/link";
import { Index } from "@/components/chrome";
import { EventRows } from "@/components/events";
import { subscribe } from "@/lib/actions";
import { kindLabel, tierLabel, tierOrder } from "@/lib/copy";
import { getHome } from "@/lib/data";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { copy, events, committee, sponsors, activities } = await getHome();
  const next = events[0];
  const grouped = tierOrder
    .map((tier) => ({ tier, rows: sponsors.filter((sponsor) => sponsor.tier === tier) }))
    .filter((group) => group.rows.length);

  return (
    <>
      <section className="relative mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-[1180px] flex-col justify-end px-5 pb-16 pt-20 md:px-8 md:pb-24">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[min(100%,52rem)] bg-gradient-to-r from-[#07111c] via-[#07111cf2] to-transparent" />
        <div className="relative">
        <p className="mono text-[11px] tracking-[0.28em] text-[var(--cyan)]">UNIVERSITY OF DURHAM</p>
        <h1 className="serif mt-6 max-w-[10ch] text-[clamp(3.75rem,7vw,6.6rem)] leading-[0.86] text-[var(--paper)]">
          Fusion
          <br />
          <em className="italic">in Durham.</em>
        </h1>
        <p className="mt-8 max-w-md text-lg leading-relaxed text-[var(--paper-dim)]">{copy.intro}</p>
        {next ? (
          <Link href={`/events/${next.slug}`} className="mt-10 inline-flex max-w-xl items-baseline gap-4 border-b border-[var(--line)] pb-3">
            <span className="mono text-[11px] tracking-[0.2em] text-[var(--gold)]">NEXT</span>
            <span className="serif text-2xl md:text-3xl">{next.title}</span>
          </Link>
        ) : (
          <Link href="/join" className="btn mt-10 w-fit">
            Join the society
          </Link>
        )}
        </div>
      </section>

      {activities.length ? (
        <section className="sheet border-t border-[var(--line)]">
          <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-16 md:grid-cols-12 md:px-8 md:py-20">
            <div className="md:col-span-3">
              <Index n="01" label="PROGRAMME" />
            </div>
            <ul className="md:col-span-9">
              {activities.map((activity) => (
                <li key={activity.id} className="grid gap-2 border-b border-[var(--line)] py-5 md:grid-cols-12">
                  <span className="mono text-[11px] tracking-[0.16em] text-[var(--gold)] md:col-span-3">
                    {kindLabel[activity.kind].toUpperCase()}
                  </span>
                  <span className="md:col-span-9">
                    <span className="serif block text-3xl">{activity.title}</span>
                    {activity.summary ? <span className="mt-2 block text-sm text-[var(--paper-dim)]">{activity.summary}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="sheet border-t border-[var(--line)]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-16 md:grid-cols-12 md:px-8 md:py-20">
          <div className="md:col-span-3">
            <Index n={activities.length ? "02" : "01"} label="EVENTS" />
          </div>
          <div className="md:col-span-9">
            <EventRows events={events} />
            <Link href="/events" className="mt-6 inline-block text-sm text-[var(--cyan)]">
              Full board
            </Link>
          </div>
        </div>
      </section>

      <section className="sheet border-t border-[var(--line)]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-16 md:grid-cols-12 md:px-8 md:py-20">
          <div className="md:col-span-3">
            <Index n={activities.length ? "03" : "02"} label="MEMBERS" />
          </div>
          <div className="md:col-span-9">
            {committee.length ? (
              <ul className="grid gap-8 sm:grid-cols-2">
                {committee.map((person) => (
                  <li key={person.id}>
                    <p className="mono text-[11px] tracking-[0.16em] text-[var(--gold)]">
                      {(person.committee_title || "Committee").toUpperCase()}
                    </p>
                    <p className="serif mt-2 text-3xl">{person.full_name || "Member"}</p>
                    {person.course ? <p className="mt-2 text-sm text-[var(--paper-dim)]">{person.course}</p> : null}
                    {person.bio ? <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--paper-dim)]">{person.bio}</p> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[var(--paper-dim)]">Committee seats will be listed here.</p>
            )}
            <Link href="/members" className="mt-8 inline-block text-sm text-[var(--cyan)]">
              Member list
            </Link>
          </div>
        </div>
      </section>

      <section className="sheet border-t border-[var(--line)]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-16 md:grid-cols-12 md:px-8 md:py-20">
          <div className="md:col-span-3">
            <Index n={activities.length ? "04" : "03"} label="SPONSORS" />
          </div>
          <div className="md:col-span-9">
            {grouped.length ? (
              <div className="space-y-8">
                {grouped.map((group) => (
                  <div key={group.tier}>
                    <p className="mono text-[11px] tracking-[0.16em] text-[var(--gold)]">{tierLabel[group.tier].toUpperCase()}</p>
                    <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
                      {group.rows.map((sponsor) => (
                        <li key={sponsor.id} className="serif text-3xl">
                          {sponsor.url ? (
                            <a href={sponsor.url} target="_blank" rel="noreferrer">
                              {sponsor.name}
                            </a>
                          ) : (
                            sponsor.name
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="max-w-md text-[var(--paper-dim)]">The society is open to partners who want fusion taught, built, and visited.</p>
            )}
            <Link href="/sponsors" className="mt-8 inline-block text-sm text-[var(--cyan)]">
              Support the society
            </Link>
          </div>
        </div>
      </section>

      <section id="newsletter" className="sheet border-t border-[var(--line)]">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-16 md:grid-cols-12 md:px-8 md:py-20">
          <div className="md:col-span-3">
            <Index n={activities.length ? "05" : "04"} label="NEWSLETTER" />
          </div>
          <div className="md:col-span-9">
            <p className="max-w-md text-[var(--paper-dim)]">A short note when something is on. No filler.</p>
            {params.error ? <p className="mt-4 text-sm text-[var(--warn)]">{params.error}</p> : null}
            {params.notice ? <p className="mt-4 text-sm text-[var(--gold)]">{params.notice}</p> : null}
            <form action={subscribe} className="mt-6 flex max-w-lg flex-col gap-4 sm:flex-row sm:items-end">
              <label className="field flex-1">
                <span>Email</span>
                <input name="email" type="email" required autoComplete="email" placeholder="you@durham.ac.uk" />
              </label>
              <input name="company_website" className="hidden" tabIndex={-1} autoComplete="off" />
              <button className="btn" type="submit">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
