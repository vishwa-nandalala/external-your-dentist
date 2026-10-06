// app/clinic/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { practiceApi } from "@/lib/api/client";
import { clinicSlug } from "@/lib/slug";
import ClinicProfileClient from "./ClinicProfileClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://yourdentist.com.au";

const SITE_NAME = "Your Dentist";

type Props = {
  params: Promise<{ slug: string; id: string }>;
};

async function loadClinic(id: string) {
  try {
    const clinic = await practiceApi.getClinicById(id);
    if (clinic) return clinic;
  } catch { }

  try {
    const unclaimed = await practiceApi.getUnclaimedPracticeById(id);
    if (unclaimed) return unclaimed;
  } catch { }

  return null;
}

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

function buildLocation(clinic: any): string {
  const city = clinic.city || clinic.suburb;
  return [city, clinic.state, clinic.postcode].filter(Boolean).join(", ");
}

function buildHeading(clinic: any): string {
  const name = clinic?.practice_name?.trim() || "Clinic";
  const location = buildLocation(clinic);
  return location ? `${name} - ${location}` : name;
}

function buildFullAddress(clinic: any): string {
  return [
    clinic.address,
    clinic.city || clinic.suburb,
    clinic.state,
    clinic.postcode,
  ]
    .filter(Boolean)
    .join(", ");
}

function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// ============================================================
// ✅ PERFECT METADATA
// ============================================================
export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;

  const clinic = await loadClinic(id);

  if (!clinic) {
    return {
      title: "Clinic Not Found",
      description: "The clinic you're looking for could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const name = clinic.practice_name?.trim() || "Dental Clinic";

  const location = buildLocation(clinic);

  const title = location
    ? `${name} - ${location}`
    : name;

  const canonicalPath =
    `/clinicprofile/${clinicSlug(clinic)}/${clinic.id}`;

  const canonicalUrl = absoluteUrl(canonicalPath);

  const description =
    clinic.seo_description?.trim() ||
    clinic.description?.trim()?.slice(0, 155) ||
    `Visit ${name}${location ? ` in ${location}` : ""}. View dental services, opening hours, dentist information, and book your appointment online.`;

  const keywords =
    normalizeKeywords(clinic.seo_keywords) ??
    [
      name,
      "dentist",
      "dental clinic",
      "dental practice",
      "dental care",
      "book dentist",
      "book dental appointment",
      location ? `dentist in ${location}` : null,
      clinic.city ? `dentist in ${clinic.city}` : null,
      clinic.state ? `dentist in ${clinic.state}` : null,
      clinic.postcode ? `dentist ${clinic.postcode}` : null,
    ].filter(Boolean) as string[];

  const imageUrl =
    clinic.banner_image?.url ||
    clinic.logo?.url ||
    undefined;

  const imageAlt =
    location
      ? `${name} - ${location}`
      : name;

  return {
    title,
    description,
    keywords,

    applicationName: SITE_NAME,
    creator: SITE_NAME,
    publisher: SITE_NAME,

    alternates: {
      canonical: canonicalUrl,
    },

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
      type: "website",
      locale: "en_AU",

      url: canonicalUrl,

      siteName: SITE_NAME,

      // Current clinic name
      title,

      // Current clinic SEO description
      description,

      images: imageUrl
        ? [
            {
              url: absoluteUrl(imageUrl),
              width: 1200,
              height: 630,
              alt: imageAlt,
            },
          ]
        : [],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,

      images: imageUrl
        ? [
            {
              url: absoluteUrl(imageUrl),
              alt: imageAlt,
            },
          ]
        : [],
    },

    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },

    other: {
      "og:phone_number":
        clinic.practice_phone || "",

      "og:street-address":
        clinic.address || "",

      "og:locality":
        clinic.city ||
        clinic.suburb ||
        "",

      "og:region":
        clinic.state || "",

      "og:postal-code":
        clinic.postcode || "",

      "og:country-name":
        "Australia",
    },
  };
}

// ============================================================
// ✅ PERFECT JSON-LD (Dentist + LocalBusiness + Breadcrumb)
// ============================================================
export default async function ClinicProfilePage({ params }: Props) {
  const { id } = await params;

  const clinic = await loadClinic(id);
  if (!clinic) notFound();

  const heading = buildHeading(clinic);
  const name = clinic.practice_name || "Clinic";
  const location = buildLocation(clinic);
  const fullAddress = buildFullAddress(clinic);
  const canonicalPath = `/clinicprofile/${clinicSlug(clinic)}/${clinic.id}`;
  const canonicalUrl = absoluteUrl(canonicalPath);
  const imageUrl = clinic.banner_image?.url || clinic.logo?.url || undefined;

  // ---------- DENTIST / MEDICAL BUSINESS SCHEMA ----------
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": ["Dentist", "MedicalBusiness", "LocalBusiness"],
    "@id": `${canonicalUrl}#business`,
    name,
    alternateName: heading,
    description:
      clinic.seo_description || clinic.description || `${name} dental clinic.`,
    url: canonicalUrl,
    image: imageUrl ? absoluteUrl(imageUrl) : undefined,
    logo: clinic.logo?.url ? absoluteUrl(clinic.logo.url) : undefined,
    telephone: clinic.practice_phone || undefined,
    email: clinic.email || undefined,
    priceRange: "$$",
    currenciesAccepted: "AUD",
    paymentAccepted: "Cash, Credit Card, Debit Card, Health Insurance",
    address: {
      "@type": "PostalAddress",
      streetAddress: clinic.address || undefined,
      addressLocality: clinic.city || clinic.suburb || undefined,
      addressRegion: clinic.state || undefined,
      postalCode: clinic.postcode || undefined,
      addressCountry: "AU",
    },
    areaServed: {
      "@type": "City",
      name: clinic.city || clinic.suburb || clinic.state || "Australia",
    },
    ...(clinic.practice_opening_hours?.length
      ? {
        openingHoursSpecification: clinic.practice_opening_hours
          .filter((h: any) => h.is_open)
          .map((h: any) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: h.day_of_week,
            opens: h.time_slots?.[0]?.start || undefined,
            closes: h.time_slots?.[0]?.end || undefined,
          })),
      }
      : {}),
    ...(clinic.practice_services?.length
      ? {
        medicalSpecialty: clinic.practice_services.map((s: any) => s.name),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Dental Services",
          itemListElement: clinic.practice_services.map((s: any) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "MedicalProcedure",
              name: s.name,
            },
          })),
        },
      }
      : {}),
    ...(clinic.practice_team_members?.length
      ? {
        employee: clinic.practice_team_members.map((m: any) => ({
          "@type": "Person",
          name: `${m.first_name} ${m.last_name || ""}`.trim(),
          jobTitle: m.qualification || "Dental Practitioner",
          image: m.image?.url ? absoluteUrl(m.image.url) : undefined,
          url: absoluteUrl(
            `/dentistprofile/${clinicSlug({
              id: m.id,
              name: `${m.first_name} ${m.last_name || ""}`.trim(),
            })}/${m.id}`
          ),
        })),
      }
      : {}),
    ...(clinic.practice_insurances?.length
      ? {
        paymentAccepted: clinic.practice_insurances
          .map((i: any) => i.provider_name)
          .join(", "),
      }
      : {}),
    ...(clinic.practice_base_info?.website
      ? { sameAs: [clinic.practice_base_info.website] }
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
        name: `Book appointment at ${name}`,
      },
    },
  };

  // ---------- BREADCRUMB SCHEMA ----------
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      ...(clinic.state
        ? [
          {
            "@type": "ListItem",
            position: 2,
            name: clinic.state,
            item: absoluteUrl(`/?state=${encodeURIComponent(clinic.state)}`),
          },
        ]
        : []),
      ...(clinic.city || clinic.suburb
        ? [
          {
            "@type": "ListItem",
            position: clinic.state ? 3 : 2,
            name: clinic.city || clinic.suburb,
            item: absoluteUrl(
              `/?city=${encodeURIComponent(clinic.city || clinic.suburb)}`
            ),
          },
        ]
        : []),
      {
        "@type": "ListItem",
        position: (clinic.state ? 1 : 0) + (clinic.city || clinic.suburb ? 1 : 0) + 2,
        name,
        item: canonicalUrl,
      },
    ],
  };

  // ---------- WEBSITE SCHEMA (Sitelinks SearchBox) ----------
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

  return (
    <>
      {/* ✅ MULTIPLE JSON-LD BLOCKS (Google prefers this) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* ✅ Hidden SEO content — visible to crawlers, accessible, no duplicate H1 */}
      <div className="sr-only" aria-hidden="false">
        <p>
          {name}
          {location ? ` is a dental clinic located in ${location}` : ""}.
          {fullAddress ? ` Address: ${fullAddress}.` : ""}
          {clinic.practice_phone ? ` Phone: ${clinic.practice_phone}.` : ""}
          {clinic.practice_services?.length
            ? ` Services: ${clinic.practice_services
              .map((s: any) => s.name)
              .join(", ")}.`
            : ""}
          Book your dental appointment online.
        </p>
      </div>

      <ClinicProfileClient clinic={clinic} heading={heading} name={name} />
    </>
  );
}