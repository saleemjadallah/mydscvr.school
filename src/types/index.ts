// ============================================
// SCHOOL TYPES
// ============================================
export interface School {
  id: string;
  slug: string;
  name: string;
  type: "school" | "nursery";

  // Location
  address: string | null;
  area: string | null;
  city: string;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string | null;

  // Identity
  curriculum: string[];
  phases: string[];
  gender: "boys" | "girls" | "mixed";
  religion: string;
  languages: string[];

  // KHDA
  khda_rating: KHDARating | null;
  khda_rating_year: number | null;
  khda_school_id: string | null;
  khda_center_id: string | null;
  khda_inspection_url: string | null;
  khda_report_path: string | null;

  // ADEK (Abu Dhabi)
  adek_rating: string | null;
  adek_rating_year: number | null;
  adek_school_id: string | null;
  national_identity_mark: string | null;

  // Multi-emirate
  emirate: string | null;    // 'dubai', 'abu_dhabi'
  regulator: string | null;  // 'khda', 'adek'

  // Fees
  fee_min: number | null;
  fee_max: number | null;
  fee_currency: string;
  fee_last_updated: string | null;

  // Capacity
  total_students: number | null;
  capacity: number | null;

  // Content
  description: string | null;

  // Contact
  website: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  admission_email: string | null;

  // Google
  google_rating: number | null;
  google_review_count: number | null;
  google_photos: string[] | null;

  // Features
  has_sen_support: boolean;
  has_transport: boolean;
  has_boarding: boolean;
  has_after_school: boolean;
  has_sports_facilities: boolean;
  has_swimming_pool: boolean;
  has_arts_program: boolean;
  is_accredited: boolean;

  // AI
  ai_summary: string | null;
  ai_strengths: string[] | null;
  ai_considerations: string[] | null;

  // SEO
  meta_title: string | null;
  meta_description: string | null;

  // Status
  is_active: boolean;
  is_claimed: boolean;
  is_featured: boolean;
  is_verified: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
  last_scraped_at: string | null;

  // Joined data (optional)
  khda_reports?: KHDAReport[];
  reviews?: Review[];
  fee_history?: FeeHistory[];
  photos?: SchoolPhoto[];
  hero_photo_url?: string | null;
  enquiry_count_30d?: number;
  semantic_score?: number;
}

// ============================================
// SCHOOL PHOTO (R2-hosted)
// ============================================
export interface SchoolPhoto {
  id: string;
  school_id: string;
  r2_url: string;
  photo_type: "hero" | "gallery";
  source: string;
  width: number | null;
  height: number | null;
  sort_order: number;
  alt_text: string | null;
  is_active: boolean;
}

export type KHDARating =
  | "Outstanding"
  | "Very Good"
  | "Good"
  | "Acceptable"
  | "Weak"
  | "Very Weak";

// ============================================
// KHDA REPORT
// ============================================
export interface KHDAReport {
  id: string;
  school_id: string;
  year: number;
  rating: string;
  report_url: string | null;
  report_path: string | null;
  raw_text: string | null;
  ai_summary: string | null;
  key_findings: Record<string, unknown> | null;
  created_at: string;
}

// ============================================
// FEE HISTORY
// ============================================
export interface FeeHistory {
  id: string;
  school_id: string;
  year: number;
  grade: string | null;
  fee_aed: number;
  source: string;
  scraped_at: string;
}

// ============================================
// REVIEW
// ============================================
export interface Review {
  id: string;
  school_id: string;
  source: "google" | "internal";
  rating: number | null;
  text: string | null;
  author: string | null;
  author_type: "parent" | "student" | "teacher" | null;
  language: string;
  is_verified: boolean;
  sentiment: "positive" | "neutral" | "negative" | null;
  ai_summary: string | null;
  helpful_count: number;
  published_at: string | null;
  created_at: string;
}

// ============================================
// ENQUIRY
// ============================================
export interface Enquiry {
  id: string;
  school_id: string;
  user_id: string | null;
  parent_name: string;
  parent_email: string;
  parent_phone: string | null;
  parent_whatsapp: string | null;
  nationality: string | null;
  current_area: string | null;
  child_name: string | null;
  child_dob: string | null;
  child_grade: string | null;
  child_year: number | null;
  message: string | null;
  preferred_start: string | null;
  siblings: boolean;
  source: "search" | "profile" | "compare" | "ai_chat" | null;
  search_query: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  status: "new" | "sent_to_school" | "responded" | "enrolled" | "rejected";
  sent_to_school_at: string | null;
  responded_at: string | null;
  is_billed: boolean;
  billed_at: string | null;
  billed_amount: number | null;
  created_at: string;
  school_name?: string;
}

// ============================================
// NOTIFICATION PREFERENCES
// ============================================
export interface UserNotificationPrefs {
  user_id: string;
  enquiry_no_response_days: number;
  email_enquiry_updates: boolean;
  email_school_news: boolean;
  email_weekly_digest: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// ENQUIRY NOTIFICATION
// ============================================
export interface EnquiryNotification {
  id: string;
  enquiry_id: string;
  user_id: string;
  type: "no_response_reminder";
  message: string | null;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
  // Joined fields
  school_name?: string;
  school_slug?: string;
}

// ============================================
// ENQUIRY STATS
// ============================================
export interface EnquiryStats {
  total: number;
  by_status: Record<string, number>;
  response_rate: number;
  avg_response_days: number | null;
  schools_enquired: number;
  pending_no_response: PendingEnquiry[];
}

export interface PendingEnquiry {
  enquiry_id: string;
  school_name: string;
  school_slug: string;
  days_waiting: number;
}

// ============================================
// USER
// ============================================
export interface User {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  phone: string | null;
  nationality: string | null;
  current_area: string | null;
  children_count: number | null;
  plan: "free" | "premium";
  preferred_curricula: string[] | null;
  preferred_areas: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// SEARCH
// ============================================
export interface SearchIntent {
  type: "school" | "nursery" | null;
  curriculum: string[] | null;
  areas: string[] | null;
  emirate: "dubai" | "abu_dhabi" | null;
  khda_rating: string | null;
  fee_max_aed: number | null;
  fee_min_aed: number | null;
  has_sen: boolean | null;
  gender: "mixed" | "boys" | "girls" | null;
  phases: string[] | null;
  features: string[] | null;
  location_query: string | null;
  near_me: boolean;
  summary: string;
}

export interface LocationContext {
  type: "geocoded" | "user_location";
  lat: number;
  lng: number;
  place_name?: string;
  radius_km?: number;
}

export interface SearchResponse {
  query: string;
  intent: SearchIntent;
  schools: School[];
  ai_explanation: string;
  total: number;
  webResults?: ExaArticle[];
  location_context?: LocationContext;
}

export interface SchoolListResponse {
  schools: School[];
  total: number;
  page: number;
  limit: number;
}

// ============================================
// API PARAMS
// ============================================
export interface SchoolFilters {
  type?: "school" | "nursery";
  area?: string;
  curriculum?: string;
  rating?: KHDARating;
  fee_min?: string;
  fee_max?: string;
  has_sen?: string;
  page?: string;
  limit?: string;
  sort?: "rating" | "fee_asc" | "fee_desc" | "reviews" | "distance";
}

// ============================================
// EXA / WEB INSIGHTS
// ============================================
export interface ExaArticle {
  url: string;
  title: string | null;
  publishedDate: string | null;
  author: string | null;
  highlights: string[] | null;
  summary: string | null;
  source: string; // derived from URL hostname
}

export interface SchoolNewsResponse {
  school: string;
  articles: ExaArticle[];
  fetchedAt: string;
}

export interface SchoolInsightsResponse {
  school: string;
  insights: ExaArticle[];
  fetchedAt: string;
}

// ============================================
// COMPARE
// ============================================

/** Lean school object for comparison views (~30 fields, not 70+) */
export interface CompareSchool {
  id: string;
  slug: string;
  name: string;
  type: "school" | "nursery";
  area: string | null;
  address: string | null;
  curriculum: string[];
  phases: string[];
  gender: "boys" | "girls" | "mixed";
  khda_rating: KHDARating | null;
  khda_rating_year: number | null;
  adek_rating: string | null;
  adek_rating_year: number | null;
  emirate: string | null;
  regulator: string | null;
  fee_min: number | null;
  fee_max: number | null;
  fee_currency: string;
  google_rating: number | null;
  google_review_count: number | null;
  google_photos: string[] | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  total_students: number | null;
  has_sen_support: boolean;
  has_transport: boolean;
  has_boarding: boolean;
  has_after_school: boolean;
  has_sports_facilities: boolean;
  has_swimming_pool: boolean;
  has_arts_program: boolean;
  ai_summary: string | null;
  ai_strengths: string[] | null;
  ai_considerations: string[] | null;
  description: string | null;
  photos?: SchoolPhoto[];
  hero_photo_url?: string | null;
}

export interface FeeHistoryEntry {
  school_id: string;
  year: number;
  grade: string | null;
  fee_aed: number;
  source: string;
}

export interface KHDAReportSummary {
  school_id: string;
  year: number;
  rating: string;
  ai_summary: string | null;
  key_findings: Record<string, unknown> | null;
}

export interface ReviewSummary {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  avg_rating: number | null;
}

export interface CompareResponse {
  schools: CompareSchool[];
  ai_comparison: string | null;
  fee_history: Record<string, FeeHistoryEntry[]>;
  khda_reports: Record<string, KHDAReportSummary[]>;
  review_summary: Record<string, ReviewSummary>;
}

// ============================================
// OUTBOUND CLICK TRACKING
// ============================================
export type ClickType = "website" | "phone" | "whatsapp" | "email" | "maps";

export interface OutboundClick {
  id: string;
  school_id: string;
  user_id: string | null;
  click_type: ClickType;
  destination: string;
  source_page: string | null;
  search_query: string | null;
  session_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  created_at: string;
}

export interface ClicksByType {
  click_type: ClickType;
  count: number;
}

export interface DailyClicks {
  date: string;
  count: number;
}

export interface TopSearchQuery {
  query: string;
  count: number;
}

export interface SchoolAnalyticsStats {
  total_clicks: number;
  unique_visitors: number;
  enquiry_count: number;
  by_type: ClicksByType[];
  by_day: DailyClicks[];
  top_search_queries: TopSearchQuery[];
  previous_period: {
    total_clicks: number;
    change_pct: number;
  };
}

// ============================================
// SCHOOL ADMIN
// ============================================

export type SchoolAdminRole = "owner" | "admin" | "staff";

export interface SchoolAdmin {
  id: string;
  school_id: string;
  clerk_user_id: string;
  email: string;
  name: string | null;
  role: SchoolAdminRole;
  invited_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// SUBSCRIPTIONS & BILLING
// ============================================

export type SubscriptionPlan = "free" | "starter" | "growth" | "elite" | "enterprise";
export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing";

export interface SchoolSubscription {
  id: string;
  school_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_cycle: "monthly" | "annual";
  monthly_price: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditLedger {
  id: string;
  school_id: string;
  subscription_id: string | null;
  period_start: string;
  period_end: string;
  credits_included: number;
  credits_used: number;
  overage_count: number;
  overage_rate: number;
  overage_total: number;
  disputes_auto_credited: number;
  created_at: string;
  updated_at: string;
}

export type BillingEventType =
  | "credit_used"
  | "overage_charged"
  | "credit_refunded"
  | "disputed"
  | "dispute_auto_credited"
  | "dispute_pending_review"
  | "duplicate_skipped"
  | "free_tier_charged";

export interface EnquiryBillingEvent {
  id: string;
  enquiry_id: string;
  school_id: string;
  ledger_id: string | null;
  event_type: BillingEventType;
  amount: number;
  credit_balance_after: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CreditStatus {
  credits_included: number;
  credits_used: number;
  credits_remaining: number;
  overage_count: number;
  overage_total: number;
  period_start: string;
  period_end: string;
  plan: SubscriptionPlan;
}

// ============================================
// SCHOOL ADMIN DASHBOARD
// ============================================

export interface SchoolAdminDashboard {
  profile_views_30d: number;
  profile_views_delta: number;
  enquiries_30d: number;
  enquiries_delta: number;
  credit_status: CreditStatus;
  plan: SubscriptionPlan;
  recent_enquiries: SchoolAdminEnquiry[];
  enquiry_trend: { date: string; count: number }[];
}

export interface SchoolAdminEnquiry {
  id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string | null;
  child_grade: string | null;
  message: string | null;
  source: string | null;
  status: string;
  is_billed: boolean;
  billed_amount: number | null;
  billing_event_type: BillingEventType | null;
  created_at: string;
  responded_at: string | null;
}

export interface SchoolAdminAnalytics {
  profile_views: { date: string; count: number }[];
  clicks_by_type: ClicksByType[];
  enquiry_funnel: {
    views: number;
    enquiries: number;
    responded: number;
    enrolled: number;
  };
  top_queries: TopSearchQuery[];
  period: string;
  previous_period: {
    profile_views: number;
    enquiries: number;
    views_delta: number;
    enquiries_delta: number;
  };
}
