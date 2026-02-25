"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Menu, Bell } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import ChatWidget from "@/components/ChatWidget";

const NAV_LINKS = [
  { href: "/schools", label: "Schools" },
  { href: "/nurseries", label: "Nurseries" },
  { href: "/compare", label: "Compare" },
  { href: "/map", label: "Map" },
] as const;

const AUTH_NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/saved", label: "Saved" },
] as const;

function Header() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (v) => setIsScrolled(v > 20));
  }, [scrollY]);

  const headerBg = isScrolled
    ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200/50"
    : "bg-transparent border-b border-transparent";

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-all duration-300 ${headerBg}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logos/Logo-Final-noBG.png"
            alt="mydscvr.ai"
            width={40}
            height={40}
            className="size-10"
          />
          <span className="text-xl font-bold tracking-tight text-gradient-brand">
            mydscvr.ai
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
              >
                <span
                  className={
                    isActive
                      ? "text-[#FF6B35]"
                      : "text-gray-600 hover:text-gray-900"
                  }
                >
                  {label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute inset-x-1 -bottom-[1px] h-0.5 rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #FF6B35, #FBBF24)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth nav + mobile menu */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="redirect">
              <button
                type="button"
                className="rounded-full px-5 py-2 text-sm font-semibold text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100"
              >
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="redirect">
              <button
                type="button"
                className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 btn-glow"
                style={{
                  background:
                    "linear-gradient(135deg, #FF6B35, #F59E0B)",
                }}
              >
                Register
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <nav className="hidden items-center gap-1 md:flex">
              {AUTH_NAV_LINKS.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                  >
                    <span
                      className={
                        isActive
                          ? "text-[#FF6B35]"
                          : "text-gray-600 hover:text-gray-900"
                      }
                    >
                      {label}
                    </span>
                  </Link>
                );
              })}
            </nav>
            <NotificationBell />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </SignedIn>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex h-full flex-col">
                {/* Mobile nav header */}
                <div className="flex items-center gap-2.5 border-b px-6 py-5">
                  <Image
                    src="/logos/Logo-Final-noBG.png"
                    alt="mydscvr.ai"
                    width={36}
                    height={36}
                    className="size-9"
                  />
                  <span className="text-lg font-bold text-gradient-brand">
                    mydscvr.ai
                  </span>
                </div>

                {/* Mobile nav links */}
                <nav className="flex-1 px-4 py-4">
                  <div className="space-y-1">
                    {NAV_LINKS.map(({ href, label }) => {
                      const isActive = pathname.startsWith(href);
                      return (
                        <Link
                          key={href}
                          href={href}
                          className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-[#FF6B35]/10 text-[#FF6B35]"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {label}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Authenticated mobile links */}
                  <SignedIn>
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Your Account
                      </p>
                      <div className="space-y-1">
                        {AUTH_NAV_LINKS.map(({ href, label }) => {
                          const isActive = pathname === href;
                          return (
                            <Link
                              key={href}
                              href={href}
                              className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                                isActive
                                  ? "bg-[#FF6B35]/10 text-[#FF6B35]"
                                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              {label}
                            </Link>
                          );
                        })}
                        <Link
                          href="/profile"
                          className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                            pathname === "/profile"
                              ? "bg-[#FF6B35]/10 text-[#FF6B35]"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          Profile & Preferences
                        </Link>
                      </div>
                    </div>
                  </SignedIn>
                </nav>

                {/* Mobile CTA */}
                <div className="border-t px-6 py-5">
                  <SignedOut>
                    <div className="flex flex-col gap-3">
                      <SignUpButton mode="redirect">
                        <button
                          type="button"
                          className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white btn-glow"
                          style={{
                            background:
                              "linear-gradient(135deg, #FF6B35, #F59E0B)",
                          }}
                        >
                          Register
                        </button>
                      </SignUpButton>
                      <SignInButton mode="redirect">
                        <button
                          type="button"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          Sign In
                        </button>
                      </SignInButton>
                    </div>
                  </SignedOut>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}

function NotificationBell() {
  const { isSignedIn } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isSignedIn) return;

    async function fetchCount() {
      try {
        const res = await fetch("/api/user/notifications");
        if (!res.ok) return;
        const data = await res.json();
        setUnreadCount(data.unread_count ?? 0);
      } catch {
        // Silently fail — bell just won't show a count
      }
    }

    fetchCount();
  }, [isSignedIn]);

  return (
    <Link
      href="/dashboard"
      className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
      title="Notifications"
    >
      <Bell className="size-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#FF6B35] text-[9px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

function Footer() {
  return (
    <footer
      className="relative overflow-hidden text-white"
      style={{ background: "var(--gradient-section-dark)" }}
    >
      {/* Decorative blur orb */}
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[#FF6B35]/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logos/Logo-Final-noBG.png"
                alt="mydscvr.ai"
                width={40}
                height={40}
                className="size-10"
              />
              <span className="text-xl font-bold text-gradient-brand">
                mydscvr.ai
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              AI-powered school and nursery discovery for Dubai families.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Explore
            </h4>
            <div className="space-y-2.5">
              <Link
                href="/schools"
                className="block text-sm text-gray-300 transition-colors hover:text-white"
              >
                Schools
              </Link>
              <Link
                href="/nurseries"
                className="block text-sm text-gray-300 transition-colors hover:text-white"
              >
                Nurseries
              </Link>
              <Link
                href="/map"
                className="block text-sm text-gray-300 transition-colors hover:text-white"
              >
                Map View
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Resources
            </h4>
            <div className="space-y-2.5">
              <Link
                href="/compare"
                className="block text-sm text-gray-300 transition-colors hover:text-white"
              >
                Compare Schools
              </Link>
              <Link
                href="/saved"
                className="block text-sm text-gray-300 transition-colors hover:text-white"
              >
                Saved Schools
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Company
            </h4>
            <div className="space-y-2.5">
              <span className="block text-sm text-gray-300">
                About
              </span>
              <span className="block text-sm text-gray-300">
                Contact
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="section-divider my-8" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} mydscvr.ai &mdash; All rights
            reserved.
          </p>
          <p className="text-xs text-gray-500">
            Made with AI for Dubai families
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
