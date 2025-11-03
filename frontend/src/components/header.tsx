"use client";

import Link from "next/link";
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, BookOpen, Clock, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      href: "/search",
      label: "Search Papers",
      icon: <Search className="h-5 w-5" />,
    },
    {
      href: "/review",
      label: "Generate Review",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      href: "/history",
      label: "History",
      icon: <Clock className="h-5 w-5" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-2">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-foreground hover:text-primary transition-colors duration-200">
                LitXplore
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {isLoaded && isSignedIn &&
              navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-lg text-foreground/70 transition-all duration-200 hover:text-primary-foreground hover:bg-accent",
                    pathname === item.href &&
                      "text-primary-foreground bg-accent"
                  )}
                  title={item.label}
                >
                  {item.icon}
                </Link>
              ))}

            {!isLoaded ? (
              <div className="h-9 w-9 ml-2 rounded-full bg-muted animate-pulse" />
            ) : isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-9 w-9 ml-2",
                  },
                }}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="gradient" size="sm">
                    Get Started
                  </Button>
                </SignUpButton>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="flex md:hidden items-center justify-center h-10 w-10 rounded-lg text-foreground/70 hover:text-primary hover:bg-accent transition-all duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <div className="relative w-5 h-5">
              <X
                className={cn(
                  "absolute inset-0 h-5 w-5 transition-all duration-200",
                  mobileMenuOpen
                    ? "opacity-100 rotate-0"
                    : "opacity-0 rotate-90"
                )}
              />
              <Menu
                className={cn(
                  "absolute inset-0 h-5 w-5 transition-all duration-200",
                  mobileMenuOpen
                    ? "opacity-0 -rotate-90"
                    : "opacity-100 rotate-0"
                )}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "md:hidden fixed inset-x-0 top-[3.5rem] bg-background/95 backdrop-blur-md transition-all duration-200 ease-in-out",
          mobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-2 opacity-0 pointer-events-none"
        )}
      >
        <div className="container mx-auto px-4 py-3">
          {!isLoaded ? (
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent border border-border">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="flex flex-col space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ) : isSignedIn ? (
            <div className="flex flex-col space-y-4">
              {/* User Profile Section */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent border border-border">
                <div className="flex items-center space-x-3">
                  <UserButton
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "h-10 w-10",
                        userButtonTrigger:
                          "hover:opacity-80 transition-opacity",
                      },
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      Your Account
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Manage your profile
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:text-primary transition-all duration-200 border-b border-border last:border-none",
                      pathname === item.href && "text-primary bg-accent"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 py-2">
              <SignInButton mode="modal">
                <Button variant="outline" className="w-full justify-start">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="gradient" className="w-full justify-start">
                  Get Started
                </Button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
