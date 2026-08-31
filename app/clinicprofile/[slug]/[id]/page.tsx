import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { practiceApi } from "@/lib/api/client";
import { clinicSlug } from "@/lib/slug";
import ClinicProfileClient from "./ClinicProfileClient";

type Props = {
  params: Promise<{ slug: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const clinic = await practiceApi.getClinicById(id);

    if (!clinic) {
      return { title: "Clinic Not Found" };
    }

    const location = [clinic.city, clinic.state, clinic.postcode]
      .filter(Boolean)
      .join(", ");

    const isVerified = clinic.status === "ACTIVE";

    return {
      title: `${clinic.practice_name || "Clinic"}${location ? ` - ${location}` : ""}`,
      description:
        clinic.description ||
        `${clinic.practice_name || "Clinic"}${location ? ` in ${location}` : ""}. View clinic details, services, and book appointments.`,
      openGraph: {
        title: `${clinic.practice_name || "Clinic"}${location ? ` - ${location}` : ""}`,
        description:
          clinic.description || `View clinic details and book appointments.`,
        images: clinic.banner_image?.url ? [clinic.banner_image.url] : [],
        type: "website",
      },
      alternates: {
        canonical: `/clinicprofile/${clinicSlug(clinic)}/${clinic.id}`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return { title: "Clinic Not Found" };
  }
}

export default async function ClinicProfilePage({ params }: Props) {
  const { id } = await params;

  // Direct API call using ID from URL — no slug resolution needed!
  let clinic;
  try {
    clinic = await practiceApi.getClinicById(id);
  } catch {
    notFound();
  }

  if (!clinic) {
    notFound();
  }

  const isVerified = clinic.status === "ACTIVE";
  const location = [clinic.city, clinic.state, clinic.postcode]
    .filter(Boolean)
    .join(", ");

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: clinic.practice_name || "Clinic",
    description: clinic.description || undefined,
    url: `/clinicprofile/${clinicSlug(clinic)}/${clinic.id}`,
    image: clinic.banner_image?.url || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: clinic.address || undefined,
      addressLocality: clinic.city || undefined,
      addressRegion: clinic.state || undefined,
      postalCode: clinic.postcode || undefined,
    },
    telephone: clinic.practice_phone || undefined,
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
