import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { QueryProvider } from "@/lib/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "LitXplore - Literature Review Generator",
  description: "Generate academic literature reviews using AI",
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "any" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-icon.png" }],
    other: [
      { url: "/icons/icon.png", type: "image/png", sizes: "32x32" },
      {
        url: "/icons/web-app-manifest-192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/icons/web-app-manifest-512x512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
  },
  manifest: "/icons/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(dmSans.className, "h-screen flex flex-col antialiased overflow-hidden")}>
        <ClerkProvider
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: "#f59e0b",
              colorBackground: "hsl(180, 2%, 10%)",
              colorInputText: "#ffffff",
              colorText: "#ffffff",
            },
            elements: {
              card: {
                backgroundColor: "hsl(180, 2%, 10%)",
                color: "#e0e0e0",
              },
              navbar: {
                backgroundColor: "hsl(180, 2%, 10%)",
                color: "#e0e0e0",
              },
              navbarButton: {
                color: "#e0e0e0",
              },
              navbarButtonText: {
                color: "#e0e0e0",
              },
              navbarButtonActive: {
                color: "#f59e0b",
              },
              navbarButtonHover: {
                color: "#f59e0b",
              },
              formButtonPrimary: {
                backgroundColor: "#f59e0b",
                color: "#1a1a1a",
              },
              footer: {
                backgroundColor: "hsl(180, 2%, 10%)",
                color: "#e0e0e0",
              },
              headerTitle: {
                color: "#e0e0e0",
              },
              headerSubtitle: {
                color: "#a0a0a0",
              },
              socialButtonsBlockButton: {
                backgroundColor: "#282a2e",
                color: "#e0e0e0",
              },
              formFieldLabel: {
                color: "#e0e0e0",
              },
              formFieldInput: {
                backgroundColor: "#282a2e",
                color: "#e0e0e0",
              },
              dividerLine: {
                borderColor: "#3a3f44",
              },
              dividerText: {
                color: "#a0a0a0",
              },
              identityPreview: {
                color: "#e0e0e0",
              },
              identityPreviewText: {
                color: "#e0e0e0",
              },
              identityPreviewTextSecondary: {
                color: "#a0a0a0",
              },
              userButtonPopoverActions: {
                backgroundColor: "hsl(180, 2%, 10%)",
              },
              userButtonPopoverActionButton: {
                color: "#e0e0e0",
              },
              userButtonPopoverActionButtonText: {
                color: "#e0e0e0",
              },
              userButtonPopoverActionButtonIcon: {
                color: "#e0e0e0",
              },
              userButtonPopoverActionButtonHover: {
                backgroundColor: "#282a2e",
                color: "#f59e0b",
              },
              // User Profile modal styles - matching homepage background
              modal: {
                backgroundColor: "hsl(180, 2%, 10%)",
                color: "#e0e0e0",
              },
              modalContent: {
                backgroundColor: "hsl(180, 2%, 10%)",
              },
              modalBackdrop: {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
              },
              userProfileRootBox: {
                backgroundColor: "hsl(180, 2%, 10%)",
              },
              userProfileNavbar: {
                backgroundColor: "hsl(180, 2%, 10%)",
                color: "#e0e0e0",
              },
              userProfilePageScrollBox: {
                backgroundColor: "hsl(180, 2%, 10%)",
                color: "#e0e0e0",
              },
              cardBox: {
                backgroundColor: "hsl(180, 2%, 10%)",
              },
              scrollBox: {
                backgroundColor: "hsl(180, 2%, 10%)",
              },
              userProfileSectionTitle: {
                color: "#e0e0e0",
              },
              userProfileSectionSubtitle: {
                color: "#a0a0a0",
              },
              userProfileForm: {
                color: "#e0e0e0",
              },
              userProfileButton: {
                backgroundColor: "#282a2e",
                color: "#e0e0e0",
              },
              userProfileButtonHover: {
                backgroundColor: "#3a3f44",
                color: "#f59e0b",
              },
              userProfileInput: {
                backgroundColor: "#282a2e",
                color: "#e0e0e0",
              },
              userProfileLabel: {
                color: "#e0e0e0",
              },
              userProfileLink: {
                color: "#f59e0b",
              },
              userProfileLinkHover: {
                color: "#fbbf24",
              },
              userProfileDivider: {
                borderColor: "#3a3f44",
              },
              userProfileBadge: {
                backgroundColor: "#282a2e",
                color: "#a0a0a0",
              },
              userProfileConnectedAccount: {
                backgroundColor: "#282a2e",
                color: "#e0e0e0",
              },
              userProfileConnectedAccountText: {
                color: "#e0e0e0",
              },
            },
          }}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <QueryProvider>
              <main className="flex-1 overflow-auto">{children}</main>
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
