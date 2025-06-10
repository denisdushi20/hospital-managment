// app/redirect/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log("RedirectPage - Session Status:", status);
    console.log("RedirectPage - Session Data:", session);

    // 1. If still loading, do nothing and wait for status to change
    if (status === "loading") {
      return;
    }

    // 2. If unauthenticated, always redirect to login (this handles cases where auth fails or expires)
    if (status === "unauthenticated") {
      router.replace("/login"); // Use replace to prevent back button from going back to /redirect
      return; // Exit early
    }

    // 3. If authenticated, now we can safely access session.user.role
    if (status === "authenticated") {
      const role = session?.user?.role; // role will now be correctly assigned from the loaded session

      console.log("RedirectPage - Authenticated User Role:", role);

      if (!role) {
        // Fallback for unexpected missing role, redirect to login or a generic page
        console.warn(
          "Authenticated user found, but role is undefined. Redirecting to /login."
        );
        router.replace("/login");
      } else if (role === "admin") {
        router.replace("/admin/dashboard");
      } else if (role === "doctor") {
        router.replace("/doctor/dashboard");
      } else if (role === "patient") {
        router.replace("/patient/dashboard");
      } else {
        // Fallback for an unknown role
        router.replace("/");
      }
    }
  }, [session, status, router]); // Dependencies: re-run when session, status, or router changes

  return <p className="text-center mt-20">Redirecting...</p>;
}
