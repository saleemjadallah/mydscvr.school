'use client';

export const dynamic = "force-dynamic";

import Link from 'next/link';
import { Heart, LogIn, Loader2 } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import SchoolCard from '@/components/SchoolCard';
import { useSavedSchools } from '@/hooks/useSavedSchools';
import type { School } from '@/types';

export default function SavedSchoolsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ---- Unauthenticated state ---- */}
        <SignedOut>
          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#FF6B35]/10">
              <LogIn className="size-10 text-[#FF6B35]" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Sign in to save schools
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base text-gray-500">
              Create a free account to save your favourite schools and nurseries,
              compare them later, and get personalized recommendations.
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

        {/* ---- Authenticated state ---- */}
        <SignedIn>
          <SavedSchoolsList />
        </SignedIn>
      </div>
    </div>
  );
}

function SavedSchoolsList() {
  const { savedSchools, isLoading, toggleSave, isSaved } = useSavedSchools();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[#FF6B35]" />
        <p className="mt-3 text-sm text-gray-500">Loading your saved schools...</p>
      </div>
    );
  }

  if (savedSchools.length === 0) {
    return (
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
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Schools</h1>
        <p className="mt-1 text-sm text-gray-500">
          {savedSchools.length} {savedSchools.length === 1 ? 'school' : 'schools'} saved
        </p>
      </div>
      <div className="space-y-4">
        {savedSchools.map((school: School) => (
          <SchoolCard
            key={school.id}
            school={school}
            isSaved={isSaved(school.id)}
            onToggleSave={toggleSave}
          />
        ))}
      </div>
    </>
  );
}
