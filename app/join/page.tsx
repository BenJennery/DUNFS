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
      <p className="mt-4 text-[var(--paper-dim)]">A free account puts you on the member list and lets you RSVP.</p>
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
