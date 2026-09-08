import "@/index.css";
import { Providers } from "@/app/providers";
import Script from "next/script";

export const metadata = {
  title: "24mobiles - Smartphone Reviews & Specs",
  description: "Your ultimate destination for unbiased smartphone reviews, detailed specifications, and expert buying guides.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.24mobiles.com'),
  openGraph: {
    title: "24mobiles - Smartphone Reviews & Specs",
    description: "Your ultimate destination for unbiased smartphone reviews, detailed specifications, and expert buying guides.",
    url: "/",
    siteName: "24mobiles",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "24mobiles - Smartphone Reviews & Specs",
    description: "Your ultimate destination for unbiased smartphone reviews, detailed specifications, and expert buying guides.",
  },
};

export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense Script */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-XXXXXXXXXXXXX'}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
