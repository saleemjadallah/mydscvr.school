import type { Appearance } from "@clerk/types";

export const clerkAppearance: Appearance = {
  variables: {
    // Brand colors
    colorPrimary: "#FF6B35",
    colorDanger: "#EF4444",
    colorSuccess: "#10B981",
    colorWarning: "#F59E0B",
    colorText: "#111827",
    colorTextSecondary: "#6B7280",
    colorBackground: "#FFFFFF",
    colorInputBackground: "#F9FAFB",
    colorInputText: "#111827",

    // Typography
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontSize: "0.9375rem",

    // Shape
    borderRadius: "0.75rem",
    spacingUnit: "1rem",
  },

  elements: {
    // Card container
    card: "shadow-xl border border-gray-100 rounded-2xl",
    cardBox: "shadow-none",

    // Header
    headerTitle: "text-xl font-bold text-gray-900",
    headerSubtitle: "text-sm text-gray-500",

    // Social buttons (Apple, Google)
    socialButtonsBlockButton:
      "border border-gray-200 rounded-xl py-3 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all",
    socialButtonsBlockButtonText: "text-sm font-medium",

    // Divider
    dividerLine: "bg-gray-200",
    dividerText: "text-xs text-gray-400 uppercase tracking-wider",

    // Form fields
    formFieldLabel: "text-sm font-medium text-gray-700",
    formFieldInput:
      "rounded-xl border-gray-200 bg-gray-50 focus:border-[#FF6B35] focus:ring-[#FF6B35]/20 transition-all",
    formFieldHintText: "text-xs text-gray-400",

    // Primary button (Continue, Sign In, etc.)
    formButtonPrimary:
      "rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] text-white font-semibold py-3 shadow-md hover:shadow-lg hover:opacity-95 transition-all normal-case",

    // Links
    footerActionLink:
      "text-[#FF6B35] font-semibold hover:text-[#e55a2a] transition-colors",

    // Footer
    footerAction: "text-sm text-gray-500",
    footer: "bg-transparent",

    // OTP input
    otpCodeFieldInput:
      "border-gray-200 rounded-xl text-lg font-semibold focus:border-[#FF6B35] focus:ring-[#FF6B35]/20",

    // User button (avatar in header)
    avatarBox: "h-8 w-8 ring-2 ring-white shadow-sm",

    // UserProfile (Account tab)
    rootBox: "w-full",
    profileSectionPrimaryButton:
      "text-[#FF6B35] hover:text-[#e55a2a] font-medium",

    // Badges
    badge: "bg-[#FF6B35]/10 text-[#FF6B35] font-medium rounded-lg",

    // Alert
    alertText: "text-sm",

    // Identity preview
    identityPreviewEditButton:
      "text-[#FF6B35] hover:text-[#e55a2a] transition-colors",
  },

  layout: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    termsPageUrl: "https://mydscvr.ai/terms",
    privacyPageUrl: "https://mydscvr.ai/privacy",
    shimmer: true,
  },
};
