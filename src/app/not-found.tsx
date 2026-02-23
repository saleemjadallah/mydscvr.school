import Link from "next/link";
import { Search, Home, GraduationCap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mx-auto max-w-md text-center">
        {/* 404 number */}
        <p
          className="text-8xl font-bold tracking-tight"
          style={{
            background: "linear-gradient(135deg, #FF6B35, #F59E0B)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </p>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Page not found
        </h1>
        <p className="mt-3 text-base text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #FF6B35, #F59E0B)",
            }}
          >
            <Home className="size-4" />
            Go Home
          </Link>
          <Link
            href="/schools"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            <Search className="size-4" />
            Search Schools
          </Link>
        </div>
      </div>
    </div>
  );
}
