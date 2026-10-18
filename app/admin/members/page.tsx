import { Flash } from "@/components/chrome";
import { updateMember } from "@/lib/actions";
import { adminMembers } from "@/lib/data";

export const metadata = { title: "Members admin" };

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { rows, error } = await adminMembers();

  return (
    <div>
      <h1 className="serif text-5xl">Members</h1>
      <p className="mt-3 max-w-lg text-sm text-[var(--paper-dim)]">
        Committee and admin are roles. “On the site” publishes someone in the public member section.
      </p>
      <Flash notice={params.notice} error={params.error || error} />
      <ul className="mt-8 space-y-8">
        {rows.map((person) => (
          <li key={person.id} className="border-t border-[var(--line)] pt-5">
            <p className="serif text-3xl">{person.full_name || "Unnamed"}</p>
            <p className="mt-1 text-sm text-[var(--paper-dim)]">
              {person.email}
              {person.course ? ` · ${person.course}` : ""}
            </p>
            <form action={updateMember} className="mt-4 grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={person.id} />
              <label className="field">
                <span>Role</span>
                <select name="role" defaultValue={person.role}>
                  <option value="member">Member</option>
                  <option value="committee">Committee</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className="field">
                <span>Title on the site</span>
                <input name="committee_title" defaultValue={person.committee_title} placeholder="President" />
              </label>
              <label className="flex items-center gap-3 text-sm sm:col-span-2">
                <input name="show_on_site" type="checkbox" defaultChecked={person.show_on_site} />
                On the site
              </label>
              <button className="btn w-fit" type="submit">
                Save
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
