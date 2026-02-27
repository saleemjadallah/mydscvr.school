import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dubai Nurseries — Find the Best Early Years Education | mydscvr.ai",
  description:
    "Discover top-rated nurseries and early learning centres in Dubai. Compare fees, curricula, and facilities to find the ideal nursery for your child.",
  alternates: {
    canonical: "/nurseries",
  },
  openGraph: {
    title: "Dubai Nurseries — Find the Best Early Years Education | mydscvr.ai",
    description:
      "Discover top-rated nurseries and early learning centres in Dubai. Compare fees, curricula, and facilities.",
    url: "/nurseries",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dubai Nurseries — Find the Best Early Years Education | mydscvr.ai",
    description:
      "Discover top-rated nurseries and early learning centres in Dubai. Compare fees, curricula, and facilities.",
    images: ["/og-default.png"],
  },
};

export default function NurseriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
