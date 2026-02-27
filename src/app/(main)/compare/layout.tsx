import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Schools Side-by-Side | mydscvr.ai",
  description:
    "Compare Dubai schools side-by-side on fees, KHDA ratings, curricula, facilities, and more. AI-powered insights highlight key differences.",
  alternates: {
    canonical: "/compare",
  },
  openGraph: {
    title: "Compare Schools Side-by-Side | mydscvr.ai",
    description:
      "Compare Dubai schools side-by-side on fees, KHDA ratings, curricula, facilities, and more.",
    url: "/compare",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Schools Side-by-Side | mydscvr.ai",
    description:
      "Compare Dubai schools side-by-side on fees, KHDA ratings, curricula, facilities, and more.",
    images: ["/og-default.png"],
  },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
