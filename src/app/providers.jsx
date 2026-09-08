"use client";

import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import ToastContainer from "@/components/common/ToastContainer";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <WishlistProvider>
        {children}
        <ToastContainer />
      </WishlistProvider>
    </AuthProvider>
  );
}
