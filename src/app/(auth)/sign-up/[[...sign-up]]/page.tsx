"use client";

import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-theme";

export default function SignUpPage() {
  return <SignUp appearance={clerkAppearance} />;
}
