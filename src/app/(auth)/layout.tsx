import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <Image
          src="/logo.webp"
          alt="mydscvr.ai"
          width={36}
          height={36}
          className="size-9"
        />
        <span className="text-2xl font-bold tracking-tight text-gradient-brand">
          mydscvr.ai
        </span>
      </Link>
      {children}
    </div>
  );
}
