import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Star,
  MapPin,
  Phone,
  Globe,
  Mail,
  GraduationCap,
  DollarSign,
  Users,
  Bus,
  ShieldCheck,
  Dumbbell,
  Waves,
  Palette,
  Clock,
  Building2,
  ChevronRight,
  ExternalLink,
  FileText,
  BookOpen,
  BadgeCheck,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Newspaper,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EnquiryForm from "@/components/EnquiryForm";
import SchoolNews from "@/components/SchoolNews";
import SimilarSchools from "@/components/SimilarSchools";
import ProfileMap from "@/components/ProfileMap";
import AnimatedSection from "@/components/AnimatedSection";
import type { School, KHDAReport, FeeHistory, Review } from "@/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const KHDA_COLOR_MAP: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Outstanding: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  "Very Good": {
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  Good: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  Acceptable: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  Weak: {
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  "Very Weak": {
    bg: "bg-red-200",
    text: "text-red-800",
    dot: "bg-red-600",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolvePhotos(raw: string[] | string | null | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatFee(amount: number): string {
  return new Intl.NumberFormat("en-AE", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount);
}

function sentimentColor(
  sentiment: "positive" | "neutral" | "negative" | null
): { bg: string; text: string } {
  switch (sentiment) {
    case "positive":
      return { bg: "bg-emerald-100", text: "text-emerald-700" };
    case "negative":
      return { bg: "bg-red-100", text: "text-red-700" };
    case "neutral":
      return { bg: "bg-gray-100", text: "text-gray-700" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-600" };
  }
}

function sentimentIcon(sentiment: "positive" | "neutral" | "negative" | null) {
  switch (sentiment) {
    case "positive":
      return <ThumbsUp className="size-3" />;
    case "negative":
      return <ThumbsDown className="size-3" />;
    default:
      return <Minus className="size-3" />;
  }
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getSchool(slug: string): Promise<School | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/schools/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
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
  const school = await getSchool(slug);

  if (!school) {
    return {
      title: "School Not Found | mydscvr.ai",
    };
  }

  const photos = resolvePhotos(school.google_photos);
  const ogImage = photos[0] ?? undefined;
  const description =
    school.ai_summary ?? school.meta_description ?? school.description ?? undefined;

  return {
    title: `${school.meta_title ?? school.name} | mydscvr.ai`,
    ...(description ? { description } : {}),
    openGraph: {
      title: `${school.name} | mydscvr.ai`,
      ...(description ? { description } : {}),
      type: "article",
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${school.name} | mydscvr.ai`,
      ...(description ? { description } : {}),
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SchoolProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = await getSchool(slug);

  if (!school) {
    notFound();
  }

  const photos = resolvePhotos(school.google_photos);
  const khdaColors = school.khda_rating
    ? KHDA_COLOR_MAP[school.khda_rating] ?? {
        bg: "bg-gray-100",
        text: "text-gray-700",
        dot: "bg-gray-400",
      }
    : null;

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "School",
    name: school.name,
    ...((school.ai_summary ?? school.meta_description ?? school.description)
      ? { description: school.ai_summary ?? school.meta_description ?? school.description }
      : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: school.address ?? undefined,
      addressLocality: school.area ?? "Dubai",
      addressRegion: "Dubai",
      addressCountry: "AE",
    },
    ...(school.latitude && school.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: school.latitude,
            longitude: school.longitude,
          },
        }
      : {}),
    ...(school.phone ? { telephone: school.phone } : {}),
    ...(school.email ? { email: school.email } : {}),
    ...(school.website ? { url: school.website } : {}),
    ...(photos.length > 0 ? { image: photos[0] } : {}),
    ...(school.google_rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: school.google_rating,
            reviewCount: school.google_review_count ?? 0,
            bestRating: 5,
          },
        }
      : {}),
    ...(school.fee_min || school.fee_max
      ? {
          priceRange:
            school.fee_min != null && school.fee_max != null
              ? `AED ${formatFee(school.fee_min)} - ${formatFee(school.fee_max)}`
              : school.fee_min != null
                ? `From AED ${formatFee(school.fee_min)}`
                : `Up to AED ${formatFee(school.fee_max!)}`,
        }
      : {}),
  };

  return (
    <>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* ================================================================
          FULL-BLEED CINEMATIC HERO
          ================================================================ */}
      <section className="relative">
        {photos.length > 0 ? (
          <div className="relative h-[40vh] min-h-[320px] w-full overflow-hidden">
            <Image
              src={photos[0]}
              alt={school.name}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/50 to-transparent" />
          </div>
        ) : (
          <div
            className="relative h-[40vh] min-h-[320px] w-full"
            style={{ background: "var(--gradient-hero)" }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="size-20 text-white/10" />
            </div>
          </div>
        )}

        {/* Hero content overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-1.5 text-sm text-white/60">
              <Link href="/" className="hover:text-white/80">
                Home
              </Link>
              <ChevronRight className="size-3.5" />
              <Link href="/schools" className="hover:text-white/80">
                Schools
              </Link>
              <ChevronRight className="size-3.5" />
              <span className="truncate text-white/90 font-medium">
                {school.name}
              </span>
            </nav>

            {/* School name */}
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {school.name}
            </h1>

            {/* Badges */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {school.khda_rating && khdaColors && (
                <Badge
                  className={`${khdaColors.bg} ${khdaColors.text} border-0 gap-1.5 px-2.5 py-1 text-xs font-semibold`}
                >
                  <span
                    className={`inline-block size-2 rounded-full ${khdaColors.dot}`}
                  />
                  KHDA: {school.khda_rating}
                  {school.khda_rating_year && (
                    <span className="opacity-70">
                      ({school.khda_rating_year})
                    </span>
                  )}
                </Badge>
              )}

              {school.area && (
                <Badge className="glass-dark border-white/10 gap-1 text-xs text-white/90">
                  <MapPin className="size-3" />
                  {school.area}
                </Badge>
              )}

              {school.curriculum?.map((c) => (
                <Badge
                  key={c}
                  className="glass-dark border-white/10 text-xs text-white/90"
                >
                  {c}
                </Badge>
              ))}

              {school.google_rating != null && (
                <Badge className="glass-dark border-white/10 gap-1 text-xs text-white/90">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {school.google_rating.toFixed(1)}
                  {school.google_review_count != null && (
                    <span className="text-white/60">
                      ({school.google_review_count.toLocaleString()})
                    </span>
                  )}
                </Badge>
              )}

              {school.is_verified && (
                <Badge className="gap-1 border-0 bg-emerald-100 text-xs text-emerald-700">
                  <BadgeCheck className="size-3" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Photo strip (thumbnails) */}
      {photos.length > 1 && (
        <div className="relative z-10 -mt-6 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {photos.slice(1, 6).map((photo, idx) => (
                <div
                  key={idx}
                  className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-36"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <Image
                    src={photo}
                    alt={`${school.name} — photo ${idx + 2}`}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Main grid: 2/3 content + 1/3 sidebar */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* ================================================================
              MAIN CONTENT (col-span-2)
              ================================================================ */}
          <div className="space-y-12 lg:col-span-2">
            {/* ----------------------------------------------------------
                2. AI SUMMARY CARD
                ---------------------------------------------------------- */}
            {school.ai_summary && (
              <AnimatedSection>
                <div className="relative overflow-hidden rounded-2xl border border-purple-100/50 bg-gradient-to-br from-purple-50/60 via-white to-[#FF6B35]/5 p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                  {/* Decorative blur orb */}
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-200/30 blur-2xl" />

                  <div className="relative">
                    <div className="mb-3 flex items-center gap-2.5">
                      <div
                        className="flex size-9 items-center justify-center rounded-lg"
                        style={{
                          background: "linear-gradient(135deg, #6B21A8, #A855F7)",
                        }}
                      >
                        <Sparkles className="size-4 text-white" />
                      </div>
                      <h2 className="font-display text-lg font-semibold text-gray-900">
                        AI Summary
                      </h2>
                    </div>

                    <p className="mb-4 leading-relaxed text-gray-700">
                      {school.ai_summary}
                    </p>

                    {/* Strengths */}
                    {school.ai_strengths && school.ai_strengths.length > 0 && (
                      <div className="mb-3">
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                          Strengths
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {school.ai_strengths.map((s, i) => (
                            <Badge
                              key={i}
                              className="border-0 bg-emerald-100 text-xs font-medium text-emerald-700"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Considerations */}
                    {school.ai_considerations &&
                      school.ai_considerations.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600">
                            Considerations
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {school.ai_considerations.map((c, i) => (
                              <Badge
                                key={i}
                                className="border-0 bg-amber-100 text-xs font-medium text-amber-700"
                              >
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* ----------------------------------------------------------
                3. QUICK FACTS GRID
                ---------------------------------------------------------- */}
            <AnimatedSection delay={0.1}>
              <h2 className="mb-5 font-display text-xl font-semibold text-gray-900">
                Quick Facts
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {school.khda_rating && (
                  <QuickFact
                    icon={<ShieldCheck className="size-5 text-emerald-600" />}
                    label="KHDA Rating"
                    value={school.khda_rating}
                  />
                )}
                {(school.fee_min != null || school.fee_max != null) && (
                  <QuickFact
                    icon={<DollarSign className="size-5 text-[#FF6B35]" />}
                    label="Annual Fees"
                    value={
                      school.fee_min != null && school.fee_max != null
                        ? `AED ${formatFee(school.fee_min)} - ${formatFee(school.fee_max)}`
                        : school.fee_min != null
                          ? `From AED ${formatFee(school.fee_min)}`
                          : `Up to AED ${formatFee(school.fee_max!)}`
                    }
                  />
                )}
                {school.curriculum?.length > 0 && (
                  <QuickFact
                    icon={<BookOpen className="size-5 text-blue-600" />}
                    label="Curriculum"
                    value={school.curriculum.join(", ")}
                  />
                )}
                <QuickFact
                  icon={<Users className="size-5 text-purple-600" />}
                  label="Gender"
                  value={
                    school.gender === "mixed"
                      ? "Co-educational"
                      : school.gender === "boys"
                        ? "Boys Only"
                        : "Girls Only"
                  }
                />
                {school.phases?.length > 0 && (
                  <QuickFact
                    icon={<GraduationCap className="size-5 text-indigo-600" />}
                    label="Phases"
                    value={school.phases.join(", ")}
                  />
                )}
                {school.has_transport && (
                  <QuickFact
                    icon={<Bus className="size-5 text-cyan-600" />}
                    label="Transport"
                    value="Available"
                  />
                )}
                {school.has_sen_support && (
                  <QuickFact
                    icon={<ShieldCheck className="size-5 text-pink-600" />}
                    label="SEN Support"
                    value="Available"
                  />
                )}
                {school.has_sports_facilities && (
                  <QuickFact
                    icon={<Dumbbell className="size-5 text-orange-600" />}
                    label="Sports"
                    value="Sports Facilities"
                  />
                )}
                {school.has_swimming_pool && (
                  <QuickFact
                    icon={<Waves className="size-5 text-sky-500" />}
                    label="Swimming Pool"
                    value="Available"
                  />
                )}
                {school.has_arts_program && (
                  <QuickFact
                    icon={<Palette className="size-5 text-rose-500" />}
                    label="Arts Program"
                    value="Available"
                  />
                )}
                {school.has_after_school && (
                  <QuickFact
                    icon={<Clock className="size-5 text-amber-600" />}
                    label="After School"
                    value="Programs Available"
                  />
                )}
                {school.total_students != null && (
                  <QuickFact
                    icon={<Users className="size-5 text-teal-600" />}
                    label="Students"
                    value={school.total_students.toLocaleString()}
                  />
                )}
              </div>
            </AnimatedSection>

            {/* ----------------------------------------------------------
                4. KHDA REPORT SECTION
                ---------------------------------------------------------- */}
            {school.khda_reports && school.khda_reports.length > 0 && (
              <AnimatedSection delay={0.15}>
                <h2 className="mb-5 font-display text-xl font-semibold text-gray-900">
                  KHDA Inspection Reports
                </h2>
                <div className="space-y-4">
                  {school.khda_reports
                    .sort((a: KHDAReport, b: KHDAReport) => b.year - a.year)
                    .map((report: KHDAReport) => {
                      const reportColors =
                        KHDA_COLOR_MAP[report.rating] ?? {
                          bg: "bg-gray-100",
                          text: "text-gray-700",
                          dot: "bg-gray-400",
                        };

                      return (
                        <div
                          key={report.id}
                          className="rounded-2xl bg-white p-5"
                          style={{ boxShadow: "var(--shadow-card)" }}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="size-5 text-gray-400" />
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {report.year} Inspection
                                </p>
                                <Badge
                                  className={`${reportColors.bg} ${reportColors.text} mt-1 border-0 text-xs`}
                                >
                                  {report.rating}
                                </Badge>
                              </div>
                            </div>
                            {report.report_url && (
                              <Link
                                href={report.report_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5"
                                >
                                  <ExternalLink className="size-3.5" />
                                  View Report
                                </Button>
                              </Link>
                            )}
                          </div>

                          {report.ai_summary && (
                            <p className="mt-3 text-sm leading-relaxed text-gray-600">
                              {report.ai_summary}
                            </p>
                          )}

                          {report.key_findings &&
                            typeof report.key_findings === "object" && (
                              <div className="mt-3">
                                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                  Key Findings
                                </p>
                                <ul className="space-y-1">
                                  {Object.entries(report.key_findings).map(
                                    ([key, val]) => (
                                      <li
                                        key={key}
                                        className="flex items-start gap-2 text-sm text-gray-600"
                                      >
                                        <span className="mt-1.5 inline-block size-1.5 flex-shrink-0 rounded-full bg-[#FF6B35]" />
                                        <span>
                                          <span className="font-medium text-gray-800">
                                            {key}:
                                          </span>{" "}
                                          {String(val)}
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      );
                    })}
                </div>
              </AnimatedSection>
            )}

            {/* ----------------------------------------------------------
                5. FEE TABLE
                ---------------------------------------------------------- */}
            {school.fee_history && school.fee_history.length > 0 && (
              <AnimatedSection delay={0.2}>
                <h2 className="mb-5 font-display text-xl font-semibold text-gray-900">
                  Fee Structure
                </h2>
                <div className="overflow-hidden rounded-2xl" style={{ boxShadow: "var(--shadow-card)" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          Grade / Year
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          Annual Fee (AED)
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">
                          Year
                        </th>
                        <th className="hidden px-4 py-3 text-left font-semibold text-gray-700 sm:table-cell">
                          Source
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {school.fee_history
                        .sort(
                          (a: FeeHistory, b: FeeHistory) =>
                            b.year - a.year ||
                            (a.grade ?? "").localeCompare(b.grade ?? "")
                        )
                        .map((fee: FeeHistory) => (
                          <tr
                            key={fee.id}
                            className="border-t border-gray-100 bg-white hover:bg-gray-50/50"
                          >
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {fee.grade ?? "All Grades"}
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              AED {formatFee(fee.fee_aed)}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {fee.year}
                            </td>
                            <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                              {fee.source}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </AnimatedSection>
            )}

            {/* ----------------------------------------------------------
                6. REVIEWS SECTION
                ---------------------------------------------------------- */}
            {school.reviews && school.reviews.length > 0 && (
              <AnimatedSection delay={0.25}>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold text-gray-900">
                    Reviews
                  </h2>
                  <p className="text-sm text-gray-500">
                    {school.reviews.length} review
                    {school.reviews.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="space-y-4">
                  {school.reviews
                    .sort(
                      (a: Review, b: Review) =>
                        new Date(b.published_at ?? b.created_at).getTime() -
                        new Date(a.published_at ?? a.created_at).getTime()
                    )
                    .map((review: Review) => {
                      const sColor = sentimentColor(review.sentiment);
                      return (
                        <div
                          key={review.id}
                          className="rounded-2xl bg-white p-5"
                          style={{ boxShadow: "var(--shadow-card)" }}
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {review.author ?? "Anonymous"}
                              </p>
                              {review.author_type && (
                                <p className="text-xs capitalize text-gray-500">
                                  {review.author_type}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {review.sentiment && (
                                <Badge
                                  className={`${sColor.bg} ${sColor.text} gap-1 border-0 text-[10px]`}
                                >
                                  {sentimentIcon(review.sentiment)}
                                  {review.sentiment}
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className="text-[10px] capitalize text-gray-500"
                              >
                                {review.source}
                              </Badge>
                            </div>
                          </div>

                          {review.rating != null && (
                            <div className="mb-2 flex items-center gap-1.5">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`size-4 ${
                                      i < review.rating!
                                        ? "fill-amber-400 text-amber-400"
                                        : "fill-gray-200 text-gray-200"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {review.rating.toFixed(1)}
                              </span>
                            </div>
                          )}

                          {review.text && (
                            <p className="text-sm leading-relaxed text-gray-600">
                              {review.text}
                            </p>
                          )}

                          {(review.published_at ?? review.created_at) && (
                            <p className="mt-2 text-xs text-gray-400">
                              {new Date(
                                review.published_at ?? review.created_at
                              ).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              </AnimatedSection>
            )}

            {/* ----------------------------------------------------------
                6b. IN THE NEWS (Exa-powered)
                ---------------------------------------------------------- */}
            <Suspense
              fallback={
                <section>
                  <div className="mb-5 flex items-center gap-2">
                    <Newspaper className="size-5 text-[#FF6B35]" />
                    <h2 className="font-display text-xl font-semibold text-gray-900">
                      In the News
                    </h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-2xl bg-white p-4"
                        style={{ boxShadow: "var(--shadow-card)" }}
                      >
                        <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                        <div className="mb-1 h-3 w-full rounded bg-gray-100" />
                        <div className="mb-3 h-3 w-2/3 rounded bg-gray-100" />
                        <div className="h-2.5 w-1/3 rounded bg-gray-100" />
                      </div>
                    ))}
                  </div>
                </section>
              }
            >
              <SchoolNews slug={slug} />
            </Suspense>

            {/* ----------------------------------------------------------
                7. MAP SECTION
                ---------------------------------------------------------- */}
            <AnimatedSection delay={0.3}>
              <h2 className="mb-5 font-display text-xl font-semibold text-gray-900">
                Location
              </h2>
              {school.latitude && school.longitude ? (
                <div className="space-y-3">
                  <ProfileMap
                    latitude={school.latitude}
                    longitude={school.longitude}
                    name={school.name}
                    address={school.address}
                  />
                  <div className="flex items-center justify-between">
                    {school.address && (
                      <p className="text-sm text-gray-500">
                        {school.address}
                      </p>
                    )}
                    <Link
                      href={`https://www.google.com/maps/search/?api=1&query=${school.latitude},${school.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                      >
                        <ExternalLink className="size-3.5" />
                        Open in Google Maps
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-2xl bg-gray-50" style={{ boxShadow: "var(--shadow-card)" }}>
                  <p className="text-sm text-gray-400">
                    Location data not available
                  </p>
                </div>
              )}
            </AnimatedSection>
          </div>

          {/* ================================================================
              SIDEBAR (col-span-1, sticky)
              ================================================================ */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* ----------------------------------------------------------
                  Quick Contact Card
                  ---------------------------------------------------------- */}
              <div
                className="relative overflow-hidden rounded-2xl bg-white p-5"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* Gradient top stripe */}
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{
                    background: "linear-gradient(90deg, #FF6B35, #FBBF24)",
                  }}
                />

                <h3 className="mb-4 text-base font-semibold text-gray-900">
                  Contact {school.name}
                </h3>

                <div className="space-y-3">
                  {school.phone && (
                    <Link
                      href={`tel:${school.phone}`}
                      className="flex items-center gap-3 rounded-xl p-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Phone className="size-4 flex-shrink-0 text-[#FF6B35]" />
                      <span>{school.phone}</span>
                    </Link>
                  )}

                  {(school.email ?? school.admission_email) && (
                    <Link
                      href={`mailto:${school.admission_email ?? school.email}`}
                      className="flex items-center gap-3 rounded-xl p-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Mail className="size-4 flex-shrink-0 text-[#FF6B35]" />
                      <span className="truncate">
                        {school.admission_email ?? school.email}
                      </span>
                    </Link>
                  )}

                  {school.website && (
                    <Link
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl p-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Globe className="size-4 flex-shrink-0 text-[#FF6B35]" />
                      <span className="truncate">Visit Website</span>
                      <ExternalLink className="ml-auto size-3.5 flex-shrink-0 text-gray-400" />
                    </Link>
                  )}

                  {school.whatsapp && (
                    <Link
                      href={`https://wa.me/${school.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl p-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Phone className="size-4 flex-shrink-0 text-green-600" />
                      <span>WhatsApp</span>
                      <ExternalLink className="ml-auto size-3.5 flex-shrink-0 text-gray-400" />
                    </Link>
                  )}
                </div>

                {school.khda_inspection_url && (
                  <Link
                    href={school.khda_inspection_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5"
                    >
                      <FileText className="size-3.5" />
                      KHDA Inspection Page
                    </Button>
                  </Link>
                )}
              </div>

              {/* ----------------------------------------------------------
                  Enquiry Form
                  ---------------------------------------------------------- */}
              <div
                id="enquire"
                className="relative overflow-hidden rounded-2xl"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* Purple gradient top stripe */}
                <div
                  className="absolute inset-x-0 top-0 h-1 z-10"
                  style={{
                    background: "linear-gradient(90deg, #6B21A8, #A855F7)",
                  }}
                />
                <EnquiryForm school={{ id: school.id, name: school.name }} />
              </div>

              {/* ----------------------------------------------------------
                  Similar Schools
                  ---------------------------------------------------------- */}
              <SimilarSchools slug={slug} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function QuickFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-2xl bg-gradient-to-br from-gray-50 to-white p-4 transition-all hover:shadow-md"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex-shrink-0 rounded-lg bg-white p-2 shadow-sm">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="truncate text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
