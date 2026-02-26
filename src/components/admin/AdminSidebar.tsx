"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useState, createContext, useContext } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/schools", label: "Schools", icon: GraduationCap },
  { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/content", label: "Content & SEO", icon: FileText },
  { href: "/admin/pipeline", label: "Pipeline", icon: Activity },
  { href: "/admin/claims", label: "Claims", icon: Shield },
  { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
] as const;

const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}>({ collapsed: false, setCollapsed: () => {} });

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <aside
      className={`hidden lg:flex flex-col bg-slate-900 text-slate-300 transition-all duration-200 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Logo area */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        {!collapsed && (
          <Link href="/admin" className="text-lg font-bold text-white">
            mydscvr<span className="text-[#FF6B35]">.admin</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
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
                  ? "bg-[#FF6B35]/15 text-[#FF6B35]"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="size-[18px] shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 px-2 py-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ExternalLink className="size-[18px] shrink-0" />
          {!collapsed && <span>View Site</span>}
        </Link>
      </div>
    </aside>
  );
}
