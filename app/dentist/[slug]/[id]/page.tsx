// app/dentist/[slug]/[id]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { practiceApi } from "@/lib/api/client";
import { dentistSlug } from "@/lib/slug";
import DentistProfileClient from "./DentistProfileClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://yourdentist.com.au";

const SITE_NAME = "Your Dentist";

type Props = {
  params: Promise<{ slug: string; id: string }>;
};

// ============================================================
// LOADERS
// ============================================================
async function loadPractitioner(id: string) {
  try {
    const practitioner = await practiceApi.getPractitionerById(id);
    if (practitioner) return practitioner;
  } catch { }
  return null;
}

// ✅ Fetch clinic separately (only clinic has seo_description / seo_keywords)
async function loadClinicById(clinicId?: string | null) {
  if (!clinicId) return null;
  try {
    const clinic = await practiceApi.getClinicById(clinicId);
    if (clinic) return clinic;
  } catch { }

  try {
    const unclaimed = await practiceApi.getUnclaimedPracticeById(clinicId);
    if (unclaimed) return unclaimed;
  } catch { }

  return null;
}

// ============================================================
// HELPERS
// ============================================================
function normalizeKeywords(
  input?: string | string[] | null
): string[] | undefined {
  if (!input) return undefined;
  const raw: string[] = Array.isArray(input) ? input : input.split(",");
  const cleaned = raw
    .map((k) => (typeof k === "string" ? k.trim() : ""))
    .filter(Boolean);
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

function buildFullName(practitioner: any): string {
  return `${practitioner.first_name || ""} ${practitioner.last_name || ""}`.trim();
}

function buildLocation(practitioner: any): string {
  const info = practitioner.practice_info;
  return [info?.city || info?.suburb, info?.state, info?.postcode]
    .filter(Boolean)
    .join(", ");
}

function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// ============================================================
// ✅ METADATA — pulls SEO from CLINIC, falls back to practitioner fields
// ============================================================
export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;

  const practitioner = await loadPractitioner(id);

  if (!practitioner) {
    return {
      title: "Dentist Not Found",
      description: "The dentist you're looking for could not be found.",
      robots: { index: false, follow: false },
    };
  }

  // ✅ Fetch clinic to get SEO fields
  const clinic = await loadClinicById(practitioner.practice_info?.id);

  const name = buildFullName(practitioner) || "Dental Practitioner";
  const practiceName = practitioner.practice_info?.practice_name?.trim() || "";
  const qualification = practitioner.qualification || "Dental Practitioner";
  const location = buildLocation(practitioner);

  const title = practiceName
    ? `${name} - ${practiceName}${location ? `, ${location}` : ""}`
    : `${name}${location ? ` - ${location}` : ""}`;

  const canonicalPath = `/dentistprofile/${dentistSlug({
    id: practitioner.id,
    first_name: practitioner.first_name,
    last_name: practitioner.last_name,
  })}/${practitioner.id}`;

  const canonicalUrl = absoluteUrl(canonicalPath);

  // ✅ SEO description priority:
  // 1. clinic.seo_description
  // 2. practitioner.professional_statement (shortened)
  // 3. auto-built
  const description =
    clinic?.seo_description?.trim() ||
    practitioner.professional_statement?.trim()?.slice(0, 155) ||
    `Meet ${name}, ${qualification}${practiceName ? ` at ${practiceName}` : ""}${location ? ` in ${location}` : ""}. View profile, specialisations, and book your dental appointment online.`;

  // ✅ SEO keywords priority:
  // 1. clinic.seo_keywords
  // 2. auto-built from practitioner + clinic data
  const keywords =
    normalizeKeywords(clinic?.seo_keywords) ??
    ([
      name,
      qualification,
      "dentist",
      "dental practitioner",
      "dental care",
      "book dentist",
      "book dental appointment",
      practiceName || null,
      practitioner.practice_info?.city
        ? `dentist in ${practitioner.practice_info.city}`
        : null,
      practitioner.practice_info?.state
        ? `dentist in ${practitioner.practice_info.state}`
        : null,
      practitioner.practice_info?.postcode
        ? `dentist ${practitioner.practice_info.postcode}`
        : null,
    ].filter(Boolean) as string[]);

  const imageUrl =
    practitioner.image?.url ||
    clinic?.banner_image?.url ||
    clinic?.logo?.url ||
    undefined;

  const imageAlt = practiceName ? `${name} - ${practiceName}` : name;

  return {
    title,
    description,
    keywords,

    applicationName: SITE_NAME,
    creator: SITE_NAME,
    publisher: SITE_NAME,

    alternates: { canonical: canonicalUrl },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },

    openGraph: {
      type: "profile",
      locale: "en_AU",
      url: canonicalUrl,
      siteName: SITE_NAME,
      title,
      description,
      images: imageUrl
        ? [{ url: absoluteUrl(imageUrl), width: 1200, height: 630, alt: imageAlt }]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [{ url: absoluteUrl(imageUrl), alt: imageAlt }] : [],
    },

    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },

    other: {
      "og:phone_number": practitioner.practice_info?.practice_phone || "",
      "og:street-address": practitioner.practice_info?.address || "",
      "og:locality":
        practitioner.practice_info?.city ||
        practitioner.practice_info?.suburb ||
        "",
      "og:region": practitioner.practice_info?.state || "",
      "og:postal-code": practitioner.practice_info?.postcode || "",
      "og:country-name": "Australia",
    },
  };
}

// ============================================================
// ✅ PAGE + JSON-LD
// ============================================================
export default async function DentistProfilePage({ params }: Props) {
  const { id } = await params;

  const practitioner = await loadPractitioner(id);
  if (!practitioner) notFound();

  // ✅ Fetch clinic for SEO description fallback in schema too
  const clinic = await loadClinicById(practitioner.practice_info?.id);

  const name = buildFullName(practitioner) || "Dental Practitioner";
  const practiceName = practitioner.practice_info?.practice_name || "";
  const qualification = practitioner.qualification || "Dental Practitioner";
  const location = buildLocation(practitioner);

  const canonicalPath = `/dentistprofile/${dentistSlug({
    id: practitioner.id,
    first_name: practitioner.first_name,
    last_name: practitioner.last_name,
  })}/${practitioner.id}`;
  const canonicalUrl = absoluteUrl(canonicalPath);
  const imageUrl = practitioner.image?.url || undefined;

  const heading = practiceName
    ? `${name} - ${practiceName}${location ? `, ${location}` : ""}`
    : `${name}${location ? ` - ${location}` : ""}`;

  const description =
    clinic?.seo_description?.trim() ||
    practitioner.professional_statement ||
    `${name}, ${qualification}${practiceName ? ` at ${practiceName}` : ""}.`;

  // ---------- DENTIST / PHYSICIAN SCHEMA ----------
  const dentistSchema = {
    "@context": "https://schema.org",
    "@type": ["Dentist", "Physician", "Person"],
    "@id": `${canonicalUrl}#person`,
    name,
    givenName: practitioner.first_name || undefined,
    familyName: practitioner.last_name || undefined,
    jobTitle: qualification,
    description,
    url: canonicalUrl,
    image: imageUrl ? absoluteUrl(imageUrl) : undefined,
    telephone: practitioner.practice_info?.practice_phone || undefined,
    email: practitioner.email || undefined,
    ...(practitioner.practice_info
      ? {
          worksFor: {
            "@type": "Dentist",
            name: practiceName || "Dental Practice",
            address: {
              "@type": "PostalAddress",
              streetAddress: practitioner.practice_info.address || undefined,
              addressLocality:
                practitioner.practice_info.city ||
                practitioner.practice_info.suburb ||
                undefined,
              addressRegion: practitioner.practice_info.state || undefined,
              postalCode: practitioner.practice_info.postcode || undefined,
              addressCountry: "AU",
            },
            telephone: practitioner.practice_info.practice_phone || undefined,
          },
        }
      : {}),
    ...(practitioner.languages?.length
      ? {
          knowsLanguage: practitioner.languages
            .map((l: any) => l?.name || l)
            .filter(Boolean),
        }
      : {}),
    ...(practitioner.practitioner_practice_services?.length
      ? {
          medicalSpecialty: practitioner.practitioner_practice_services
            .map((s: any) => s?.practice_service?.name)
            .filter(Boolean),
        }
      : {}),
    ...(practitioner.education
      ? {
          alumniOf: {
            "@type": "EducationalOrganization",
            name: String(practitioner.education),
          },
        }
      : {}),
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: canonicalUrl,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      result: {
        "@type": "Reservation",
        name: `Book appointment with ${name}`,
      },
    },
  };

  // ---------- BREADCRUMB ----------
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...(practitioner.practice_info?.state
        ? [{
            "@type": "ListItem",
            position: 2,
            name: practitioner.practice_info.state,
            item: absoluteUrl(
              `/?state=${encodeURIComponent(practitioner.practice_info.state)}`
            ),
          }]
        : []),
      ...(practitioner.practice_info?.city || practitioner.practice_info?.suburb
        ? [{
            "@type": "ListItem",
            position: practitioner.practice_info?.state ? 3 : 2,
            name:
              practitioner.practice_info.city ||
              practitioner.practice_info.suburb,
            item: absoluteUrl(
              `/?city=${encodeURIComponent(
                practitioner.practice_info.city ||
                  practitioner.practice_info.suburb
              )}`
            ),
          }]
        : []),
      {
        "@type": "ListItem",
        position:
          (practitioner.practice_info?.state ? 1 : 0) +
          (practitioner.practice_info?.city || practitioner.practice_info?.suburb ? 1 : 0) +
          2,
        name,
        item: canonicalUrl,
      },
    ],
  };

  // ---------- WEBSITE SCHEMA ----------
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    url: SITE_URL,
    name: SITE_NAME,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // ---------- PROFILE PAGE SCHEMA ----------
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: heading,
    description,
    isPartOf: { "@id": `${SITE_URL}#website` },
    about: { "@id": `${canonicalUrl}#person` },
    mainEntity: { "@id": `${canonicalUrl}#person` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dentistSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <div className="sr-only" aria-hidden="false">
        <p>
          {name}
          {qualification ? `, ${qualification}` : ""}
          {practiceName ? ` at ${practiceName}` : ""}
          {location ? ` located in ${location}` : ""}.
          {practitioner.practice_info?.practice_phone
            ? ` Phone: ${practitioner.practice_info.practice_phone}.`
            : ""}
          {practitioner.practitioner_practice_services?.length
            ? ` Services: ${practitioner.practitioner_practice_services
                .map((s: any) => s?.practice_service?.name)
                .filter(Boolean)
                .join(", ")}.`
            : ""}
          Book your dental appointment online with {name}.
        </p>
      </div>

      <DentistProfileClient practitioner={practitioner} />
    </>
  );
}