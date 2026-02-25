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
import { motion, useScroll, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Bell,
  GraduationCap,
  Baby,
  GitCompareArrows,
  MapPin,
  LayoutDashboard,
  Heart,
  UserCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import ChatWidget from "@/components/ChatWidget";

const NAV_LINKS = [
  { href: "/schools", label: "Schools", icon: GraduationCap, description: "Browse all schools" },
  { href: "/nurseries", label: "Nurseries", icon: Baby, description: "Early years education" },
  { href: "/compare", label: "Compare", icon: GitCompareArrows, description: "Side-by-side analysis" },
  { href: "/map", label: "Map", icon: MapPin, description: "Explore by location" },
] as const;

const AUTH_NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/saved", label: "Saved", icon: Heart },
] as const;

function Header() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (v) => setIsScrolled(v > 20));
  }, [scrollY]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        className="sticky top-0 z-50"
        initial={false}
      >
        {/* Background layer — separate for smooth transitions */}
        <div
          className="absolute inset-0 transition-all duration-500 ease-out"
          style={{
            background: isScrolled
              ? "rgba(255,255,255,0.85)"
              : "rgba(255,255,255,0.6)",
            backdropFilter: isScrolled ? "blur(20px) saturate(1.8)" : "blur(12px) saturate(1.4)",
            WebkitBackdropFilter: isScrolled ? "blur(20px) saturate(1.8)" : "blur(12px) saturate(1.4)",
            borderBottom: isScrolled
              ? "1px solid rgba(0,0,0,0.06)"
              : "1px solid rgba(0,0,0,0.03)",
            boxShadow: isScrolled
              ? "0 1px 3px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.03)"
              : "none",
          }}
        />

        <div className="relative mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          {/* Logo lockup */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <Image
                src="/logos/Logo-Final-noBG.png"
                alt="mydscvr.ai"
                width={44}
                height={44}
                className="size-11 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[22px] font-bold leading-none tracking-tight text-gradient-brand">
                mydscvr.ai
              </span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-gray-400 transition-colors group-hover:text-gray-500">
                School Finder
              </span>
            </div>
          </Link>

          {/* Desktop navigation — centered pill nav */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center md:flex">
            <div className="flex items-center gap-0.5 rounded-full bg-gray-950/[0.04] p-1 ring-1 ring-gray-950/[0.04]">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative rounded-full px-4 py-2 text-[13px] font-semibold transition-colors"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-black/[0.04]"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors duration-200 ${
                        isActive
                          ? "text-[#FF6B35]"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right side: auth + mobile toggle */}
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="redirect">
                <button
                  type="button"
                  className="hidden rounded-full px-4 py-2 text-[13px] font-semibold text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 sm:inline-flex"
                >
                  Sign in
                </button>
              </SignInButton>
              <div className="hidden flex-col items-center sm:flex">
                <SignUpButton mode="redirect">
                  <button
                    type="button"
                    className="group/cta relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition-all"
                    style={{
                      background: "linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%)",
                    }}
                  >
                    <span className="relative z-10">Get Started</span>
                    <ArrowRight className="relative z-10 size-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
                    {/* Hover shimmer */}
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/cta:opacity-100"
                      style={{
                        background: "linear-gradient(135deg, #FF8F5E 0%, #FBBF24 100%)",
                      }}
                    />
                  </button>
                </SignUpButton>
                <p className={`mt-1 text-[10px] leading-tight ${isScrolled ? "text-gray-400" : "text-white/40"}`}>
                  By signing up, you agree to our{" "}
                  <Link href="/terms" className="underline hover:text-[#FF6B35]">Terms</Link>
                  {" & "}
                  <Link href="/privacy" className="underline hover:text-[#FF6B35]">Privacy Policy</Link>
                </p>
              </div>
            </SignedOut>

            <SignedIn>
              <nav className="hidden items-center gap-0.5 md:flex">
                {AUTH_NAV_LINKS.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all ${
                        isActive
                          ? "bg-[#FF6B35]/10 text-[#FF6B35]"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="size-3.5" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mx-1 hidden h-5 w-px bg-gray-200 md:block" />
              <NotificationBell />
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 ring-2 ring-gray-100 ring-offset-1",
                  },
                }}
              />
            </SignedIn>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="relative inline-flex size-10 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-[22px]" strokeWidth={2} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ================================================================ */}
      {/* Mobile drawer — full custom overlay for premium feel              */}
      {/* ================================================================ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="fixed inset-y-0 right-0 z-[70] flex w-[300px] flex-col bg-white shadow-2xl"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-5">
                <Link
                  href="/"
                  className="flex items-center gap-2.5"
                  onClick={() => setMobileOpen(false)}
                >
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
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex size-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                  aria-label="Close menu"
                >
                  <X className="size-4" strokeWidth={2.5} />
                </button>
              </div>

              {/* Divider with gradient */}
              <div className="mx-5 h-px bg-gradient-to-r from-[#FF6B35]/20 via-[#FBBF24]/20 to-transparent" />

              {/* Navigation links */}
              <nav className="flex-1 overflow-y-auto px-4 py-4">
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  Explore
                </p>
                <div className="space-y-0.5">
                  {NAV_LINKS.map(({ href, label, icon: Icon, description }) => {
                    const isActive = pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                          isActive
                            ? "bg-[#FF6B35]/8 text-[#FF6B35]"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex size-9 items-center justify-center rounded-lg transition-colors ${
                            isActive
                              ? "bg-[#FF6B35]/15 text-[#FF6B35]"
                              : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600"
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{label}</span>
                          <span className="text-[11px] text-gray-400">{description}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Authenticated mobile links */}
                <SignedIn>
                  <div className="mt-5 pt-4">
                    <div className="mx-3 mb-3 h-px bg-gray-100" />
                    <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                      Your Account
                    </p>
                    <div className="space-y-0.5">
                      {AUTH_NAV_LINKS.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href;
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                              isActive
                                ? "bg-[#FF6B35]/8 text-[#FF6B35]"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <div
                              className={`flex size-9 items-center justify-center rounded-lg transition-colors ${
                                isActive
                                  ? "bg-[#FF6B35]/15 text-[#FF6B35]"
                                  : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600"
                              }`}
                            >
                              <Icon className="size-4" />
                            </div>
                            <span className="text-sm font-semibold">{label}</span>
                          </Link>
                        );
                      })}
                      <Link
                        href="/profile"
                        onClick={() => setMobileOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                          pathname === "/profile"
                            ? "bg-[#FF6B35]/8 text-[#FF6B35]"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex size-9 items-center justify-center rounded-lg transition-colors ${
                            pathname === "/profile"
                              ? "bg-[#FF6B35]/15 text-[#FF6B35]"
                              : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600"
                          }`}
                        >
                          <UserCircle className="size-4" />
                        </div>
                        <span className="text-sm font-semibold">Profile & Preferences</span>
                      </Link>
                    </div>
                  </div>
                </SignedIn>
              </nav>

              {/* Mobile drawer footer */}
              <div className="border-t border-gray-100 px-5 py-5">
                <SignedOut>
                  <div className="flex flex-col gap-2.5">
                    <SignUpButton mode="redirect">
                      <button
                        type="button"
                        className="group/cta relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3.5 text-sm font-semibold text-white"
                        style={{
                          background: "linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%)",
                        }}
                      >
                        <Sparkles className="size-4" />
                        Get Started Free
                        <div
                          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/cta:opacity-100"
                          style={{
                            background: "linear-gradient(135deg, #FF8F5E 0%, #FBBF24 100%)",
                          }}
                        />
                      </button>
                    </SignUpButton>
                    <p className="text-center text-[11px] text-gray-400">
                      By signing up, you agree to our{" "}
                      <Link href="/terms" className="underline hover:text-[#FF6B35]">Terms</Link>
                      {" & "}
                      <Link href="/privacy" className="underline hover:text-[#FF6B35]">Privacy Policy</Link>
                    </p>
                    <SignInButton mode="redirect">
                      <button
                        type="button"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                      >
                        Sign in
                      </button>
                    </SignInButton>
                  </div>
                </SignedOut>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
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
      className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
      title="Notifications"
    >
      <Bell className="size-[18px]" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#FF6B35] text-[9px] font-bold text-white ring-2 ring-white">
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

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Legal
            </h4>
            <div className="space-y-2.5">
              <Link
                href="/terms"
                className="block text-sm text-gray-300 transition-colors hover:text-white"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="block text-sm text-gray-300 transition-colors hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                href="/cookies"
                className="block text-sm text-gray-300 transition-colors hover:text-white"
              >
                Cookie Policy
              </Link>
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
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <Link href="/terms" className="transition-colors hover:text-gray-300">Terms</Link>
            <span>&middot;</span>
            <Link href="/privacy" className="transition-colors hover:text-gray-300">Privacy</Link>
            <span>&middot;</span>
            <Link href="/cookies" className="transition-colors hover:text-gray-300">Cookies</Link>
          </div>
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
