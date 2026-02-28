export interface LandingPageConfig {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  pageType:
    | "curriculum"
    | "area"
    | "curriculum_area"
    | "rating"
    | "fee"
    | "feature";

  filters: {
    emirate?: "dubai" | "abu_dhabi";
    type?: "school" | "nursery";
    curriculum?: string;
    rating?: string;
    area?: string;
    feeMax?: number;
    hasSen?: boolean;
  };

  introContent: string;
  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
}
