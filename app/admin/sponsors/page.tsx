import { ConfirmSubmit } from "@/components/confirm";
import { Flash } from "@/components/chrome";
import { createSponsor, deleteSponsor, updateSponsor } from "@/lib/actions";
import { tierLabel } from "@/lib/copy";
import { adminSponsors } from "@/lib/data";

export const metadata = { title: "Sponsors admin" };

const tierOptions = ["principal", "partner", "supporter"] as const;

export default async function AdminSponsorsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { rows, error } = await adminSponsors();

  return (
    <div>
      <h1 className="serif text-5xl">Sponsors</h1>
      <Flash notice={params.notice} error={params.error || error} />
      <form action={createSponsor} className="mt-8 grid gap-4 border-b border-[var(--line)] pb-10 sm:grid-cols-2">
        <label className="field sm:col-span-2">
          <span>Name</span>
          <input name="name" required />
        </label>
        <label className="field">
          <span>Tier</span>
          <select name="tier" defaultValue="supporter">
            {tierOptions.map((tier) => (
              <option key={tier} value={tier}>
                {tierLabel[tier]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Order</span>
          <input name="sort_order" type="number" defaultValue={0} />
        </label>
        <label className="field sm:col-span-2">
          <span>Link</span>
          <input name="url" placeholder="https://" />
        </label>
        <label className="field sm:col-span-2">
          <span>Note</span>
          <input name="note" />
        </label>
        <label className="flex items-center gap-3 text-sm sm:col-span-2">
          <input name="published" type="checkbox" defaultChecked />
          Published
        </label>
        <button className="btn w-fit" type="submit">
          Add sponsor
        </button>
      </form>
      <ul className="mt-8 space-y-8">
        {rows.map((sponsor) => (
          <li key={sponsor.id} className="border-t border-[var(--line)] pt-5">
            <form action={updateSponsor} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={sponsor.id} />
              <label className="field sm:col-span-2">
                <span>Name</span>
                <input name="name" defaultValue={sponsor.name} required />
              </label>
              <label className="field">
                <span>Tier</span>
                <select name="tier" defaultValue={sponsor.tier}>
                  {tierOptions.map((tier) => (
                    <option key={tier} value={tier}>
                      {tierLabel[tier]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Order</span>
                <input name="sort_order" type="number" defaultValue={sponsor.sort_order} />
              </label>
              <label className="field sm:col-span-2">
                <span>Link</span>
                <input name="url" defaultValue={sponsor.url} />
              </label>
              <label className="field sm:col-span-2">
                <span>Note</span>
                <input name="note" defaultValue={sponsor.note} />
              </label>
              <label className="flex items-center gap-3 text-sm sm:col-span-2">
                <input name="published" type="checkbox" defaultChecked={sponsor.published} />
                Published
              </label>
              <button className="btn w-fit" type="submit">
                Save
              </button>
            </form>
            <form action={deleteSponsor} className="mt-3">
              <input type="hidden" name="id" value={sponsor.id} />
              <ConfirmSubmit label="Remove" message="Remove this sponsor?" />
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
