import Link from "next/link";
import { membershipLabel } from "@/lib/copy";
import { getMembers } from "@/lib/data";

export const metadata = { title: "Members" };

const roleRank = { admin: 0, committee: 1, member: 2 };

export default async function MembersPage() {
  const { session, committee, directory } = await getMembers();
  const ordered = [...directory].sort((a, b) => {
    const byRole = roleRank[a.role] - roleRank[b.role];
    if (byRole !== 0) return byRole;
    return (a.full_name || "").localeCompare(b.full_name || "");
  });

  return (
    <div className="sheet mx-auto max-w-[1180px] px-5 py-16 md:px-8 md:py-20">
      <p className="mono text-[11px] tracking-[0.22em] text-[var(--cyan)]">SOCIETY</p>
      <h1 className="serif mt-4 text-6xl md:text-7xl">Members</h1>

      <div className="mt-14">
        {committee.length ? (
          <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {committee.map((person) => (
              <li key={person.id} className="border-t border-[var(--line)] pt-5">
                <p className="mono text-[11px] tracking-[0.16em] text-[var(--gold)]">
                  {(person.committee_title || person.role).toUpperCase()}
                </p>
                <p className="serif mt-3 text-4xl">{person.full_name || "Member"}</p>
                <p className="mt-2 text-sm text-[var(--paper-dim)]">
                  {[person.course, membershipLabel[person.membership]].filter(Boolean).join(" · ")}
                </p>
                {person.bio ? <p className="mt-4 text-sm leading-relaxed text-[var(--paper-dim)]">{person.bio}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[var(--paper-dim)]">The committee will appear here once seats are published.</p>
        )}
      </div>

      <div className="mt-20 border-t border-[var(--line)] pt-10">
        {session.user ? (
          <>
            <p className="mono text-[11px] tracking-[0.18em] text-[var(--cyan)]">DIRECTORY</p>
            <ul className="mt-6">
              {ordered.map((person) => (
                <li key={person.id} className="grid gap-2 border-b border-[var(--line)] py-4 md:grid-cols-12">
                  <span className="serif text-2xl md:col-span-5">{person.full_name || "Unnamed member"}</span>
                  <span className="text-sm text-[var(--paper-dim)] md:col-span-4 md:pt-2">
                    {[person.course, membershipLabel[person.membership]].filter(Boolean).join(" · ")}
                  </span>
                  <span className="mono text-[11px] tracking-[0.14em] text-[var(--cyan)] md:col-span-3 md:pt-3 md:text-right">
                    {(person.committee_title || person.role).toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-[var(--paper-dim)]">
            <Link href="/login?next=/members" className="text-[var(--paper)]">
              Sign in
            </Link>{" "}
            to see the member list, or{" "}
            <Link href="/join" className="text-[var(--paper)]">
              join
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
