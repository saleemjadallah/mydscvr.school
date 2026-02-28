import { MetadataRoute } from "next";
import { getAllLandingPages } from "@/content/landing-pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mydscvr.ai";

  // Landing pages — static, always available
  const landingPageUrls = getAllLandingPages().map((page) => ({
    url: `${baseUrl}/best-schools/${page.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/schools?limit=1000`
    );
    const data = await res.json();

    const schoolUrls = (data.schools || []).map(
      (school: { slug: string; updated_at: string }) => ({
        url: `${baseUrl}/schools/${school.slug}`,
        lastModified: school.updated_at,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })
    );

    return [
      { url: baseUrl, changeFrequency: "daily", priority: 1 },
      { url: `${baseUrl}/schools`, changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/nurseries`, changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/compare`, changeFrequency: "weekly", priority: 0.7 },
      { url: `${baseUrl}/map`, changeFrequency: "weekly", priority: 0.7 },
      ...landingPageUrls,
      ...schoolUrls,
    ];
  } catch {
    return [
      { url: baseUrl, changeFrequency: "daily", priority: 1 },
      { url: `${baseUrl}/schools`, changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/nurseries`, changeFrequency: "daily", priority: 0.9 },
      ...landingPageUrls,
    ];
  }
}
