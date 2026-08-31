import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "http://localhost:3001";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/login",
        "/signup",
        "/booking/",
      ],
    },

    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/dentists/sitemap.xml`,
    ],
  };
}