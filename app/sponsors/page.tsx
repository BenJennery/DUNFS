import { Flash } from "@/components/chrome";
import { sendInquiry } from "@/lib/actions";
import { tierLabel, tierNote, tierOrder } from "@/lib/copy";
import { getSponsors } from "@/lib/data";

export const metadata = { title: "Sponsors" };

export default async function SponsorsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const sponsors = await getSponsors();

  return (
    <div className="sheet mx-auto max-w-[1180px] px-5 py-16 md:px-8 md:py-20">
      <p className="mono text-[11px] tracking-[0.22em] text-[var(--cyan)]">SUPPORT</p>
      <h1 className="serif mt-4 max-w-[14ch] text-6xl leading-[0.92] md:text-7xl">Sponsors</h1>
      <p className="mt-6 max-w-lg text-lg text-[var(--paper-dim)]">
        Lectures, visits, and student builds run on partnership. Write if you want your name on the drawing.
      </p>

      <div className="mt-14 grid gap-10 md:grid-cols-3">
        {tierOrder.map((tier) => {
          const rows = sponsors.filter((sponsor) => sponsor.tier === tier);
          return (
            <section key={tier} className="border-t border-[var(--line)] pt-5">
              <h2 className="serif text-4xl">{tierLabel[tier]}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--paper-dim)]">{tierNote[tier]}</p>
              {rows.length ? (
                <ul className="mt-6 space-y-3">
                  {rows.map((sponsor) => (
                    <li key={sponsor.id}>
                      {sponsor.url ? (
                        <a href={sponsor.url} className="text-lg" target="_blank" rel="noreferrer">
                          {sponsor.name}
                        </a>
                      ) : (
                        <span className="text-lg">{sponsor.name}</span>
                      )}
                      {sponsor.note ? <span className="mt-1 block text-sm text-[var(--paper-dim)]">{sponsor.note}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>

      <form action={sendInquiry} className="mt-20 max-w-xl border-t border-[var(--line)] pt-10">
        <Flash notice={params.notice} error={params.error} />
        <div className="grid gap-6">
          <label className="field">
            <span>Organisation</span>
            <input name="organisation" required />
          </label>
          <label className="field">
            <span>Your name</span>
            <input name="contact_name" required />
          </label>
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" required />
          </label>
          <label className="field">
            <span>Note</span>
            <textarea name="message" placeholder="What you would like to support." />
          </label>
          <input name="company_website" className="hidden" tabIndex={-1} autoComplete="off" />
          <button className="btn w-fit" type="submit">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
