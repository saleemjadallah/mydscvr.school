'use client';

import { Heart, LogIn } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Saved Schools Page
// ---------------------------------------------------------------------------

export default function SavedSchoolsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
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

        {/* ---- Authenticated empty state ---- */}
        <SignedIn>
          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#FF6B35]/10">
              <Heart className="size-10 text-[#FF6B35]" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              Your saved schools will appear here
            </h1>
            <p className="mx-auto mt-3 max-w-md text-base text-gray-500">
              Browse schools and tap the heart icon to save them. You can then
              easily compare and track your shortlisted schools from this page.
            </p>
            <div className="mt-8">
              <Button
                asChild
                className="bg-[#FF6B35] px-8 py-3 text-base text-white hover:bg-[#e55a2a]"
              >
                <a href="/schools">Browse Schools</a>
              </Button>
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
