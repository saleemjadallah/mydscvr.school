import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Education Insights for Dubai Families | mydscvr.ai",
  description:
    "Expert guides, tips, and insights to help you navigate Dubai's education landscape. From choosing the right curriculum to understanding KHDA ratings.",
  openGraph: {
    title: "Blog — Education Insights for Dubai Families | mydscvr.ai",
    description:
      "Expert guides, tips, and insights to help you navigate Dubai's education landscape.",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
