// lib/slug.ts
//
// SEO-friendly name-based URLs (/clinicprofile/<slug>/<id>, /dentist/<slug>/<id>).
// The slug is for SEO, the ID is used directly for API calls.

import type { Clinic } from "@/lib/types";

/** Convert any name into a URL-safe slug: "Bright Smiles Dental!" -> "bright-smiles-dental" */
export function slugify(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Get the slug part from a clinic name */
export function clinicSlug(
  clinic: { id: string; name?: string | null; practice_name?: string | null }
): string {
  return slugify(clinic.practice_name || clinic.name) || clinic.id;
}

/** Get the slug part from a dentist name */
export function dentistSlug(member: { id: string; first_name: string; last_name?: string | null }): string {
  return (
    slugify(`${member.first_name ?? ""} ${member.last_name ?? ""}`.trim()) || member.id
  );
}

/** Generate full clinic URL: /clinicprofile/<slug>/<id> */
export function clinicUrl(
  clinic: { id: string; name?: string | null; practice_name?: string | null }
): string {
  return `/clinicprofile/${clinicSlug(clinic)}/${clinic.id}`;
}

/** Generate full dentist URL: /dentist/<slug>/<id> */
export function dentistUrl(
  member: { id: string; first_name: string; last_name?: string | null }
): string {
  return `/dentist/${dentistSlug(member)}/${member.id}`;
}
