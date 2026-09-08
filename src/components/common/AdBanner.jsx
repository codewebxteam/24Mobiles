"use client";
import { useEffect, useRef } from "react";

export default function AdBanner({ 
  dataAdSlot = "demo-slot", 
  dataAdFormat = "auto", 
  dataFullWidthResponsive = true, 
  className = "" 
}) {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      // Check if ad has already been pushed to prevent duplicate pushes
      if (adRef.current && !adRef.current.hasAttribute('data-adsbygoogle-status')) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  // For development environment, show a placeholder if no AdSense ID is provided
  const isDev = process.env.NODE_ENV === "development" || !process.env.NEXT_PUBLIC_ADSENSE_ID;

  if (isDev) {
    return (
      <div className={`my-4 w-full h-[100px] bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm font-medium ${className}`}>
        [Advertisement Placeholder]
      </div>
    );
  }

  return (
    <div className={`my-4 w-full overflow-hidden ${className}`} aria-hidden="true">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
      />
    </div>
  );
}
