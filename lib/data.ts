import { defaultCopy } from "@/lib/copy";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type {
  Activity,
  Inquiry,
  Profile,
  Session,
  SiteCopy,
  SocietyEvent,
  Sponsor,
  Subscriber,
} from "@/lib/types";

const profileColumns =
  "id, email, full_name, course, role, committee_title, bio, show_on_site, created_at";
const eventColumns =
  "id, title, slug, summary, details, location, starts_at, ends_at, published, rsvp_count";

function asCopy(rows: { key: string; value: string }[] | null): SiteCopy {
  const copy = { ...defaultCopy };
  for (const row of rows ?? []) {
    if (row.key in copy) copy[row.key as keyof SiteCopy] = row.value;
  }
  return copy;
}

export async function getSession(): Promise<Session> {
  if (!isSupabaseConfigured()) {
    return { configured: false, user: null, profile: null, copy: defaultCopy };
  }

  try {
    const supabase = await createClient();
    const [{ data: claimsData }, { data: copyRows }] = await Promise.all([
      supabase.auth.getClaims(),
      supabase.from("site_copy").select("key, value"),
    ]);
    const copy = asCopy(copyRows);
    const id = claimsData?.claims?.sub;
    const email = typeof claimsData?.claims?.email === "string" ? claimsData.claims.email : "";
    if (!id) return { configured: true, user: null, profile: null, copy };

    let { data: profile } = await supabase
      .from("profiles")
      .select(profileColumns)
      .eq("id", id)
      .maybeSingle();

    if (!profile) {
      await supabase.from("profiles").insert({
        id,
        email,
        full_name: "",
        role: "member",
      });
      const again = await supabase.from("profiles").select(profileColumns).eq("id", id).maybeSingle();
      profile = again.data;
    }

    return {
      configured: true,
      user: { id, email: profile?.email || email },
      profile: (profile as Profile | null) ?? null,
      copy,
    };
  } catch {
    return { configured: true, user: null, profile: null, copy: defaultCopy };
  }
}

async function clientOrNull() {
  if (!isSupabaseConfigured()) return null;
  try {
    return await createClient();
  } catch {
    return null;
  }
}

export async function getHome() {
  const session = await getSession();
  const supabase = await clientOrNull();
  if (!supabase) {
    return { ...session, events: [] as SocietyEvent[], committee: [] as Profile[], sponsors: [] as Sponsor[], activities: [] as Activity[] };
  }

  const now = new Date().toISOString();
  const [events, committee, sponsors, activities] = await Promise.all([
    supabase
      .from("events")
      .select(eventColumns)
      .eq("published", true)
      .gte("starts_at", now)
      .order("starts_at", { ascending: true })
      .limit(4),
    supabase
      .from("profiles")
      .select("id, full_name, course, role, committee_title, bio, show_on_site, created_at")
      .eq("show_on_site", true)
      .order("full_name", { ascending: true }),
    supabase
      .from("sponsors")
      .select("id, name, tier, url, note, published, sort_order")
      .eq("published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("activities")
      .select("id, title, summary, kind, published, sort_order")
      .eq("published", true)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    ...session,
    events: (events.data ?? []) as SocietyEvent[],
    committee: (committee.data ?? []) as Profile[],
    sponsors: (sponsors.data ?? []) as Sponsor[],
    activities: (activities.data ?? []) as Activity[],
  };
}

export async function getEvents() {
  const supabase = await clientOrNull();
  if (!supabase) return [] as SocietyEvent[];
  const { data } = await supabase
    .from("events")
    .select(eventColumns)
    .eq("published", true)
    .order("starts_at", { ascending: false });
  return (data ?? []) as SocietyEvent[];
}

export async function getEvent(slug: string) {
  const session = await getSession();
  const supabase = await clientOrNull();
  if (!supabase) return { session, event: null as SocietyEvent | null, going: false };
  const { data } = await supabase.from("events").select(eventColumns).eq("slug", slug).maybeSingle();
  const event = (data as SocietyEvent | null) ?? null;
  if (!event || (!event.published && session.profile?.role !== "admin")) {
    return { session, event: null, going: false };
  }
  let going = false;
  if (session.user) {
    const { data: rsvp } = await supabase
      .from("rsvps")
      .select("event_id")
      .eq("event_id", event.id)
      .eq("user_id", session.user.id)
      .maybeSingle();
    going = Boolean(rsvp);
  }
  return { session, event, going };
}

export async function getMembers() {
  const session = await getSession();
  const supabase = await clientOrNull();
  if (!supabase) return { session, committee: [] as Profile[], directory: [] as Profile[] };
  const committee = await supabase
    .from("profiles")
    .select("id, full_name, course, role, committee_title, bio, show_on_site, created_at")
    .eq("show_on_site", true)
    .order("full_name", { ascending: true });
  let directory: Profile[] = [];
  if (session.user) {
    const all = await supabase
      .from("profiles")
      .select("id, full_name, course, role, committee_title, bio, show_on_site, created_at")
      .order("full_name", { ascending: true });
    directory = (all.data ?? []) as Profile[];
  }
  return { session, committee: (committee.data ?? []) as Profile[], directory };
}

export async function getSponsors() {
  const supabase = await clientOrNull();
  if (!supabase) return [] as Sponsor[];
  const { data } = await supabase
    .from("sponsors")
    .select("id, name, tier, url, note, published, sort_order")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as Sponsor[];
}

export async function adminEvents() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").select(eventColumns).order("starts_at", { ascending: false });
  return { rows: (data ?? []) as SocietyEvent[], error: error?.message ?? "" };
}

export async function adminEvent(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").select(eventColumns).eq("id", id).maybeSingle();
  return { event: (data as SocietyEvent | null) ?? null, error: error?.message ?? "" };
}

export async function adminMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select(profileColumns).order("created_at", { ascending: false });
  return { rows: (data ?? []) as Profile[], error: error?.message ?? "" };
}

export async function adminSponsors() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("sponsors").select("*").order("sort_order", { ascending: true });
  return { rows: (data ?? []) as Sponsor[], error: error?.message ?? "" };
}

export async function adminActivities() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("activities").select("*").order("sort_order", { ascending: true });
  return { rows: (data ?? []) as Activity[], error: error?.message ?? "" };
}

export async function adminSubscribers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });
  return { rows: (data ?? []) as Subscriber[], error: error?.message ?? "" };
}

export async function adminInquiries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sponsor_inquiries")
    .select("id, organisation, contact_name, email, message, created_at")
    .order("created_at", { ascending: false });
  return { rows: (data ?? []) as Inquiry[], error: error?.message ?? "" };
}
