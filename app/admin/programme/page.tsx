import { ConfirmSubmit } from "@/components/confirm";
import { Flash } from "@/components/chrome";
import { createActivity, deleteActivity, updateActivity } from "@/lib/actions";
import { kindLabel } from "@/lib/copy";
import { adminActivities } from "@/lib/data";
import type { ActivityKind } from "@/lib/types";

export const metadata = { title: "Programme admin" };

const kinds: ActivityKind[] = ["education", "project", "industry"];

export default async function AdminProgrammePage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { rows, error } = await adminActivities();

  return (
    <div>
      <h1 className="serif text-5xl">Programme</h1>
      <p className="mt-3 max-w-lg text-sm text-[var(--paper-dim)]">
        Lectures, projects, and industry visits. They appear on the front page when published.
      </p>
      <Flash notice={params.notice} error={params.error || error} />
      <form action={createActivity} className="mt-8 grid gap-4 border-b border-[var(--line)] pb-10">
        <label className="field">
          <span>Title</span>
          <input name="title" required />
        </label>
        <label className="field">
          <span>Kind</span>
          <select name="kind" defaultValue="education">
            {kinds.map((kind) => (
              <option key={kind} value={kind}>
                {kindLabel[kind]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Summary</span>
          <input name="summary" />
        </label>
        <label className="field">
          <span>Order</span>
          <input name="sort_order" type="number" defaultValue={0} />
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input name="published" type="checkbox" defaultChecked />
          Published
        </label>
        <button className="btn w-fit" type="submit">
          Add
        </button>
      </form>
      <ul className="mt-8 space-y-8">
        {rows.map((activity) => (
          <li key={activity.id} className="border-t border-[var(--line)] pt-5">
            <form action={updateActivity} className="grid gap-4">
              <input type="hidden" name="id" value={activity.id} />
              <label className="field">
                <span>Title</span>
                <input name="title" defaultValue={activity.title} required />
              </label>
              <label className="field">
                <span>Kind</span>
                <select name="kind" defaultValue={activity.kind}>
                  {kinds.map((kind) => (
                    <option key={kind} value={kind}>
                      {kindLabel[kind]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Summary</span>
                <input name="summary" defaultValue={activity.summary} />
              </label>
              <label className="field">
                <span>Order</span>
                <input name="sort_order" type="number" defaultValue={activity.sort_order} />
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input name="published" type="checkbox" defaultChecked={activity.published} />
                Published
              </label>
              <button className="btn w-fit" type="submit">
                Save
              </button>
            </form>
            <form action={deleteActivity} className="mt-3">
              <input type="hidden" name="id" value={activity.id} />
              <ConfirmSubmit label="Remove" message="Remove this item?" />
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
