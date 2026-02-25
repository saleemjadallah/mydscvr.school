"use client";

export const dynamic = "force-dynamic";

import { useSearchParams, useRouter } from "next/navigation";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { LogIn, User, Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProfileTab from "@/components/profile/ProfileTab";
import AccountTab from "@/components/profile/AccountTab";
import NotificationsTab from "@/components/profile/NotificationsTab";

const TABS = [
  { value: "profile", label: "Profile", icon: User },
  { value: "settings", label: "Account", icon: Settings },
  { value: "notifications", label: "Notifications", icon: Bell },
] as const;

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
              <SignInButton mode="redirect">
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

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "profile";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`/profile?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your profile, account, and notification preferences.
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList variant="line" className="mb-8 w-full justify-start gap-0 border-b border-gray-200">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:text-[#FF6B35] data-[state=active]:after:bg-[#FF6B35]"
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="settings">
          <AccountTab />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
    </>
  );
}
