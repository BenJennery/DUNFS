import { Flash } from "@/components/chrome";
import { updateCopy } from "@/lib/actions";
import { getSession } from "@/lib/data";

export const metadata = { title: "Society" };

export default async function AdminSocietyPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const session = await getSession();

  return (
    <div>
      <h1 className="serif text-5xl">Society</h1>
      <p className="mt-3 max-w-lg text-sm text-[var(--paper-dim)]">
        The line under the title, and the addresses in the footer. Social links need a full https URL.
      </p>
      <form action={updateCopy} className="mt-8 grid gap-5">
        <Flash notice={params.notice} error={params.error} />
        <label className="field">
          <span>Intro</span>
          <textarea name="intro" defaultValue={session.copy.intro} />
        </label>
        <label className="field">
          <span>Contact email</span>
          <input name="contact_email" type="email" defaultValue={session.copy.contact_email} />
        </label>
        <label className="field">
          <span>Instagram URL</span>
          <input name="instagram" defaultValue={session.copy.instagram} placeholder="https://instagram.com/..." />
        </label>
        <label className="field">
          <span>LinkedIn URL</span>
          <input name="linkedin" defaultValue={session.copy.linkedin} placeholder="https://www.linkedin.com/..." />
        </label>
        <button className="btn w-fit" type="submit">
          Save
        </button>
      </form>
    </div>
  );
}
