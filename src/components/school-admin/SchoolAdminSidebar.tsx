"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Building2,
  CreditCard,
  Settings,
  ExternalLink,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useState, createContext, useContext } from "react";
import { useSchoolAdmin } from "./SchoolAdminContext";

const NAV_ITEMS = [
  { href: "/school-admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/school-admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/school-admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/school-admin/profile", label: "School Profile", icon: Building2 },
  { href: "/school-admin/billing", label: "Billing", icon: CreditCard },
] as const;

const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}>({ collapsed: false, setCollapsed: () => {} });

export function useSchoolAdminSidebar() {
  return useContext(SidebarContext);
}

export function SchoolAdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export default function SchoolAdminSidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSchoolAdminSidebar();
  const { school } = useSchoolAdmin();
  const schoolSlug = school?.slug as string | undefined;

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-200 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Logo area */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
        {!collapsed && (
          <Link href="/school-admin" className="text-lg font-bold text-slate-900">
            mydscvr<span className="text-[#FF6B35]">.schools</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, ...rest }) => {
          const exact = "exact" in rest && rest.exact;
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                isActive
                  ? "bg-[#FF6B35]/10 text-[#FF6B35]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="size-[18px] shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 px-2 py-3 space-y-0.5">
        <Link
          href="/school-admin/billing"
          title={collapsed ? "Settings" : undefined}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <Settings className="size-[18px] shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        {schoolSlug && (
          <Link
            href={`/schools/${schoolSlug}`}
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <ExternalLink className="size-[18px] shrink-0" />
            {!collapsed && <span>View my school</span>}
          </Link>
        )}
      </div>
    </aside>
  );
}
