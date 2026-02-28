import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllLandingPages,
  getLandingPage,
} from "@/content/landing-pages";
import { fetchLandingPageData } from "@/lib/landing-pages";
import LandingHero from "@/components/landing/LandingHero";
import LandingIntro from "@/components/landing/LandingIntro";
import LandingSchoolGrid from "@/components/landing/LandingSchoolGrid";
import LandingFAQ from "@/components/landing/LandingFAQ";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingRelatedPages from "@/components/landing/LandingRelatedPages";
import type { LandingPageConfig } from "@/content/landing-pages/types";

// ISR: revalidate every 4 hours
export const revalidate = 14400;

// ---------------------------------------------------------------------------
// Static params — pre-render all landing pages at build time
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return getAllLandingPages().map((p) => ({ slug: p.slug }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = getLandingPage(slug);

  if (!config) {
    return { title: "Not Found | mydscvr.ai" };
  }

  return {
    title: config.title,
    description: config.metaDescription,
    alternates: {
      canonical: `/best-schools/${slug}`,
    },
    openGraph: {
      title: config.title,
      description: config.metaDescription,
      url: `/best-schools/${slug}`,
      type: "website",
      siteName: "mydscvr.ai",
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.metaDescription,
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers — build "View all" link from filters
// ---------------------------------------------------------------------------

function buildViewAllHref(config: LandingPageConfig): string {
  const p = new URLSearchParams();
  if (config.filters.curriculum) p.set("curriculum", config.filters.curriculum);
  if (config.filters.emirate) p.set("emirate", config.filters.emirate);
  if (config.filters.area) p.set("area", config.filters.area);
  if (config.filters.rating) p.set("rating", config.filters.rating);
  if (config.filters.feeMax) p.set("fee_max", config.filters.feeMax.toString());
  if (config.filters.hasSen) p.set("has_sen", "true");
  if (config.filters.type) p.set("type", config.filters.type);
  const qs = p.toString();
  return qs ? `/schools?${qs}` : "/schools";
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function LandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = getLandingPage(slug);

  if (!config) {
    notFound();
  }

  const data = await fetchLandingPageData(config);

  // Resolve related pages
  const allPages = getAllLandingPages();
  const relatedPages = config.relatedSlugs
    .map((s) => allPages.find((p) => p.slug === s))
    .filter((p): p is LandingPageConfig => p != null)
    .slice(0, 4);

  const viewAllHref = buildViewAllHref(config);

  // JSON-LD: BreadcrumbList
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://mydscvr.ai",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Schools",
        item: "https://mydscvr.ai/schools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: config.h1,
        item: `https://mydscvr.ai/best-schools/${slug}`,
      },
    ],
  };

  // JSON-LD: FAQPage
  const faqData =
    config.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: config.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  // JSON-LD: ItemList
  const itemListData =
    data.schools.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: config.h1,
          numberOfItems: data.totalCount,
          itemListElement: data.schools.slice(0, 10).map((school, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: school.name,
            url: `https://mydscvr.ai/schools/${school.slug}`,
          })),
        }
      : null;

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      {faqData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
        />
      )}
      {itemListData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListData) }}
        />
      )}

      <LandingHero
        h1={config.h1}
        breadcrumbLabel={config.h1}
        totalCount={data.totalCount}
        avgFee={data.avgFee}
        topRatedCount={data.topRatedCount}
      />

      <LandingIntro content={config.introContent} />

      <LandingSchoolGrid
        schools={data.schools}
        totalCount={data.totalCount}
        viewAllHref={viewAllHref}
        viewAllLabel={`View All ${data.totalCount} Schools`}
      />

      <LandingFAQ faqs={config.faqs} />

      <LandingCTA />

      <LandingRelatedPages pages={relatedPages} />
    </>
  );
}
