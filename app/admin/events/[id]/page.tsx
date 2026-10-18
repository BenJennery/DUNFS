import { notFound } from "next/navigation";
import { ConfirmSubmit } from "@/components/confirm";
import { Flash } from "@/components/chrome";
import { deleteEvent, updateEvent } from "@/lib/actions";
import { adminEvent } from "@/lib/data";
import { toDatetimeLocal } from "@/lib/time";

export const metadata = { title: "Edit event" };

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { event, error } = await adminEvent(id);
  if (!event) notFound();

  return (
    <div>
      <h1 className="serif text-5xl">Edit event</h1>
      <Flash notice={query.notice} error={query.error || error} />
      <form action={updateEvent} className="mt-8 grid gap-5">
        <input type="hidden" name="id" value={event.id} />
        <label className="field">
          <span>Title</span>
          <input name="title" defaultValue={event.title} required />
        </label>
        <label className="field">
          <span>Summary</span>
          <input name="summary" defaultValue={event.summary} />
        </label>
        <label className="field">
          <span>Details</span>
          <textarea name="details" defaultValue={event.details} />
        </label>
        <label className="field">
          <span>Location</span>
          <input name="location" defaultValue={event.location} />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="field">
            <span>Starts, UK time</span>
            <input name="starts_at" type="datetime-local" required defaultValue={toDatetimeLocal(event.starts_at)} />
          </label>
          <label className="field">
            <span>Ends, UK time</span>
            <input name="ends_at" type="datetime-local" defaultValue={event.ends_at ? toDatetimeLocal(event.ends_at) : ""} />
          </label>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input name="published" type="checkbox" defaultChecked={event.published} />
          Published
        </label>
        <button className="btn w-fit" type="submit">
          Save
        </button>
      </form>
      <form action={deleteEvent} className="mt-8">
        <input type="hidden" name="id" value={event.id} />
        <ConfirmSubmit label="Delete event" message="Delete this event?" />
      </form>
    </div>
  );
}
