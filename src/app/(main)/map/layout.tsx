import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Map — Explore Dubai Schools by Location | mydscvr.ai",
  description:
    "Browse Dubai schools on an interactive map. Find schools near you by area, curriculum, and rating.",
  alternates: {
    canonical: "/map",
  },
  openGraph: {
    title: "School Map — Explore Dubai Schools by Location | mydscvr.ai",
    description:
      "Browse Dubai schools on an interactive map. Find schools near you by area, curriculum, and rating.",
    url: "/map",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "School Map — Explore Dubai Schools by Location | mydscvr.ai",
    description:
      "Browse Dubai schools on an interactive map. Find schools near you by area, curriculum, and rating.",
    images: ["/og-default.png"],
  },
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
