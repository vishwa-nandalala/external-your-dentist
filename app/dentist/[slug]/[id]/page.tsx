import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { practiceApi } from "@/lib/api/client";
import { dentistSlug } from "@/lib/slug";
import DentistProfileClient from "./DentistProfileClient";

type Props = {
  params: Promise<{ slug: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const practitioner = await practiceApi.getPractitionerById(id);

    if (!practitioner) {
      return { title: "Dentist Not Found" };
    }

    const name = `${practitioner.first_name} ${practitioner.last_name}`;
    const practiceName = practitioner.practice_info?.practice_name || "";
    const location = [
      practitioner.practice_info?.city,
      practitioner.practice_info?.state,
    ]
      .filter(Boolean)
      .join(", ");

    return {
      title: `${name}${practiceName ? ` - ${practiceName}` : ""}`,
      description:
        practitioner.professional_statement ||
        `${name}, ${practitioner.qualification || "Dental Practitioner"}${location ? ` in ${location}` : ""}. View practitioner details and book appointments.`,
      openGraph: {
        title: `${name}${practiceName ? ` - ${practiceName}` : ""}`,
        description:
          practitioner.professional_statement ||
          `View practitioner details and book appointments.`,
        images: practitioner.image?.url ? [practitioner.image.url] : [],
      },
      alternates: {
        canonical: `/dentist/${dentistSlug({
          id: practitioner.id,
          first_name: practitioner.first_name,
          last_name: practitioner.last_name,
        })}/${practitioner.id}`,
      },
    };
  } catch {
    return { title: "Dentist Not Found" };
  }
}

export default async function DentistProfilePage({ params }: Props) {
  const { id } = await params;

  // Direct API call using ID from URL — no slug resolution needed!
  let practitioner;
  try {
    practitioner = await practiceApi.getPractitionerById(id);
  } catch {
    notFound();
  }

  if (!practitioner) {
    notFound();
  }

  return <DentistProfileClient practitioner={practitioner} />;
}
