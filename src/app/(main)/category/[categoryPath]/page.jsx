"use client";
import { Suspense } from "react";
import Component from "@/views/category/CategoryProducts";
import ProductSkeleton from "@/components/product/ProductSkeleton";

export default function Page(props) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <Component {...props} />
    </Suspense>
  );
}
