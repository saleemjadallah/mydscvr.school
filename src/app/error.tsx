"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Icon */}
        <div
          className="mx-auto flex size-20 items-center justify-center rounded-full"
          style={{ background: "rgba(255, 107, 53, 0.1)" }}
        >
          <AlertTriangle className="size-10" style={{ color: "#FF6B35" }} />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Something went wrong
        </h1>
        <p className="mt-3 text-base text-gray-500">
          We ran into an unexpected error. This has been logged and
          we&apos;ll look into it. Please try again.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #FF6B35, #F59E0B)",
            }}
          >
            <RotateCcw className="size-4" />
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            <Home className="size-4" />
            Go Home
          </a>
        </div>

        {/* Error digest (for support) */}
        {error.digest && (
          <p className="mt-6 text-xs text-gray-400">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
