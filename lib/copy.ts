import type { ActivityKind, Membership, SiteCopy, Tier } from "@/lib/types";

export const defaultCopy: SiteCopy = {
  intro:
    "A student society at Durham for fusion science, engineering, and the people who want to work on it.",
  contact_email: "",
  instagram: "",
  linkedin: "",
};

export const tierOrder: Tier[] = ["principal", "partner", "supporter"];

export const tierLabel: Record<Tier, string> = {
  principal: "Principal",
  partner: "Partner",
  supporter: "Supporter",
};

export const tierNote: Record<Tier, string> = {
  supporter: "Your name on the drawing, at lectures, and on this site.",
  partner: "A short introduction at one gathering each term.",
  principal: "A year beside the society: speakers, travel, or a student build.",
};

export const membershipOrder: Membership[] = ["durham", "affiliate"];

export const membershipLabel: Record<Membership, string> = {
  durham: "Durham University",
  affiliate: "Affiliate",
};

export function isDurhamEmail(email: string) {
  return /@([a-z0-9-]+\.)*durham\.ac\.uk$/i.test(email.trim());
}

export const kindLabel: Record<ActivityKind, string> = {
  education: "Lectures",
  project: "Projects",
  industry: "Industry",
};

export function socialHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "";
}
