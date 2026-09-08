import { Suspense } from "react";
import Compare from "@/views/Compare";

export default function ComparePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading Comparison...</div>}>
            <Compare />
        </Suspense>
    );
}
