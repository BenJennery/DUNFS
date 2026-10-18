import { ConfirmSubmit } from "@/components/confirm";
import { Flash } from "@/components/chrome";
import { deleteSubscriber } from "@/lib/actions";
import { adminSubscribers } from "@/lib/data";
import { formatDay } from "@/lib/time";

export const metadata = { title: "Newsletter admin" };

export default async function AdminNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { rows, error } = await adminSubscribers();

  return (
    <div>
      <h1 className="serif text-5xl">Newsletter</h1>
      <p className="mt-3 text-sm text-[var(--paper-dim)]">{rows.length} addresses. Sending mail stays with you.</p>
      <Flash notice={params.notice} error={params.error || error} />
      <ul className="mt-8">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-4 border-b border-[var(--line)] py-3">
            <span>
              {row.email}
              <span className="ml-3 text-sm text-[var(--paper-dim)]">{formatDay(row.created_at)}</span>
            </span>
            <form action={deleteSubscriber}>
              <input type="hidden" name="id" value={row.id} />
              <ConfirmSubmit label="Remove" message="Remove this address?" />
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
