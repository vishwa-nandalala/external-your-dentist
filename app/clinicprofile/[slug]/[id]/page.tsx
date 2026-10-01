// app/clinic/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { practiceApi } from "@/lib/api/client";
import { clinicSlug } from "@/lib/slug";
import ClinicProfileClient from "./ClinicProfileClient";

type Props = {
  params: Promise<{ slug: string; id: string }>;
};

async function loadClinic(id: string) {
  try {
    const clinic = await practiceApi.getClinicById(id);
    console.log("clinic in the clinic -> page.tsx ======================>", clinic);
    
    if (clinic) return clinic;
  } catch { }

  try {
    const unclaimed = await practiceApi.getUnclaimedPracticeById(id);
    if (unclaimed) return unclaimed;
  } catch { }

  return null;
}

/**
 * Normalize seo_keywords which may come as:
 *  - string  → "dentist, dental clinic, teeth whitening"
 *  - string[] → ["dentist", "dental clinic"]
 *  - null/undefined
 */
function normalizeKeywords(
  input?: string | string[] | null
): string[] | undefined {
  if (!input) return undefined;

  // 1. Convert to array of raw strings
  const raw: string[] = Array.isArray(input)
    ? input
    : input.split(",");

  // 2. Trim + filter empty
  const cleaned = raw
    .map((k) => (typeof k === "string" ? k.trim() : ""))
    .filter(Boolean);

  // 3. Deduplicate (case-insensitive), preserve order
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const keyword of cleaned) {
    const key = keyword.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(keyword);
    }
  }

  return unique.length ? unique : undefined;
}
/**
 * Build a location string that works for both ClinicProfile (city)
 * and UnclaimedPractice (suburb).
 */
function buildLocation(clinic: any): string {
  const city = clinic.city || clinic.suburb;
  return [city, clinic.state, clinic.postcode].filter(Boolean).join(", ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const clinic = await loadClinic(id);

    if (!clinic) {
      return {
        title: "Clinic Not Found",
        robots: { index: false, follow: false },
      };
    }

    const name = clinic.practice_name || "Clinic";
    const location = buildLocation(clinic);

    // ---------- TITLE ----------
    const title = location ? `${name} - ${location}` : name;

    // ---------- DESCRIPTION ----------
    // seo_description is for META description (search engines)
    // description is the actual clinic description (used in UI)
    // For meta tags, prefer seo_description, then fall back to description
    const metaDescription =
      clinic.seo_description?.trim() ||
      `${name}${location ? ` in ${location}` : ""}. View clinic details, services, opening hours, and book your dental appointment online.`;

    // ---------- KEYWORDS ----------
    const keywords =
      normalizeKeywords(clinic.seo_keywords) ??
      ([
        name,
        "dental clinic",
        "dentist",
        "book dental appointment",
        clinic.city ? `dentist in ${clinic.city}` : null,
        clinic.state ? `dental clinic in ${clinic.state}` : null,
        clinic.postcode ? `dentist ${clinic.postcode}` : null,
      ].filter(Boolean) as string[]);

    // ---------- IMAGE ----------
    const image = clinic.banner_image?.url || clinic.logo?.url || undefined;

    const canonicalPath = `/clinicprofile/${clinicSlug(clinic)}/${clinic.id}`;

    return {
      title,
      description: metaDescription,   // 👈 meta description (for <head>)
      keywords,
      alternates: { canonical: canonicalPath },
      robots: { index: true, follow: true },
      openGraph: {
        type: "website",
        title,
        description: metaDescription,
        url: canonicalPath,
        siteName: "Your Dentist",
        images: image ? [{ url: image, alt: name }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: metaDescription,
        images: image ? [image] : [],
      },
    };
  } catch {
    return { title: "Clinic Not Found" };
  }
}

export default async function ClinicProfilePage({ params }: Props) {
  const { id } = await params;

  const clinic = await loadClinic(id);
  if (!clinic) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: clinic.practice_name || "Clinic",
    description: clinic.seo_description || clinic.description || undefined,
    url: `/clinicprofile/${clinicSlug(clinic)}/${clinic.id}`,
    image: clinic.banner_image?.url || clinic.logo?.url || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: clinic.address || undefined,
      addressRegion: clinic.state || undefined,
      postalCode: clinic.postcode || undefined,
    },
    telephone: clinic.practice_phone || clinic.practice_phone || undefined,
    email: clinic.email || undefined,
    ...(clinic.practice_opening_hours?.length
      ? {
        openingHoursSpecification: clinic.practice_opening_hours.map((h) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: h.day_of_week,
          opens: h.time_slots?.[0]?.start || undefined,
          closes: h.time_slots?.[0]?.end || undefined,
        })),
      }
      : {}),
    ...(clinic.practice_services?.length
      ? {
        medicalSpecialty: clinic.practice_services.map((s) => s.name),
      }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ClinicProfileClient clinic={clinic} />
    </>
  );
}