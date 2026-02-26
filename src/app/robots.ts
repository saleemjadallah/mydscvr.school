import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mydscvr.ai";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/dashboard", "/profile", "/saved"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
