import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
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
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "mydscvr.ai — Dubai School & Nursery Finder",
    description:
      "Find, compare, and explore the best schools and nurseries in Dubai with AI-powered search and recommendations.",
    url: "/",
    siteName: "mydscvr.ai",
    locale: "en_AE",
    type: "website",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "mydscvr.ai — Dubai School & Nursery Finder" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "mydscvr.ai — Dubai School & Nursery Finder",
    description:
      "Find, compare, and explore the best schools and nurseries in Dubai with AI-powered search and recommendations.",
    images: ["/og-default.png"],
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
        <head>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-N27HT6KT');`}
          </Script>
          <Script
            src="https://tools.luckyorange.com/core/lo.js?site-id=fe966133"
            strategy="afterInteractive"
          />
          {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
            <Script id="meta-pixel" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
fbq('track', 'PageView');`}
            </Script>
          )}
        </head>
        <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
          {/* Organization structured data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "mydscvr.ai",
                url: "https://mydscvr.ai",
                logo: "https://mydscvr.ai/logos/Logo-Final-noBG.png",
                description:
                  "AI-powered Dubai school and nursery finder. Compare KHDA-rated schools by fees, curriculum, and location.",
                sameAs: [],
              }),
            }}
          />
          {/* WebSite + SearchAction structured data (Sitelinks search box) */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "mydscvr.ai",
                url: "https://mydscvr.ai",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate:
                      "https://mydscvr.ai/schools?q={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              }),
            }}
          />
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-N27HT6KT"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
            {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            )}
          </noscript>
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
