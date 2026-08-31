// app/dentists/sitemap.ts
// Dedicated sitemap for all dentist (team member) profile URLs.

import type { MetadataRoute } from "next";
import { practiceApi } from "@/lib/api/client";
import { dentistUrl } from "@/lib/slug";
import type { ClinicProfile } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

  try {
    const clinics: ClinicProfile[] = await practiceApi.getAllClinicsWithTeamMembers();

    const dentistRoutes: MetadataRoute.Sitemap = [];

    clinics.forEach((clinic) => {
      if (clinic.practice_team_members?.length) {
        clinic.practice_team_members.forEach((dentist) => {
          dentistRoutes.push({
            url: `${baseUrl}${dentistUrl(dentist)}`,
            lastModified: dentist.updated_at
              ? new Date(dentist.updated_at)
              : new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        });
      }
    });

    return dentistRoutes;
  } catch (error) {
    console.error("Error generating dentist sitemap routes:", error);
    return [];
  }
}
