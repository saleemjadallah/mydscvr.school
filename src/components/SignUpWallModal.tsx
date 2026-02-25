"use client";

import { SignUpButton, SignInButton } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Heart,
  GitCompareArrows,
  MessageCircle,
  Search,
  Send,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { SignUpWallFeature } from "@/hooks/useSignUpWall";

const WALL_CONFIG: Record<
  SignUpWallFeature,
  {
    icon: typeof Heart;
    title: string;
    description: string;
    benefits: string[];
  }
> = {
  save: {
    icon: Heart,
    title: "Save your favourite schools",
    description:
      "Create a free account to save schools to your shortlist and access them anytime.",
    benefits: [
      "Build your school shortlist",
      "Get personalised recommendations",
      "Track your enquiry responses",
    ],
  },
  compare: {
    icon: GitCompareArrows,
    title: "Compare schools side-by-side",
    description:
      "Sign up to unlock AI-powered school comparisons with detailed analysis.",
    benefits: [
      "Detailed side-by-side analysis",
      "AI-generated insights & verdict",
      "Share comparisons with family",
    ],
  },
  enquiry: {
    icon: Send,
    title: "Send enquiries to schools",
    description:
      "Create a free account to contact schools and track all your enquiries in one place.",
    benefits: [
      "Track enquiry responses",
      "Get follow-up reminders",
      "Manage all communications",
    ],
  },
  chat: {
    icon: MessageCircle,
    title: "Chat with our AI advisor",
    description:
      "Sign up for personalised school recommendations from our AI-powered advisor.",
    benefits: [
      "Personalised recommendations",
      "Multi-turn conversation",
      "Based on your preferences",
    ],
  },
  "ai-search": {
    icon: Search,
    title: "Unlock AI-powered search",
    description:
      "Sign up to use our AI to find the perfect school for your child.",
    benefits: [
      "Natural language search",
      "Smart school matching",
      "Results tailored to you",
    ],
  },
};

interface SignUpWallModalProps {
  open: boolean;
  onClose: () => void;
  feature: SignUpWallFeature;
}

export default function SignUpWallModal({
  open,
  onClose,
  feature,
}: SignUpWallModalProps) {
  const config = WALL_CONFIG[feature];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl border-0 p-0 sm:max-w-[420px]">
        {/* Top gradient strip */}
        <div
          className="relative flex flex-col items-center px-6 pb-6 pt-8"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,107,53,0.08), rgba(251,191,36,0.06))",
          }}
        >
          {/* Decorative orb */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#FF6B35]/10 blur-3xl" />

          {/* Icon */}
          <div
            className="relative flex size-14 items-center justify-center rounded-2xl shadow-lg"
            style={{
              background: "linear-gradient(135deg, #FF6B35, #F59E0B)",
            }}
          >
            <Icon className="size-6 text-white" />
            <Sparkles className="absolute -right-1.5 -top-1.5 size-4 text-[#FBBF24]" />
          </div>

          <DialogHeader className="mt-4 items-center">
            <DialogTitle className="text-center text-xl font-bold text-gray-900">
              {config.title}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-center text-sm leading-relaxed text-gray-500">
              {config.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Benefits */}
        <div className="px-6 py-5">
          <ul className="space-y-3">
            {config.benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm text-gray-700">
                <div className="flex size-5 flex-shrink-0 items-center justify-center rounded-full bg-[#FF6B35]/10">
                  <Check className="size-3 text-[#FF6B35]" strokeWidth={3} />
                </div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA section */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-5">
          <SignUpButton mode="redirect">
            <button
              type="button"
              className="group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #FF6B35 0%, #FF8F5E 100%)",
                boxShadow: "0 4px 14px rgba(255, 107, 53, 0.3)",
              }}
            >
              Get Started Free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </SignUpButton>

          <p className="mt-3 text-center text-xs text-gray-400">
            Already have an account?{" "}
            <SignInButton mode="redirect">
              <button
                type="button"
                className="font-medium text-[#FF6B35] hover:underline"
              >
                Sign in
              </button>
            </SignInButton>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
