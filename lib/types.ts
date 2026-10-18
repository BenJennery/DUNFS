export type Role = "member" | "committee" | "admin";
export type Tier = "supporter" | "partner" | "principal";
export type ActivityKind = "education" | "project" | "industry";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  course: string;
  role: Role;
  committee_title: string;
  bio: string;
  show_on_site: boolean;
  created_at: string;
};

export type SocietyEvent = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  details: string;
  location: string;
  starts_at: string;
  ends_at: string | null;
  published: boolean;
  rsvp_count: number;
};

export type Sponsor = {
  id: string;
  name: string;
  tier: Tier;
  url: string;
  note: string;
  published: boolean;
  sort_order: number;
};

export type Activity = {
  id: string;
  title: string;
  summary: string;
  kind: ActivityKind;
  published: boolean;
  sort_order: number;
};

export type Subscriber = {
  id: string;
  email: string;
  created_at: string;
};

export type Inquiry = {
  id: string;
  organisation: string;
  contact_name: string;
  email: string;
  message: string;
  created_at: string;
};

export type SiteCopy = {
  intro: string;
  contact_email: string;
  instagram: string;
  linkedin: string;
};

export type Session = {
  configured: boolean;
  user: { id: string; email: string } | null;
  profile: Profile | null;
  copy: SiteCopy;
};
