import Link from "next/link";
import { Flash } from "@/components/chrome";
import { signUp } from "@/lib/actions";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = { title: "Join" };

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="sheet mx-auto max-w-md px-5 py-20 md:py-28">
      <p className="mono text-[11px] tracking-[0.22em] text-[var(--cyan)]">MEMBERSHIP</p>
      <h1 className="serif mt-4 text-6xl">Join</h1>
      <p className="mt-4 text-[var(--paper-dim)]">
        Durham University students and staff join with a durham.ac.uk email. Affiliate membership is for alumni, other universities, and anyone else. Either account can RSVP.
      </p>
      {!isSupabaseConfigured() ? (
        <p className="mt-6 text-sm text-[var(--paper-dim)]">Connect Supabase before opening membership. See the README.</p>
      ) : (
        <form action={signUp} className="mt-10 grid gap-6">
          <Flash error={params.error} />
          <label className="field">
            <span>Name</span>
            <input name="full_name" required autoComplete="name" />
          </label>
          <label className="field">
            <span>Course</span>
            <input name="course" placeholder="Physics, year 2" />
          </label>
          <fieldset className="grid gap-3">
            <legend className="quiet-label">Membership</legend>
            <label className="flex items-start gap-3 text-sm">
              <input className="mt-1" type="radio" name="membership" value="durham" defaultChecked />
              <span>
                <span className="block text-[var(--paper)]">Durham University</span>
                <span className="text-[var(--paper-dim)]">A durham.ac.uk address.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input className="mt-1" type="radio" name="membership" value="affiliate" />
              <span>
                <span className="block text-[var(--paper)]">Affiliate</span>
                <span className="text-[var(--paper-dim)]">Alumni, other universities, and everyone else.</span>
              </span>
            </label>
          </fieldset>
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <input name="password" type="password" required minLength={8} autoComplete="new-password" />
          </label>
          <button className="btn w-fit" type="submit">
            Create account
          </button>
          <p className="text-sm text-[var(--paper-dim)]">
            Already a member? <Link href="/login">Sign in</Link>
          </p>
        </form>
      )}
    </div>
  );
}
