"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured, publicKey, supabaseUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { londonLocalToIso } from "@/lib/time";
import type { ActivityKind, Role, Tier } from "@/lib/types";

function field(formData: FormData, name: string, max = 500) {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

function safeNext(value: string) {
  if (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) return value;
  return "/account";
}

function honeypot(formData: FormData) {
  return field(formData, "company_website", 200).length > 0;
}

function refresh() {
  revalidatePath("/", "layout");
}

async function origin() {
  const headerStore = await headers();
  return headerStore.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

function slugify(input: string) {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  return base || "event";
}

async function insertMinimal(table: string, row: Record<string, string>) {
  const response = await fetch(`${supabaseUrl()}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: publicKey(),
      Authorization: `Bearer ${publicKey()}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (response.ok) return "";
  if (response.status === 409) return "That address is already on the list.";
  return "Could not save that just now.";
}

export async function signIn(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/login?error=Connect+Supabase+before+signing+in");
  const email = field(formData, "email", 200).toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(field(formData, "next", 200) || "/account");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  redirect(next);
}

export async function signUp(formData: FormData) {
  if (!isSupabaseConfigured()) redirect("/join?error=Connect+Supabase+before+joining");
  const email = field(formData, "email", 200).toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = field(formData, "full_name", 120);
  const course = field(formData, "course", 120);
  if (!fullName) redirect("/join?error=Add+your+name");
  if (password.length < 8) redirect("/join?error=Use+at+least+8+characters");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, course },
      emailRedirectTo: `${await origin()}/auth/callback`,
    },
  });
  if (error) redirect(`/join?error=${encodeURIComponent(error.message)}`);
  if (!data.session) redirect("/login?notice=Check+your+email+to+confirm%2C+then+sign+in");
  redirect("/account");
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) redirect("/login?next=/account");
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: field(formData, "full_name", 120),
      course: field(formData, "course", 120),
      bio: field(formData, "bio", 600),
    })
    .eq("id", id);
  if (error) redirect(`/account?error=${encodeURIComponent(error.message)}`);
  refresh();
  redirect("/account?notice=Saved");
}

export async function subscribe(formData: FormData) {
  if (honeypot(formData)) redirect("/?notice=You+are+on+the+list#newsletter");
  if (!isSupabaseConfigured()) redirect("/?error=Newsletter+opens+once+Supabase+is+connected#newsletter");
  const email = field(formData, "email", 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/?error=Use+a+real+email+address#newsletter");
  }
  const message = await insertMinimal("newsletter_subscribers", { email });
  if (message) redirect(`/?error=${encodeURIComponent(message)}#newsletter`);
  refresh();
  redirect("/?notice=You+are+on+the+list#newsletter");
}

export async function sendInquiry(formData: FormData) {
  if (honeypot(formData)) redirect("/sponsors?notice=Received.+We+will+write+back");
  if (!isSupabaseConfigured()) redirect("/sponsors?error=Inquiries+open+once+Supabase+is+connected");
  const organisation = field(formData, "organisation", 160);
  const contactName = field(formData, "contact_name", 120);
  const email = field(formData, "email", 200).toLowerCase();
  const message = field(formData, "message", 2000);
  if (!organisation || !contactName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/sponsors?error=Add+an+organisation%2C+name%2C+and+email");
  }
  const error = await insertMinimal("sponsor_inquiries", {
    organisation,
    contact_name: contactName,
    email,
    message,
  });
  if (error && error !== "That address is already on the list.") {
    redirect(`/sponsors?error=${encodeURIComponent(error)}`);
  }
  refresh();
  redirect("/sponsors?notice=Received.+We+will+write+back");
}

export async function rsvp(formData: FormData) {
  const slug = field(formData, "slug", 80);
  const eventId = field(formData, "event_id", 40);
  const intent = field(formData, "intent", 10);
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect(`/login?next=/events/${slug}`);
  if (intent === "leave") {
    await supabase.from("rsvps").delete().eq("event_id", eventId).eq("user_id", userId);
  } else {
    await supabase.from("rsvps").insert({ event_id: eventId, user_id: userId });
  }
  refresh();
  redirect(`/events/${slug}`);
}

async function uniqueSlug(title: string, currentId?: string) {
  const supabase = await createClient();
  const base = slugify(title);
  for (let i = 0; i < 8; i += 1) {
    const slug = i === 0 ? base : `${base}-${i + 1}`;
    const { data } = await supabase.from("events").select("id").eq("slug", slug).maybeSingle();
    if (!data || data.id === currentId) return slug;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function eventPayload(formData: FormData) {
  const title = field(formData, "title", 140);
  const starts = londonLocalToIso(field(formData, "starts_at", 20));
  const endsRaw = field(formData, "ends_at", 20);
  const ends = endsRaw ? londonLocalToIso(endsRaw) : null;
  return {
    title,
    summary: field(formData, "summary", 280),
    details: field(formData, "details", 8000),
    location: field(formData, "location", 160),
    starts_at: starts,
    ends_at: ends,
    published: formData.get("published") === "on",
  };
}

export async function createEvent(formData: FormData) {
  const payload = eventPayload(formData);
  if (!payload.title || !payload.starts_at) redirect("/admin/events?error=Title+and+start+time+are+required");
  const supabase = await createClient();
  const slug = await uniqueSlug(payload.title);
  const { data, error } = await supabase
    .from("events")
    .insert({ ...payload, slug })
    .select("id")
    .single();
  if (error || !data) redirect(`/admin/events?error=${encodeURIComponent(error?.message ?? "Could not create event")}`);
  refresh();
  redirect(`/admin/events/${data.id}`);
}

export async function updateEvent(formData: FormData) {
  const id = field(formData, "id", 40);
  const payload = eventPayload(formData);
  if (!payload.title || !payload.starts_at) redirect(`/admin/events/${id}?error=Title+and+start+time+are+required`);
  const supabase = await createClient();
  const slug = await uniqueSlug(payload.title, id);
  const { error } = await supabase.from("events").update({ ...payload, slug }).eq("id", id);
  if (error) redirect(`/admin/events/${id}?error=${encodeURIComponent(error.message)}`);
  refresh();
  redirect(`/admin/events/${id}?notice=Saved`);
}

export async function deleteEvent(formData: FormData) {
  const id = field(formData, "id", 40);
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) redirect(`/admin/events?error=${encodeURIComponent(error.message)}`);
  refresh();
  redirect("/admin/events?notice=Removed");
}

const roles: Role[] = ["member", "committee", "admin"];

export async function updateMember(formData: FormData) {
  const id = field(formData, "id", 40);
  const role = field(formData, "role", 20) as Role;
  if (!roles.includes(role)) redirect("/admin/members?error=Unknown+role");
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      role,
      committee_title: field(formData, "committee_title", 80),
      show_on_site: formData.get("show_on_site") === "on",
    })
    .eq("id", id);
  if (error) redirect(`/admin/members?error=${encodeURIComponent(error.message)}`);
  refresh();
  redirect("/admin/members?notice=Saved");
}

const tiers: Tier[] = ["supporter", "partner", "principal"];

export async function createSponsor(formData: FormData) {
  const name = field(formData, "name", 120);
  const tier = field(formData, "tier", 20) as Tier;
  if (!name || !tiers.includes(tier)) redirect("/admin/sponsors?error=Name+and+tier+are+required");
  const supabase = await createClient();
  const { error } = await supabase.from("sponsors").insert({
    name,
    tier,
    url: field(formData, "url", 300),
    note: field(formData, "note", 280),
    sort_order: Number(field(formData, "sort_order", 6) || "0") || 0,
    published: formData.get("published") === "on",
  });
  if (error) redirect(`/admin/sponsors?error=${encodeURIComponent(error.message)}`);
  refresh();
  redirect("/admin/sponsors?notice=Added");
}

export async function updateSponsor(formData: FormData) {
  const id = field(formData, "id", 40);
  const tier = field(formData, "tier", 20) as Tier;
  const name = field(formData, "name", 120);
  if (!name || !tiers.includes(tier)) redirect("/admin/sponsors?error=Name+and+tier+are+required");
  const supabase = await createClient();
  const { error } = await supabase
    .from("sponsors")
    .update({
      name,
      tier,
      url: field(formData, "url", 300),
      note: field(formData, "note", 280),
      sort_order: Number(field(formData, "sort_order", 6) || "0") || 0,
      published: formData.get("published") === "on",
    })
    .eq("id", id);
  if (error) redirect(`/admin/sponsors?error=${encodeURIComponent(error.message)}`);
  refresh();
  redirect("/admin/sponsors?notice=Saved");
}

export async function deleteSponsor(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("sponsors").delete().eq("id", field(formData, "id", 40));
  refresh();
  redirect("/admin/sponsors?notice=Removed");
}

const kinds: ActivityKind[] = ["education", "project", "industry"];

export async function createActivity(formData: FormData) {
  const title = field(formData, "title", 140);
  const kind = field(formData, "kind", 20) as ActivityKind;
  if (!title || !kinds.includes(kind)) redirect("/admin/programme?error=Title+and+kind+are+required");
  const supabase = await createClient();
  const { error } = await supabase.from("activities").insert({
    title,
    kind,
    summary: field(formData, "summary", 280),
    sort_order: Number(field(formData, "sort_order", 6) || "0") || 0,
    published: formData.get("published") === "on",
  });
  if (error) redirect(`/admin/programme?error=${encodeURIComponent(error.message)}`);
  refresh();
  redirect("/admin/programme?notice=Added");
}

export async function updateActivity(formData: FormData) {
  const id = field(formData, "id", 40);
  const kind = field(formData, "kind", 20) as ActivityKind;
  const title = field(formData, "title", 140);
  if (!title || !kinds.includes(kind)) redirect("/admin/programme?error=Title+and+kind+are+required");
  const supabase = await createClient();
  const { error } = await supabase
    .from("activities")
    .update({
      title,
      kind,
      summary: field(formData, "summary", 280),
      sort_order: Number(field(formData, "sort_order", 6) || "0") || 0,
      published: formData.get("published") === "on",
    })
    .eq("id", id);
  if (error) redirect(`/admin/programme?error=${encodeURIComponent(error.message)}`);
  refresh();
  redirect("/admin/programme?notice=Saved");
}

export async function deleteActivity(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("activities").delete().eq("id", field(formData, "id", 40));
  refresh();
  redirect("/admin/programme?notice=Removed");
}

export async function updateCopy(formData: FormData) {
  const supabase = await createClient();
  const rows = [
    { key: "intro", value: field(formData, "intro", 400) },
    { key: "contact_email", value: field(formData, "contact_email", 200) },
    { key: "instagram", value: field(formData, "instagram", 300) },
    { key: "linkedin", value: field(formData, "linkedin", 300) },
  ];
  const { error } = await supabase.from("site_copy").upsert(rows);
  if (error) redirect(`/admin/society?error=${encodeURIComponent(error.message)}`);
  refresh();
  redirect("/admin/society?notice=Saved");
}

export async function deleteInquiry(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("sponsor_inquiries").delete().eq("id", field(formData, "id", 40));
  refresh();
  redirect("/admin/inquiries?notice=Removed");
}

export async function deleteSubscriber(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("newsletter_subscribers").delete().eq("id", field(formData, "id", 40));
  refresh();
  redirect("/admin/newsletter?notice=Removed");
}
