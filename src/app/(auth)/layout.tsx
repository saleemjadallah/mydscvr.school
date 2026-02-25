import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50 px-4">
      {/* Decorative background orbs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[#FF6B35]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-[#F59E0B]/5 blur-3xl" />

      <Link
        href="/"
        className="relative mb-8 flex items-center gap-2.5 transition-opacity hover:opacity-80"
      >
        <Image
          src="/logo.webp"
          alt="mydscvr.ai"
          width={40}
          height={40}
          className="size-10"
        />
        <span className="text-2xl font-bold tracking-tight text-gradient-brand">
          mydscvr.ai
        </span>
      </Link>

      <div className="relative w-full max-w-md">{children}</div>

      <p className="relative mt-8 text-center text-xs text-gray-400">
        AI-powered school discovery for Dubai families
      </p>
    </div>
  );
}
