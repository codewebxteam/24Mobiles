import { Suspense } from "react";
import CategoryProducts from "@/views/category/CategoryProducts";
import ProductSkeleton from "@/components/product/ProductSkeleton";

export default function ProductsPage() {
    return (
        <Suspense fallback={<ProductSkeleton />}>
            <CategoryProducts />
        </Suspense>
    );
}
