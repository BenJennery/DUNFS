import { Flash } from "@/components/chrome";
import { membershipLabel } from "@/lib/copy";
import { signOut, updateProfile } from "@/lib/actions";
import { getSession } from "@/lib/data";
import { redirect } from "next/navigation";

export const metadata = { title: "Account" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();
  if (!session.user || !session.profile) redirect("/login?next=/account");
  const profile = session.profile;

  return (
    <div className="sheet mx-auto max-w-xl px-5 py-20 md:py-28">
      <p className="mono text-[11px] tracking-[0.22em] text-[var(--cyan)]">ACCOUNT</p>
      <h1 className="serif mt-4 text-6xl">{profile.full_name || "Your account"}</h1>
      <p className="mt-3 text-sm text-[var(--paper-dim)]">
        {profile.email} · {profile.role} · {membershipLabel[profile.membership] ?? "Affiliate"}
      </p>
      <form action={updateProfile} className="mt-10 grid gap-6">
        <Flash notice={params.notice} error={params.error} />
        <label className="field">
          <span>Name</span>
          <input name="full_name" defaultValue={profile.full_name} required />
        </label>
        <label className="field">
          <span>Course</span>
          <input name="course" defaultValue={profile.course} />
        </label>
        <label className="field">
          <span>Bio</span>
          <textarea name="bio" defaultValue={profile.bio} maxLength={600} />
        </label>
        <div className="flex items-center gap-6">
          <button className="btn" type="submit">
            Save
          </button>
        </div>
      </form>
      <form action={signOut} className="mt-8">
        <button type="submit" className="text-sm text-[var(--cyan)]">
          Sign out
        </button>
      </form>
    </div>
  );
}
