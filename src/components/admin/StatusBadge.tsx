const STATUS_STYLES: Record<string, string> = {
  // Enquiry statuses
  new: "bg-blue-50 text-blue-700 border-blue-200",
  sent_to_school: "bg-amber-50 text-amber-700 border-amber-200",
  responded: "bg-emerald-50 text-emerald-700 border-emerald-200",
  enrolled: "bg-purple-50 text-purple-700 border-purple-200",
  closed: "bg-slate-50 text-slate-500 border-slate-200",
  // Claim statuses
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  // Pipeline statuses
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  running: "bg-blue-50 text-blue-700 border-blue-200",
  skipped: "bg-slate-50 text-slate-500 border-slate-200",
  // Boolean
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-50 text-slate-500 border-slate-200",
  verified: "bg-blue-50 text-blue-700 border-blue-200",
  featured: "bg-purple-50 text-purple-700 border-purple-200",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || "bg-slate-50 text-slate-600 border-slate-200";
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${style} ${className}`}
    >
      {label}
    </span>
  );
}
