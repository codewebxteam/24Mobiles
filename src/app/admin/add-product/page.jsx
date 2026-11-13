"use client";
import { Suspense } from "react";
import Component from "@/views/admin/AdminAddProduct";

export default function Page(props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 animate-pulse" />}>
      <Component {...props} />
    </Suspense>
  );
}
