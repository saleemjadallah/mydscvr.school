"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth, useUser } from "@clerk/nextjs";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Loader2,
  LogIn,
  Heart,
  Search,
  Send,
  GraduationCap,
  ArrowRight,
  Clock,
  CheckCircle2,
  Mail,
  Settings,
  Sparkles,
  MapPin,
  Bell,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resolveHeroPhoto } from "@/lib/school-utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardEnquiry {
  id: string;
  status: string;
  created_at: string;
  child_grade: string | null;
  message: string | null;
  school_name: string;
  school_slug: string;
  school_area: string | null;
  khda_rating: string | null;
  google_photos: string[] | null;
  hero_photo_url?: string | null;
  days_waiting?: number;
}

interface RecentSearch {
  query: string;
  query_type: string | null;
  results_count: number | null;
  created_at: string;
}

interface EnquiryStatsData {
  total: number;
  by_status: Record<string, number>;
  response_rate: number;
  pending_count: number;
}

interface ActivityData {
  saved_count: number;
  enquiries: DashboardEnquiry[];
  recent_searches: RecentSearch[];
  enquiry_stats?: EnquiryStatsData;
  unread_notification_count?: number;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <SignedOut>
          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#FF6B35]/10">
              <LogIn className="size-10 text-[#FF6B35]" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Sign in to your dashboard
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base text-gray-500">
              Track your enquiries, saved schools, and search history all in one
              place.
            </p>
            <div className="mt-8">
              <SignInButton mode="redirect">
                <Button className="bg-[#FF6B35] px-8 py-3 text-base text-white hover:bg-[#e55a2a]">
                  <LogIn className="mr-2 size-5" />
                  Sign In
                </Button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <DashboardContent />
        </SignedIn>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard content (authenticated)
// ---------------------------------------------------------------------------

function DashboardContent() {
  const { isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [enquiryFilter, setEnquiryFilter] = useState<"all" | "pending">("all");

  useEffect(() => {
    if (!isSignedIn) return;

    async function fetchActivity() {
      try {
        const res = await fetch("/api/user/activity");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setActivity(data);
      } catch {
        setActivity({
          saved_count: 0,
          enquiries: [],
          recent_searches: [],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [isSignedIn]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[#FF6B35]" />
        <p className="mt-3 text-sm text-gray-500">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  const firstName = clerkUser?.firstName || "there";
  const stats = activity?.enquiry_stats;
  const unreadCount = activity?.unread_notification_count ?? 0;

  const filteredEnquiries =
    enquiryFilter === "pending"
      ? activity?.enquiries.filter(
          (e) => e.status === "new" || e.status === "sent_to_school"
        ) ?? []
      : activity?.enquiries ?? [];

  return (
    <>
      {/* Header with notification bell */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s your school search activity at a glance.
          </p>
        </div>
        <Link
          href="/profile?tab=notifications"
          className="relative rounded-xl border bg-white p-2.5 shadow-sm transition-all hover:shadow-md"
          title="Notifications"
        >
          <Bell className="size-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-[#FF6B35] text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>

      {/* ---- Enquiry Stats Row ---- */}
      {stats && stats.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 grid gap-4 sm:grid-cols-3"
        >
          <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50">
              <TrendingUp className="size-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {Math.round(stats.response_rate * 100)}%
              </p>
              <p className="text-xs text-gray-500">Response Rate</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50">
              <Send className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Enquiries</p>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 rounded-xl border p-4 shadow-sm ${
              stats.pending_count > 0
                ? "border-amber-200 bg-amber-50"
                : "bg-white"
            }`}
          >
            <div
              className={`flex size-10 items-center justify-center rounded-lg ${
                stats.pending_count > 0 ? "bg-amber-100" : "bg-gray-50"
              }`}
            >
              <AlertTriangle
                className={`size-5 ${
                  stats.pending_count > 0 ? "text-amber-600" : "text-gray-400"
                }`}
              />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">
                {stats.pending_count}
              </p>
              <p className="text-xs text-gray-500">Awaiting Response</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ---- Stats Cards ---- */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Heart className="size-5 text-rose-500" />}
          label="Saved Schools"
          value={activity?.saved_count ?? 0}
          href="/saved"
          bgColor="bg-rose-50"
          delay={0}
        />
        <StatCard
          icon={<Send className="size-5 text-blue-500" />}
          label="Enquiries Sent"
          value={activity?.enquiries.length ?? 0}
          bgColor="bg-blue-50"
          delay={0.05}
        />
        <StatCard
          icon={<Search className="size-5 text-purple-500" />}
          label="Recent Searches"
          value={activity?.recent_searches.length ?? 0}
          href="/schools"
          bgColor="bg-purple-50"
          delay={0.1}
        />
      </div>

      {/* ---- Quick Actions ---- */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8 grid gap-3 sm:grid-cols-4"
      >
        <QuickAction
          href="/schools"
          icon={<GraduationCap className="size-5" />}
          label="Browse Schools"
        />
        <QuickAction
          href="/compare"
          icon={<Sparkles className="size-5" />}
          label="Compare Schools"
        />
        <QuickAction
          href="/saved"
          icon={<Heart className="size-5" />}
          label="Saved Schools"
        />
        <QuickAction
          href="/profile"
          icon={<Settings className="size-5" />}
          label="Edit Preferences"
        />
      </motion.div>

      {/* ---- Enquiries ---- */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Enquiries
          </h2>
          <div className="flex items-center gap-2">
            {stats && stats.pending_count > 0 && (
              <div className="flex rounded-lg border border-gray-200 bg-white text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setEnquiryFilter("all")}
                  className={`rounded-l-lg px-3 py-1.5 transition-colors ${
                    enquiryFilter === "all"
                      ? "bg-[#FF6B35] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setEnquiryFilter("pending")}
                  className={`rounded-r-lg px-3 py-1.5 transition-colors ${
                    enquiryFilter === "pending"
                      ? "bg-amber-500 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Pending ({stats.pending_count})
                </button>
              </div>
            )}
            {(activity?.enquiries.length ?? 0) > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activity!.enquiries.length} total
              </Badge>
            )}
          </div>
        </div>

        {filteredEnquiries.length === 0 ? (
          <EmptyState
            icon={<Send className="size-8 text-gray-300" />}
            title={
              enquiryFilter === "pending"
                ? "No pending enquiries"
                : "No enquiries yet"
            }
            description={
              enquiryFilter === "pending"
                ? "All your enquiries have been responded to."
                : "When you enquire at a school, you'll see the status here."
            }
            actionLabel={
              enquiryFilter === "pending" ? "Show All" : "Browse Schools"
            }
            actionHref={enquiryFilter === "pending" ? undefined : "/schools"}
            onAction={
              enquiryFilter === "pending"
                ? () => setEnquiryFilter("all")
                : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredEnquiries.map((enquiry) => (
              <EnquiryCard key={enquiry.id} enquiry={enquiry} />
            ))}
          </div>
        )}
      </motion.section>

      {/* ---- Recent Searches ---- */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Searches
          </h2>
        </div>

        {activity?.recent_searches.length === 0 ? (
          <EmptyState
            icon={<Search className="size-8 text-gray-300" />}
            title="No searches yet"
            description="Try our AI-powered search to find the perfect school."
            actionLabel="Search Schools"
            actionHref="/schools"
          />
        ) : (
          <div className="rounded-2xl border bg-white shadow-sm">
            {activity!.recent_searches.map((search, i) => (
              <Link
                key={`${search.query}-${i}`}
                href={`/schools?q=${encodeURIComponent(search.query)}`}
                className={`flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50 ${
                  i < activity!.recent_searches.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Search className="size-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {search.query}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {search.results_count !== null && (
                    <span className="text-xs text-gray-400">
                      {search.results_count} results
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {formatRelativeTime(search.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  href,
  bgColor,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href?: string;
  bgColor: string;
  delay: number;
}) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className={`flex size-12 items-center justify-center rounded-xl ${bgColor}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-[#FF6B35]/30 hover:shadow-md"
    >
      <span className="text-[#FF6B35]">{icon}</span>
      {label}
      <ArrowRight className="ml-auto size-4 text-gray-300" />
    </Link>
  );
}

function EnquiryCard({ enquiry }: { enquiry: DashboardEnquiry }) {
  const heroPhoto = resolveHeroPhoto(undefined, enquiry.google_photos, enquiry.hero_photo_url);
  const isPending =
    (enquiry.status === "new" || enquiry.status === "sent_to_school") &&
    (enquiry.days_waiting ?? 0) >= 7;

  return (
    <Link href={`/schools/${enquiry.school_slug}`}>
      <div
        className={`flex items-center gap-4 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
          isPending
            ? "border-amber-200 bg-amber-50/50"
            : "border-gray-200 bg-white"
        }`}
      >
        {/* School image */}
        <div className="relative size-14 flex-shrink-0 overflow-hidden rounded-lg">
          {heroPhoto ? (
            <Image
              src={heroPhoto}
              alt={enquiry.school_name}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,107,53,0.12), rgba(245,158,11,0.12))",
              }}
            >
              <GraduationCap className="size-5 text-[#FF6B35]/70" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {enquiry.school_name}
          </h3>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
            {enquiry.school_area && (
              <span className="flex items-center gap-0.5">
                <MapPin className="size-3" />
                {enquiry.school_area}
              </span>
            )}
            {enquiry.child_grade && <span>{enquiry.child_grade}</span>}
          </div>
          {isPending && (
            <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
              <Clock className="size-3" />
              {enquiry.days_waiting}d waiting — no response yet
            </p>
          )}
        </div>

        {/* Status + date */}
        <div className="flex flex-col items-end gap-1">
          <EnquiryStatusBadge status={enquiry.status} />
          <span className="text-xs text-gray-400">
            {formatRelativeTime(enquiry.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function EnquiryStatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    new: {
      label: "Sent",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <Mail className="size-3" />,
    },
    sent_to_school: {
      label: "Delivered",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <CheckCircle2 className="size-3" />,
    },
    responded: {
      label: "Responded",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle2 className="size-3" />,
    },
    enrolled: {
      label: "Enrolled",
      className: "bg-emerald-100 text-emerald-800 border-emerald-300",
      icon: <GraduationCap className="size-3" />,
    },
    rejected: {
      label: "Closed",
      className: "bg-gray-50 text-gray-500 border-gray-200",
      icon: <Clock className="size-3" />,
    },
  };

  const c = config[status] ?? config.new;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${c.className}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-gray-50">
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-xs text-xs text-gray-500">
        {description}
      </p>
      <div className="mt-5">
        {actionHref ? (
          <Link href={actionHref}>
            <Button
              variant="outline"
              size="sm"
              className="text-[#FF6B35] border-[#FF6B35]/30 hover:bg-[#FF6B35]/5"
            >
              {actionLabel}
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </Link>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onAction}
            className="text-[#FF6B35] border-[#FF6B35]/30 hover:bg-[#FF6B35]/5"
          >
            {actionLabel}
            <ArrowRight className="ml-1.5 size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
