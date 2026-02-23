"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@clerk/nextjs";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Loader2,
  LogIn,
  Save,
  User,
  MapPin,
  GraduationCap,
  Wallet,
  Users,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { User as UserType } from "@/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CURRICULA_OPTIONS = [
  "British",
  "American",
  "IB",
  "Indian",
  "French",
  "Canadian",
  "German",
  "Japanese",
  "MOE",
];

const AREA_OPTIONS = [
  "Al Barsha",
  "Al Barsha South",
  "Al Khail",
  "Al Sufouh",
  "Arabian Ranches",
  "Business Bay",
  "Downtown Dubai",
  "Dubai Marina",
  "Emirates Hills",
  "JBR",
  "JLT",
  "Jumeirah",
  "Jumeirah Park",
  "Mirdif",
  "Nad Al Sheba",
  "Oud Metha",
  "Silicon Oasis",
  "Sports City",
  "The Villa",
];

// ---------------------------------------------------------------------------
// Form type
// ---------------------------------------------------------------------------

interface ProfileFormValues {
  phone: string;
  nationality: string;
  current_area: string;
  children_count: string;
  budget_min: string;
  budget_max: string;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <SignedOut>
          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#FF6B35]/10">
              <LogIn className="size-10 text-[#FF6B35]" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Sign in to manage your profile
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base text-gray-500">
              Create a free account to set your school preferences and get
              personalized search results.
            </p>
            <div className="mt-8">
              <SignInButton mode="modal">
                <Button className="bg-[#FF6B35] px-8 py-3 text-base text-white hover:bg-[#e55a2a]">
                  <LogIn className="mr-2 size-5" />
                  Sign In
                </Button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <ProfileContent />
        </SignedIn>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile content (authenticated)
// ---------------------------------------------------------------------------

function ProfileContent() {
  const { isSignedIn } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Multi-select state
  const [selectedCurricula, setSelectedCurricula] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ProfileFormValues>();

  // Fetch user profile
  useEffect(() => {
    if (!isSignedIn) return;

    async function fetchProfile() {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setUser(data.user);

        // Populate form
        reset({
          phone: data.user.phone || "",
          nationality: data.user.nationality || "",
          current_area: data.user.current_area || "",
          children_count: data.user.children_count?.toString() || "",
          budget_min: data.user.budget_min?.toString() || "",
          budget_max: data.user.budget_max?.toString() || "",
        });

        setSelectedCurricula(data.user.preferred_curricula || []);
        setSelectedAreas(data.user.preferred_areas || []);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [isSignedIn, reset]);

  const toggleCurriculum = (c: string) => {
    setSelectedCurricula((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const toggleArea = (a: string) => {
    setSelectedAreas((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: data.phone || null,
          nationality: data.nationality || null,
          current_area: data.current_area || null,
          children_count: data.children_count
            ? parseInt(data.children_count)
            : null,
          preferred_curricula:
            selectedCurricula.length > 0 ? selectedCurricula : null,
          preferred_areas: selectedAreas.length > 0 ? selectedAreas : null,
          budget_min: data.budget_min ? parseInt(data.budget_min) : null,
          budget_max: data.budget_max ? parseInt(data.budget_max) : null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      const updated = await res.json();
      setUser(updated.user);
      reset({
        phone: updated.user.phone || "",
        nationality: updated.user.nationality || "",
        current_area: updated.user.current_area || "",
        children_count: updated.user.children_count?.toString() || "",
        budget_min: updated.user.budget_min?.toString() || "",
        budget_max: updated.user.budget_max?.toString() || "",
      });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[#FF6B35]" />
        <p className="mt-3 text-sm text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set your preferences to get personalized school recommendations.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ---- Personal Info ---- */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#FF6B35]/10">
              <User className="size-5 text-[#FF6B35]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h2>
              <p className="text-xs text-gray-500">
                Your name and email are managed by your sign-in provider.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Name (read-only from Clerk) */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-gray-600">Name</Label>
              <Input
                value={user?.name || "—"}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Email (read-only from Clerk) */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-gray-600">Email</Label>
              <Input
                value={user?.email || "—"}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+971 50 123 4567"
                {...register("phone")}
              />
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

            {/* Current area */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="current_area">Current Area</Label>
              <Input
                id="current_area"
                placeholder="e.g. Dubai Marina"
                {...register("current_area")}
              />
            </div>

            {/* Children count */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="children_count">Number of Children</Label>
              <Input
                id="children_count"
                type="number"
                min="0"
                max="20"
                placeholder="e.g. 2"
                {...register("children_count")}
              />
            </div>
          </div>
        </motion.section>

        {/* ---- School Preferences ---- */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50">
              <GraduationCap className="size-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Preferred Curricula
              </h2>
              <p className="text-xs text-gray-500">
                Select the curricula you&apos;re interested in. These will boost
                matching schools in search results.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {CURRICULA_OPTIONS.map((c) => {
              const isSelected = selectedCurricula.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCurriculum(c)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-[#FF6B35] bg-[#FF6B35]/10 text-[#FF6B35]"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {isSelected && <Check className="size-3.5" />}
                  {c}
                </button>
              );
            })}
          </div>

          {selectedCurricula.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCurricula([])}
              className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <X className="size-3" />
              Clear all
            </button>
          )}
        </motion.section>

        {/* ---- Preferred Areas ---- */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50">
              <MapPin className="size-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Preferred Areas
              </h2>
              <p className="text-xs text-gray-500">
                Select your preferred Dubai areas. Schools in these areas will
                rank higher in search.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {AREA_OPTIONS.map((a) => {
              const isSelected = selectedAreas.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleArea(a)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {isSelected && <Check className="size-3.5" />}
                  {a}
                </button>
              );
            })}
          </div>

          {selectedAreas.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedAreas([])}
              className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <X className="size-3" />
              Clear all
            </button>
          )}
        </motion.section>

        {/* ---- Budget Range ---- */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50">
              <Wallet className="size-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Budget Range
              </h2>
              <p className="text-xs text-gray-500">
                Set your annual tuition budget range in AED. Schools within
                budget will rank higher.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budget_min">Minimum (AED/year)</Label>
              <Input
                id="budget_min"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g. 20000"
                {...register("budget_min")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budget_max">Maximum (AED/year)</Label>
              <Input
                id="budget_max"
                type="number"
                min="0"
                step="1000"
                placeholder="e.g. 80000"
                {...register("budget_max")}
              />
            </div>
          </div>
        </motion.section>

        {/* ---- Save Button ---- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end"
        >
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#FF6B35] px-8 py-3 text-base text-white hover:bg-[#e55a2a]"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Save Preferences
              </>
            )}
          </Button>
        </motion.div>

        {/* Hint */}
        <p className="text-center text-xs text-gray-400">
          Your preferences will personalize AI search results across mydscvr.ai.
        </p>
      </form>
    </>
  );
}
