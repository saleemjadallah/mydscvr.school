"use client";

import { useAuth } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import AdminSidebar, { SidebarProvider } from "@/components/admin/AdminSidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  GraduationCap,
  MessageSquare,
  Users,
  BarChart3,
  FileText,
  Activity,
  Shield,
  ScrollText,
  ExternalLink,
} from "lucide-react";

const MOBILE_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/schools", label: "Schools", icon: GraduationCap },
  { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/content", label: "Content & SEO", icon: FileText },
  { href: "/admin/pipeline", label: "Pipeline", icon: Activity },
  { href: "/admin/claims", label: "Claims", icon: Shield },
  { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
];

// Breadcrumb label map
function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  const labelMap: Record<string, string> = {
    admin: "Admin",
    schools: "Schools",
    enquiries: "Enquiries",
    users: "Users",
    analytics: "Analytics",
    content: "Content & SEO",
    pipeline: "Pipeline",
    claims: "Claims",
    audit: "Audit Log",
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

function AdminTopbar() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <SheetContent side="left" className="w-[260px] bg-slate-900 p-0 border-slate-800">
            <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
            <div className="flex h-14 items-center px-4 border-b border-slate-800">
              <span className="text-lg font-bold text-white">
                mydscvr<span className="text-[#FF6B35]">.admin</span>
              </span>
            </div>
            <nav className="py-3 px-2 space-y-0.5">
              {MOBILE_NAV.map(({ href, label, icon: Icon, exact }) => {
                const isActive = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                      isActive
                        ? "bg-[#FF6B35]/15 text-[#FF6B35]"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <Icon className="size-[18px]" />
                    <span>{label}</span>
                  </Link>
                );
              })}
              <div className="my-2 mx-3 h-px bg-slate-800" />
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <ExternalLink className="size-[18px]" />
                <span>View Site</span>
              </Link>
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
        <Link
          href="/"
          target="_blank"
          className="hidden md:inline-flex text-[13px] text-slate-500 hover:text-slate-700 font-medium"
        >
          View Site
        </Link>
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-50">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
