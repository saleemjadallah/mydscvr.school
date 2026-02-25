"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import SignUpWallModal from "@/components/SignUpWallModal";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  CalendarSearch,
  DollarSign,
  ArrowRightLeft,
  Heart,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EnquiryFormProps {
  school: {
    id: string;
    name: string;
    curriculum?: string[];
    khda_rating?: string | null;
    type?: "school" | "nursery";
    has_sen_support?: boolean;
  };
}

interface EnquiryFormValues {
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  parent_whatsapp: string;
  nationality: string;
  child_name: string;
  child_dob: string;
  child_grade: string;
  preferred_start: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Message templates
// ---------------------------------------------------------------------------

interface MessageTemplate {
  id: string;
  label: string;
  icon: React.ReactNode;
  generate: (ctx: TemplateContext) => string;
  /** Only show this template when the condition is met */
  condition?: (school: EnquiryFormProps["school"]) => boolean;
}

interface TemplateContext {
  schoolName: string;
  childName: string;
  childGrade: string;
  preferredStart: string;
  curriculum: string;
  khdaRating: string | null;
  isNursery: boolean;
}

function formatStartDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "general",
    label: "General Admission",
    icon: <GraduationCap className="size-3.5" />,
    generate: (ctx) => {
      const parts: string[] = [];
      parts.push(`Dear Admissions Team at ${ctx.schoolName},`);
      parts.push("");

      const childRef = ctx.childName || "my child";
      const gradeRef = ctx.childGrade
        ? ` for ${ctx.childGrade}`
        : ctx.isNursery
          ? ""
          : "";
      parts.push(
        `I am writing to enquire about admission${gradeRef} for ${childRef}.`
      );

      if (ctx.curriculum) {
        parts.push(
          `We are particularly interested in your ${ctx.curriculum} programme${ctx.khdaRating ? ` and your ${ctx.khdaRating} KHDA rating` : ""}.`
        );
      } else if (ctx.khdaRating) {
        parts.push(
          `Your ${ctx.khdaRating} KHDA rating stood out to us during our research.`
        );
      }

      if (ctx.preferredStart) {
        parts.push(
          `We are looking to start in ${formatStartDate(ctx.preferredStart)}.`
        );
      }

      parts.push("");
      parts.push(
        "Could you please share details on the admissions process, availability, and any documentation required?"
      );
      parts.push("");
      parts.push("Thank you for your time. I look forward to hearing from you.");

      return parts.join("\n");
    },
  },
  {
    id: "tour",
    label: "School Tour",
    icon: <CalendarSearch className="size-3.5" />,
    generate: (ctx) => {
      const parts: string[] = [];
      parts.push(`Dear Admissions Team at ${ctx.schoolName},`);
      parts.push("");

      const childRef = ctx.childName || "my child";
      parts.push(
        `We are considering ${ctx.schoolName} for ${childRef}${ctx.childGrade ? ` (${ctx.childGrade})` : ""} and would love to arrange a campus tour.`
      );

      if (ctx.curriculum || ctx.khdaRating) {
        const highlights = [
          ctx.curriculum ? `the ${ctx.curriculum} curriculum` : "",
          ctx.khdaRating ? `your ${ctx.khdaRating} KHDA rating` : "",
        ]
          .filter(Boolean)
          .join(" and ");
        parts.push(
          `We have been impressed by ${highlights} and would appreciate the opportunity to see the facilities and meet the team in person.`
        );
      }

      parts.push("");
      parts.push(
        "Could you please let me know available dates and times for a school visit?"
      );

      if (ctx.preferredStart) {
        parts.push(
          `We are hoping to join for ${formatStartDate(ctx.preferredStart)}.`
        );
      }

      parts.push("");
      parts.push("Thank you — looking forward to your response.");

      return parts.join("\n");
    },
  },
  {
    id: "fees",
    label: "Fees & Scholarships",
    icon: <DollarSign className="size-3.5" />,
    generate: (ctx) => {
      const parts: string[] = [];
      parts.push(`Dear Admissions Team at ${ctx.schoolName},`);
      parts.push("");

      const childRef = ctx.childName || "my child";
      parts.push(
        `I am exploring ${ctx.isNursery ? "nursery" : "school"} options for ${childRef}${ctx.childGrade ? ` (${ctx.childGrade})` : ""} and would appreciate detailed information about your fee structure.`
      );

      parts.push("");
      parts.push("Specifically, I would like to understand:");
      parts.push("- Tuition fees and what is included");
      parts.push("- Payment plan options (termly/annual)");
      parts.push("- Any registration or admission fees");
      parts.push("- Available scholarships or sibling discounts");

      if (ctx.preferredStart) {
        parts.push("");
        parts.push(
          `We are considering enrolment for ${formatStartDate(ctx.preferredStart)}.`
        );
      }

      parts.push("");
      parts.push("Thank you for your time.");

      return parts.join("\n");
    },
  },
  {
    id: "transfer",
    label: "Transfer Enquiry",
    icon: <ArrowRightLeft className="size-3.5" />,
    generate: (ctx) => {
      const parts: string[] = [];
      parts.push(`Dear Admissions Team at ${ctx.schoolName},`);
      parts.push("");

      const childRef = ctx.childName || "my child";
      parts.push(
        `${childRef} is currently enrolled at another ${ctx.isNursery ? "nursery" : "school"} and we are looking to transfer${ctx.childGrade ? ` (currently in ${ctx.childGrade})` : ""}.`
      );

      if (ctx.curriculum) {
        parts.push(
          `We are particularly drawn to your ${ctx.curriculum} programme as a better fit for our family.`
        );
      }

      parts.push("");
      parts.push("Could you please advise on:");
      parts.push("- Mid-year or next-term transfer availability");
      parts.push("- Required documentation for transfers");
      parts.push("- Any assessment or entrance requirements");

      if (ctx.preferredStart) {
        parts.push("");
        parts.push(
          `We are hoping to complete the transfer by ${formatStartDate(ctx.preferredStart)}.`
        );
      }

      parts.push("");
      parts.push("Thank you — I look forward to hearing from you.");

      return parts.join("\n");
    },
  },
  {
    id: "sen",
    label: "SEN / Inclusion",
    icon: <Heart className="size-3.5" />,
    condition: (school) => school.has_sen_support === true,
    generate: (ctx) => {
      const parts: string[] = [];
      parts.push(`Dear Admissions & Inclusion Team at ${ctx.schoolName},`);
      parts.push("");

      const childRef = ctx.childName || "my child";
      parts.push(
        `I am writing to enquire about your Special Educational Needs and inclusion support for ${childRef}${ctx.childGrade ? ` (${ctx.childGrade})` : ""}.`
      );

      parts.push("");
      parts.push("I would appreciate information on:");
      parts.push(
        "- The range of learning support and SEN provisions available"
      );
      parts.push("- Staff-to-student ratios within the inclusion programme");
      parts.push("- Any specialist staff or external support partnerships");
      parts.push("- How individualised learning plans are developed");

      if (ctx.preferredStart) {
        parts.push("");
        parts.push(
          `We are looking at a ${formatStartDate(ctx.preferredStart)} start date.`
        );
      }

      parts.push("");
      parts.push(
        "I would also welcome the opportunity to discuss our child's needs in more detail. Thank you."
      );

      return parts.join("\n");
    },
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EnquiryForm({ school }: EnquiryFormProps) {
  const { isSignedIn } = useAuth();
  const [wallOpen, setWallOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<EnquiryFormValues>({
    defaultValues: {
      parent_name: "",
      parent_email: "",
      parent_phone: "",
      parent_whatsapp: "",
      nationality: "",
      child_name: "",
      child_dob: "",
      child_grade: "",
      preferred_start: "",
      message: "",
    },
  });

  const childName = watch("child_name");
  const childGrade = watch("child_grade");
  const preferredStart = watch("preferred_start");

  const applyTemplate = (template: MessageTemplate) => {
    const ctx: TemplateContext = {
      schoolName: school.name,
      childName: childName?.trim() || "",
      childGrade: childGrade?.trim() || "",
      preferredStart: preferredStart || "",
      curriculum: school.curriculum?.join(" / ") || "",
      khdaRating: school.khda_rating || null,
      isNursery: school.type === "nursery",
    };

    const message = template.generate(ctx);
    setValue("message", message, { shouldDirty: true });
    setActiveTemplate(template.id);
  };

  const visibleTemplates = MESSAGE_TEMPLATES.filter(
    (t) => !t.condition || t.condition(school)
  );

  const onSubmit = async (data: EnquiryFormValues) => {
    if (!isSignedIn) {
      setWallOpen(true);
      return;
    }

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_id: school.id,
          source: "profile",
          parent_name: data.parent_name,
          parent_email: data.parent_email,
          parent_phone: data.parent_phone || null,
          parent_whatsapp: data.parent_whatsapp || null,
          nationality: data.nationality || null,
          child_name: data.child_name || null,
          child_dob: data.child_dob || null,
          child_grade: data.child_grade || null,
          preferred_start: data.preferred_start || null,
          message: data.message || null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong");
      }

      setSubmitted(true);
      setActiveTemplate(null);
      reset();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send enquiry. Please try again."
      );
    }
  };

  // ---- Success state ----
  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="size-10 text-emerald-600" />
        <h3 className="text-lg font-semibold text-emerald-800">
          Enquiry Sent!
        </h3>
        <p className="text-sm text-emerald-700">
          Your enquiry has been sent to{" "}
          <span className="font-medium">{school.name}</span>. They will get back
          to you shortly.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => setSubmitted(false)}
        >
          Send another enquiry
        </Button>
      </div>
    );
  }

  // ---- Form ----
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 rounded-xl border bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-gray-900">
        Enquire at {school.name}
      </h3>

      {/* Parent name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="parent_name">
          Your Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="parent_name"
          placeholder="e.g. Sarah Ahmed"
          {...register("parent_name", { required: "Name is required" })}
          aria-invalid={!!errors.parent_name}
        />
        {errors.parent_name && (
          <p className="text-xs text-red-500">{errors.parent_name.message}</p>
        )}
      </div>

      {/* Parent email */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="parent_email">
          Email Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="parent_email"
          type="email"
          placeholder="you@example.com"
          {...register("parent_email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address",
            },
          })}
          aria-invalid={!!errors.parent_email}
        />
        {errors.parent_email && (
          <p className="text-xs text-red-500">{errors.parent_email.message}</p>
        )}
      </div>

      {/* Parent phone */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="parent_phone">Phone Number</Label>
        <Input
          id="parent_phone"
          type="tel"
          placeholder="+971 50 123 4567"
          {...register("parent_phone", {
            pattern: {
              value: /^[+]?[\d\s()-]{7,20}$/,
              message: "Please enter a valid phone number",
            },
          })}
          aria-invalid={!!errors.parent_phone}
        />
        {errors.parent_phone && (
          <p className="text-xs text-red-500">{errors.parent_phone.message}</p>
        )}
      </div>

      {/* Child grade */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="child_grade">Child&apos;s Grade / Year</Label>
        <Input
          id="child_grade"
          placeholder="e.g. Year 5, Grade 3, FS2"
          {...register("child_grade")}
        />
      </div>

      {/* Show more toggle */}
      <button
        type="button"
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-1 text-xs font-medium text-[#FF6B35] hover:underline"
      >
        {showMore ? (
          <>
            <ChevronUp className="size-3.5" />
            Show fewer fields
          </>
        ) : (
          <>
            <ChevronDown className="size-3.5" />
            Add more details (optional)
          </>
        )}
      </button>

      {/* Expandable fields */}
      {showMore && (
        <div className="flex flex-col gap-5">
          {/* WhatsApp */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="parent_whatsapp">WhatsApp Number</Label>
            <Input
              id="parent_whatsapp"
              type="tel"
              placeholder="+971 50 123 4567"
              {...register("parent_whatsapp", {
                pattern: {
                  value: /^[+]?[\d\s()-]{7,20}$/,
                  message: "Please enter a valid WhatsApp number",
                },
              })}
              aria-invalid={!!errors.parent_whatsapp}
            />
            {errors.parent_whatsapp && (
              <p className="text-xs text-red-500">{errors.parent_whatsapp.message}</p>
            )}
          </div>

          {/* Nationality */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              placeholder="e.g. British, Indian, Emirati"
              {...register("nationality")}
            />
          </div>

          {/* Child name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="child_name">Child&apos;s Name</Label>
            <Input
              id="child_name"
              placeholder="e.g. Adam"
              {...register("child_name")}
            />
          </div>

          {/* Child DOB */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="child_dob">Child&apos;s Date of Birth</Label>
            <Input
              id="child_dob"
              type="date"
              {...register("child_dob")}
            />
          </div>

          {/* Preferred start */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="preferred_start">Preferred Start Date</Label>
            <Input
              id="preferred_start"
              type="date"
              {...register("preferred_start")}
            />
          </div>
        </div>
      )}

      {/* Message with template presets */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Message</Label>

        {/* Template chips */}
        <div className="flex flex-wrap gap-1.5">
          {visibleTemplates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTemplate === t.id
                  ? "border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <Textarea
          id="message"
          rows={5}
          placeholder="Select a template above or write your own message..."
          {...register("message")}
          onChange={(e) => {
            register("message").onChange(e);
            // Clear active template indicator if user edits manually
            if (activeTemplate) setActiveTemplate(null);
          }}
        />
        {activeTemplate && (
          <p className="text-[11px] text-gray-400">
            You can edit the message above before sending.
          </p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90"
      >
        {isSubmitting ? "Sending..." : "Send Enquiry"}
      </Button>

      <p className="text-center text-xs text-gray-400">
        Your details will be shared with {school.name} to process your enquiry.
      </p>

      <SignUpWallModal open={wallOpen} onClose={() => setWallOpen(false)} feature="enquiry" />
    </form>
  );
}
