"use client";
import { Suspense } from "react";
import Component from "@/views/auth/Login";

export default function Page(props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 animate-pulse" />}>
      <Component {...props} />
    </Suspense>
  );
}
