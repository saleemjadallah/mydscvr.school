'use client';

export const dynamic = "force-dynamic";

import Link from 'next/link';
import { Heart, Loader2, Bookmark, ArrowRight } from 'lucide-react';
import { useAuth, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import SchoolCard from '@/components/SchoolCard';
import { useSavedSchools } from '@/hooks/useSavedSchools';

const MAX_LOCAL_SAVES = 3;

export default function SavedSchoolsPage() {
  const { isSignedIn } = useAuth();
  const {
    savedSchools,
    isLoading,
    toggleSave,
    isSaved,
    isAtLocalLimit,
    localSaveCount,
    hydrated,
  } = useSavedSchools();

  // Show loading spinner until data is ready
  const showLoading = isSignedIn ? isLoading : !hydrated;

  if (showLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-[#FF6B35]" />
            <p className="mt-3 text-sm text-gray-500">Loading your saved schools...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (savedSchools.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#FF6B35]/10">
              <Heart className="size-10 text-[#FF6B35]" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              No saved schools yet
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base text-gray-500">
              Browse schools and tap the heart icon to save them. You can then
              easily compare and track your shortlisted schools from this page.
            </p>
            <div className="mt-8">
              <Link href="/schools">
                <Button className="bg-[#FF6B35] px-8 py-3 text-base text-white hover:bg-[#e55a2a]">
                  Browse Schools
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Saved Schools</h1>
          <p className="mt-1 text-sm text-gray-500">
            {savedSchools.length} {savedSchools.length === 1 ? 'school' : 'schools'} saved
          </p>
        </div>

        {/* Anonymous user: limit banner */}
        {!isSignedIn && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#FF6B35]/20 bg-gradient-to-r from-orange-50 to-amber-50 p-4">
            <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#FF6B35]/10">
              <Bookmark className="size-4.5 text-[#FF6B35]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800">
                You&apos;ve saved {localSaveCount} of {MAX_LOCAL_SAVES} schools as a guest
              </p>
              <p className="text-xs text-gray-500">
                Create a free account to save unlimited schools and access them from any device.
              </p>
            </div>
            <SignUpButton mode="redirect">
              <button
                type="button"
                className="flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%)",
                  boxShadow: "0 2px 8px rgba(255, 107, 53, 0.25)",
                }}
              >
                Sign Up Free
                <ArrowRight className="size-3" />
              </button>
            </SignUpButton>
          </div>
        )}

        <div className="space-y-4">
          {savedSchools.map((school) => (
            <SchoolCard
              key={school.id}
              school={school}
              isSaved={isSaved(school.id)}
              onToggleSave={toggleSave}
              isAtLocalLimit={isAtLocalLimit}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
