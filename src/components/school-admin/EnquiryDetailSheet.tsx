"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/admin/StatusBadge";
import { Mail, Phone, Calendar, MessageSquare, AlertTriangle } from "lucide-react";
import type { SchoolAdminEnquiry } from "@/types";

interface EnquiryDetailSheetProps {
  enquiry: SchoolAdminEnquiry | null;
  open: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDispute: (id: string, reason: string) => void;
  isUpdating?: boolean;
}

export default function EnquiryDetailSheet({
  enquiry,
  open,
  onClose,
  onUpdateStatus,
  onDispute,
  isUpdating,
}: EnquiryDetailSheetProps) {
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  // Reset dispute state when switching between enquiries
  useEffect(() => {
    setShowDispute(false);
    setDisputeReason("");
  }, [enquiry?.id]);

  if (!enquiry) return null;

  const statusActions: { label: string; status: string; variant: "default" | "outline" | "secondary" }[] = [];
  if (enquiry.status === "new" || enquiry.status === "sent_to_school") {
    statusActions.push({ label: "Mark Responded", status: "responded", variant: "default" });
  }
  if (enquiry.status === "responded") {
    statusActions.push({ label: "Mark Enrolled", status: "enrolled", variant: "default" });
    statusActions.push({ label: "Reject", status: "rejected", variant: "outline" });
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[420px] sm:w-[480px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-lg font-bold">Enquiry Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Parent info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900">{enquiry.parent_name}</h4>
            <div className="space-y-1.5 text-[13px] text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 text-slate-400" />
                <a href={`mailto:${enquiry.parent_email}`} className="text-[#FF6B35] hover:underline">
                  {enquiry.parent_email}
                </a>
              </div>
              {enquiry.parent_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="size-3.5 text-slate-400" />
                  <a href={`tel:${enquiry.parent_phone}`} className="hover:underline">
                    {enquiry.parent_phone}
                  </a>
                </div>
              )}
              {enquiry.child_grade && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-slate-400" />
                  <span>Grade: {enquiry.child_grade}</span>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          {enquiry.message && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <MessageSquare className="size-3.5 text-slate-400" />
                <span className="text-[12px] font-semibold text-slate-500 uppercase">Message</span>
              </div>
              <p className="text-[13px] text-slate-700 bg-slate-50 rounded-lg p-3">
                {enquiry.message}
              </p>
            </div>
          )}

          {/* Status & meta */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={enquiry.status} />
            {enquiry.source && (
              <Badge variant="outline" className="text-[10px]">
                Source: {enquiry.source}
              </Badge>
            )}
            {enquiry.is_billed && (
              <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                {enquiry.billed_amount != null && enquiry.billed_amount > 0
                  ? `AED ${enquiry.billed_amount} charged`
                  : "Credit used"}
              </Badge>
            )}
            {enquiry.billing_event_type === "duplicate_skipped" && (
              <Badge variant="secondary" className="text-[10px] bg-slate-50 text-slate-500">
                Duplicate — not billed
              </Badge>
            )}
          </div>

          <div className="text-[12px] text-slate-400">
            Received {new Date(enquiry.created_at).toLocaleString("en-US", {
              month: "short", day: "numeric", year: "numeric",
              hour: "numeric", minute: "2-digit",
            })}
            {enquiry.responded_at && (
              <> &middot; Responded {new Date(enquiry.responded_at).toLocaleDateString("en-US", {
                month: "short", day: "numeric",
              })}</>
            )}
          </div>

          {/* Actions */}
          {statusActions.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              {statusActions.map((action) => (
                <Button
                  key={action.status}
                  variant={action.variant}
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => onUpdateStatus(enquiry.id, action.status)}
                  className={action.variant === "default" ? "bg-[#FF6B35] hover:bg-[#FF6B35]/90" : ""}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Dispute */}
          {enquiry.is_billed && enquiry.billing_event_type !== "duplicate_skipped" && (
            <div className="pt-2 border-t border-slate-100">
              {!showDispute ? (
                <button
                  onClick={() => setShowDispute(true)}
                  className="flex items-center gap-1.5 text-[13px] text-amber-600 hover:text-amber-700 font-medium"
                >
                  <AlertTriangle className="size-3.5" />
                  Dispute this charge
                </button>
              ) : (
                <div className="space-y-2">
                  <label className="text-[12px] font-semibold text-slate-500 uppercase">
                    Dispute reason
                  </label>
                  <Textarea
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="e.g., Spam enquiry, wrong school, test submission..."
                    className="text-[13px] min-h-[80px]"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-200 text-amber-700 hover:bg-amber-50"
                      disabled={!disputeReason.trim() || isUpdating}
                      onClick={() => {
                        onDispute(enquiry.id, disputeReason);
                        setShowDispute(false);
                        setDisputeReason("");
                      }}
                    >
                      Submit Dispute
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowDispute(false);
                        setDisputeReason("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
