"use client";

import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-theme";

export default function SignInPage() {
  return <SignIn appearance={clerkAppearance} />;
}
