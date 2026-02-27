import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dubai Schools — Browse & Compare Private Schools | mydscvr.ai",
  description:
    "Explore 235+ KHDA-rated private schools in Dubai. Filter by curriculum, fees, area, and ratings. AI-powered search helps you find the perfect school.",
  alternates: {
    canonical: "/schools",
  },
  openGraph: {
    title: "Dubai Schools — Browse & Compare Private Schools | mydscvr.ai",
    description:
      "Explore 235+ KHDA-rated private schools in Dubai. Filter by curriculum, fees, area, and ratings.",
    url: "/schools",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dubai Schools — Browse & Compare Private Schools | mydscvr.ai",
    description:
      "Explore 235+ KHDA-rated private schools in Dubai. Filter by curriculum, fees, area, and ratings.",
    images: ["/og-default.png"],
  },
};

export default function SchoolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
