"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function SignUpComponent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: {
            backgroundColor: "#191a1a",
            color: "#e0e0e0",
          },
          navbar: {
            backgroundColor: "#191a1a",
            color: "#e0e0e0",
          },
          navbarButton: {
            color: "#e0e0e0",
          },
          headerTitle: {
            color: "#e0e0e0",
          },
          headerSubtitle: {
            color: "#a0a0a0",
          },
          formFieldLabel: {
            color: "#e0e0e0",
          },
          formFieldInput: {
            backgroundColor: "#282a2e",
            color: "#e0e0e0",
          },
          formButtonPrimary: {
            backgroundColor: "#f59e0b",
            color: "#1a1a1a",
          },
          socialButtonsBlockButton: {
            backgroundColor: "#282a2e",
            color: "#e0e0e0",
          },
          dividerLine: {
            borderColor: "#3a3f44",
          },
          dividerText: {
            color: "#a0a0a0",
          },
          footer: {
            backgroundColor: "#191a1a",
            color: "#e0e0e0",
          },
          footerActionLink: {
            color: "#f59e0b",
          },
        },
      }}
      redirectUrl={redirectUrl}
    />
  );
}
