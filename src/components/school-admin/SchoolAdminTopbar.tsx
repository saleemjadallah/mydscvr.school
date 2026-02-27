"use client";

import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Menu, ExternalLink } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Building2,
  CreditCard,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSchoolAdmin } from "./SchoolAdminContext";

const MOBILE_NAV = [
  { href: "/school-admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/school-admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/school-admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/school-admin/profile", label: "School Profile", icon: Building2 },
  { href: "/school-admin/billing", label: "Billing", icon: CreditCard },
];

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  const labelMap: Record<string, string> = {
    "school-admin": "Dashboard",
    enquiries: "Enquiries",
    analytics: "Analytics",
    profile: "School Profile",
    billing: "Billing",
  };

  let path = "";
  for (const seg of segments) {
    path += `/${seg}`;
    crumbs.push({
      label: labelMap[seg] || seg,
      href: path,
    });
  }
  return crumbs;
}

interface SchoolAdminTopbarProps {
  schoolName?: string;
  planName?: string;
}

export default function SchoolAdminTopbar({ schoolName, planName }: SchoolAdminTopbarProps) {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { school } = useSchoolAdmin();
  const schoolSlug = school?.slug as string | undefined;

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 lg:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="lg:hidden p-1.5 rounded-md hover:bg-slate-100 text-slate-600">
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] bg-white p-0 border-slate-200">
            <SheetTitle className="sr-only">School Admin Navigation</SheetTitle>
            <div className="flex h-14 items-center px-4 border-b border-slate-100">
              <span className="text-lg font-bold text-slate-900">
                mydscvr<span className="text-[#FF6B35]">.schools</span>
              </span>
            </div>
            <nav className="py-3 px-2 space-y-0.5">
              {MOBILE_NAV.map(({ href, label, icon: Icon, exact }) => {
                const isActive = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={`${href}-${label}`}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                      isActive
                        ? "bg-[#FF6B35]/10 text-[#FF6B35]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="size-[18px]" />
                    <span>{label}</span>
                  </Link>
                );
              })}
              {schoolSlug && (
                <>
                  <div className="my-2 mx-3 h-px bg-slate-100" />
                  <Link
                    href={`/schools/${schoolSlug}`}
                    target="_blank"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <ExternalLink className="size-[18px]" />
                    <span>View my school</span>
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-slate-300">/</span>}
              {i === crumbs.length - 1 ? (
                <span className="font-medium text-slate-900">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-slate-500 hover:text-slate-700">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {schoolName && (
          <span className="hidden md:block text-[13px] font-medium text-slate-600 truncate max-w-[200px]">
            {schoolName}
          </span>
        )}
        {planName && planName !== "Free" && (
          <Badge
            variant="secondary"
            className="hidden md:inline-flex bg-[#FF6B35]/10 text-[#FF6B35] border-0 text-[10px] font-semibold"
          >
            {planName}
          </Badge>
        )}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: { avatarBox: "h-8 w-8" },
          }}
        />
      </div>
    </header>
  );
}
