import Component from "@/components/product/ProductDetail";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import Script from "next/script";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const title = `${data.name} Price, Specs & Reviews | 24mobiles`;
      const description = data.description || `Explore ${data.name} full specifications, price, features, and expert reviews.`;
      const imageUrl = data.thumbnail || (data.images && data.images[0]) || "";

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: imageUrl ? [imageUrl] : [],
        },
      };
    }
  } catch (error) {
    console.error("Error fetching metadata:", error);
  }

  return {
    title: "Product Not Found | 24mobiles",
    description: "The requested smartphone could not be found.",
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  
  // Fetch data for structured data
  let productData = null;
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      productData = docSnap.data();
    }
  } catch (e) {
    console.error("Error fetching product for schema:", e);
  }

  const jsonLd = productData ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productData.name,
    "image": productData.thumbnail || (productData.images && productData.images[0]) || "",
    "description": productData.description,
    "brand": {
      "@type": "Brand",
      "name": productData.brand || "Smartphone"
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL}/product/${id}`,
      "priceCurrency": "INR",
      "price": productData.price || 0,
      "availability": "https://schema.org/InStock"
    }
  } : null;

  return (
    <>
      {jsonLd && (
        <Script
          id={`product-schema-${id}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Component />
    </>
  );
}
