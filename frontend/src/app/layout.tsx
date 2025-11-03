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
              colorBackground: "#09090b",
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
