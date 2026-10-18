import { ConfirmSubmit } from "@/components/confirm";
import { Flash } from "@/components/chrome";
import { deleteInquiry } from "@/lib/actions";
import { adminInquiries } from "@/lib/data";
import { formatDay } from "@/lib/time";

export const metadata = { title: "Inquiries" };

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { rows, error } = await adminInquiries();

  return (
    <div>
      <h1 className="serif text-5xl">Inquiries</h1>
      <Flash notice={params.notice} error={params.error || error} />
      <ul className="mt-8 space-y-8">
        {rows.map((row) => (
          <li key={row.id} className="border-t border-[var(--line)] pt-5">
            <p className="serif text-3xl">{row.organisation}</p>
            <p className="mt-2 text-sm text-[var(--paper-dim)]">
              {row.contact_name} · <a href={`mailto:${row.email}`}>{row.email}</a> · {formatDay(row.created_at)}
            </p>
            {row.message ? <p className="mt-4 max-w-xl whitespace-pre-wrap text-sm leading-relaxed">{row.message}</p> : null}
            <form action={deleteInquiry} className="mt-4">
              <input type="hidden" name="id" value={row.id} />
              <ConfirmSubmit label="Remove" message="Remove this inquiry?" />
            </form>
          </li>
        ))}
      </ul>
      {!rows.length && !error ? <p className="mt-8 text-[var(--paper-dim)]">No inquiries yet.</p> : null}
    </div>
  );
}
