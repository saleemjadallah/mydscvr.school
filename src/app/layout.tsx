import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "mydscvr.ai — Dubai School & Nursery Finder",
  description:
    "Find, compare, and explore the best schools and nurseries in Dubai with AI-powered search and recommendations.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://mydscvr.ai"
  ),
  openGraph: {
    title: "mydscvr.ai — Dubai School & Nursery Finder",
    description:
      "Find, compare, and explore the best schools and nurseries in Dubai with AI-powered search and recommendations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
          <Providers>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: "8px",
                  background: "#1f2937",
                  color: "#f9fafb",
                },
                success: {
                  iconTheme: {
                    primary: "#FF6B35",
                    secondary: "#fff",
                  },
                },
              }}
            />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
