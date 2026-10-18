import Link from "next/link";
import { Flash } from "@/components/chrome";
import { signIn } from "@/lib/actions";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") ? params.next : "/account";

  return (
    <div className="sheet mx-auto max-w-md px-5 py-20 md:py-28">
      <p className="mono text-[11px] tracking-[0.22em] text-[var(--cyan)]">ACCESS</p>
      <h1 className="serif mt-4 text-6xl">Sign in</h1>
      {!isSupabaseConfigured() ? (
        <p className="mt-6 text-sm leading-relaxed text-[var(--paper-dim)]">
          Add <span className="text-[var(--paper)]">NEXT_PUBLIC_SUPABASE_URL</span> and{" "}
          <span className="text-[var(--paper)]">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</span> to{" "}
          <span className="text-[var(--paper)]">.env.local</span>, then restart the server. The SQL migration is in{" "}
          <span className="text-[var(--paper)]">supabase/migrations</span>.
        </p>
      ) : (
        <form action={signIn} className="mt-10 grid gap-6">
          <Flash notice={params.notice} error={params.error} />
          <input type="hidden" name="next" value={next} />
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <input name="password" type="password" required autoComplete="current-password" />
          </label>
          <button className="btn w-fit" type="submit">
            Sign in
          </button>
          <p className="text-sm text-[var(--paper-dim)]">
            New here? <Link href="/join">Join the society</Link>
          </p>
        </form>
      )}
    </div>
  );
}
