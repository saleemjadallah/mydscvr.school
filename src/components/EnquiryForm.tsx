"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EnquiryFormProps {
  school: {
    id: string;
    name: string;
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
// Component
// ---------------------------------------------------------------------------

export default function EnquiryForm({ school }: EnquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
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

  const onSubmit = async (data: EnquiryFormValues) => {
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

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          rows={3}
          placeholder="Any questions or additional information..."
          {...register("message")}
        />
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
    </form>
  );
}
