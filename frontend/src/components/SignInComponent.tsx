"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignInComponent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "bg-white",
        },
      }}
      fallbackRedirectUrl={redirectUrl}
      forceRedirectUrl={searchParams.get("force_redirect") || undefined}
    />
  );
}
