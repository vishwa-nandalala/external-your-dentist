// app/sitemap.ts

import type { MetadataRoute } from "next";
import { practiceApi } from "@/lib/api/client";
import { clinicUrl, dentistUrl } from "@/lib/slug";
import type { ClinicProfile, UnclaimedPractice } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

  // Static routes (unchanged)
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/find-dentists`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/aboutus`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/carrers`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    // =========================
    // 1. CLAIMED CLINICS + DENTISTS (existing logic)
    // =========================
    const clinics: ClinicProfile[] = await practiceApi.getAllClinicsWithTeamMembers();
    console.log("Claimed clinics:", clinics.length);

    const clinicProfileRoutes: MetadataRoute.Sitemap = clinics.map((clinic) => ({
      url: `${baseUrl}${clinicUrl({ id: clinic.id, practice_name: clinic.practice_name })}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    const dentistRoutes: MetadataRoute.Sitemap = [];
    clinics.forEach((clinic) => {
      clinic.practice_team_members?.forEach((dentist) => {
        dentistRoutes.push({
          url: `${baseUrl}${dentistUrl(dentist)}`,
          lastModified: dentist.updated_at ? new Date(dentist.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        });
      });
    });

    // =========================
    // 2. UNCLAIMED PRACTICES (new logic)
    // =========================
    const unclaimed: ClinicProfile[] = await practiceApi.getAllUnclaimedPractices();
    console.log("Unclaimed practices:", unclaimed.length);

    const unclaimedRoutes: MetadataRoute.Sitemap = unclaimed.map((practice) => ({
      url: `${baseUrl}${clinicUrl({ 
        id: practice.id, 
        practice_name: practice.practice_name 
      })}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5, // lower priority since they're unclaimed
    }));

    // Combine all
    dynamicRoutes = [
      ...clinicProfileRoutes,
      ...dentistRoutes,
      ...unclaimedRoutes,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}