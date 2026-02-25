"use client";

import Link from "next/link";
import { Phone, Mail, Globe, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackClick } from "@/lib/api";
import type { ClickType } from "@/types";

interface SchoolContactCardProps {
  schoolId: string;
  schoolName: string;
  phone: string | null;
  email: string | null;
  admissionEmail: string | null;
  website: string | null;
  whatsapp: string | null;
  khdaInspectionUrl: string | null;
  isFeatured: boolean;
}

export default function SchoolContactCard({
  schoolId,
  schoolName,
  phone,
  email,
  admissionEmail,
  website,
  whatsapp,
  khdaInspectionUrl,
  isFeatured,
}: SchoolContactCardProps) {
  const track = (type: ClickType, destination: string) => {
    trackClick({
      school_id: schoolId,
      click_type: type,
      destination,
      source_page: "school-profile",
    });
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Gradient top stripe */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: "linear-gradient(90deg, #FF6B35, #FBBF24)",
        }}
      />

      <h3 className="mb-4 text-base font-semibold text-gray-900">
        Contact {schoolName}
      </h3>

      <div className="space-y-3">
        {phone && (
          <Link
            href={`tel:${phone}`}
            onClick={() => track("phone", phone)}
            className="flex items-center gap-3 rounded-xl p-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Phone className="size-4 flex-shrink-0 text-[#FF6B35]" />
            <span>{phone}</span>
          </Link>
        )}

        {(email ?? admissionEmail) && (
          <Link
            href={`mailto:${admissionEmail ?? email}`}
            onClick={() => track("email", admissionEmail ?? email!)}
            className="flex items-center gap-3 rounded-xl p-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Mail className="size-4 flex-shrink-0 text-[#FF6B35]" />
            <span className="truncate">
              {admissionEmail ?? email}
            </span>
          </Link>
        )}

        {website && (
          <Link
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("website", website)}
            className="flex items-center gap-3 rounded-xl p-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Globe className="size-4 flex-shrink-0 text-[#FF6B35]" />
            <span className="truncate">Visit Website</span>
            <ExternalLink className="ml-auto size-3.5 flex-shrink-0 text-gray-400" />
          </Link>
        )}

        {whatsapp && (
          <Link
            href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp", `https://wa.me/${whatsapp.replace(/\D/g, "")}`)}
            className="flex items-center gap-3 rounded-xl p-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Phone className="size-4 flex-shrink-0 text-green-600" />
            <span>WhatsApp</span>
            <ExternalLink className="ml-auto size-3.5 flex-shrink-0 text-gray-400" />
          </Link>
        )}
      </div>

      {khdaInspectionUrl && (
        <Link
          href={khdaInspectionUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("website", khdaInspectionUrl)}
          className="mt-4 block"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
          >
            <FileText className="size-3.5" />
            KHDA Inspection Page
          </Button>
        </Link>
      )}
    </div>
  );
}
