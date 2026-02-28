import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mydscvr.ai";

  return {
    rules: [
      // Explicitly allow AI crawlers for GEO (Generative Engine Optimization)
      // so mydscvr.ai gets cited by ChatGPT, Perplexity, Google AI Overviews, etc.
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/admin", "/school-admin", "/dashboard", "/profile", "/saved"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/api/", "/admin", "/school-admin", "/dashboard", "/profile", "/saved"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/api/", "/admin", "/school-admin", "/dashboard", "/profile", "/saved"],
      },
      {
        userAgent: "Amazonbot",
        allow: "/",
        disallow: ["/api/", "/admin", "/school-admin", "/dashboard", "/profile", "/saved"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: ["/api/", "/admin", "/school-admin", "/dashboard", "/profile", "/saved"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/api/", "/admin", "/school-admin", "/dashboard", "/profile", "/saved"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/", "/admin", "/school-admin", "/dashboard", "/profile", "/saved"],
      },
      {
        userAgent: "Bytespider",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      // Default rule for all other crawlers
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/school-admin", "/dashboard", "/profile", "/saved"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
