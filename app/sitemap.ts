// app/sitemap.ts

import type { MetadataRoute } from "next";
import { practiceApi } from "@/lib/api/client";
import { clinicUrl, dentistUrl } from "@/lib/slug";
import type { ClinicProfile } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use the actual frontend URL, not localhost:5173 (that looks like Vite). 
  // For Next.js, it should be 3000 or 3001.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/find-dentists`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/aboutus`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/carrers`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

   let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const clinics: ClinicProfile[] = await practiceApi.getAllClinicsWithTeamMembers();

    console.log("<===================== clinics in the sitemap ===================>", clinics);

    const clinicProfileRoutes = clinics.map((clinic) => ({
      url: `${baseUrl}${clinicUrl({ id: clinic.id, practice_name: clinic.practice_name })}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // 2. Generate dynamic DENTIST profile URLs
    const dentistRoutes: MetadataRoute.Sitemap = [];

    clinics.forEach((clinic) => {
      if (clinic.practice_team_members?.length) {
        clinic.practice_team_members.forEach((dentist) => {
          dentistRoutes.push({
            url: `${baseUrl}${dentistUrl(dentist)}`,
            lastModified: dentist.updated_at
              ? new Date(dentist.updated_at)
              : new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
          });
        });
      }
    });

    // Combine all dynamic routes
    dynamicRoutes = [...clinicProfileRoutes, ...dentistRoutes];

  } catch (error) {
    console.error("Error generating dynamic sitemap routes. Returning static routes only:", error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}