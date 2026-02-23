import { Sparkles } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AIExplanationProps {
  text: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AIExplanation({ text }: AIExplanationProps) {
  if (!text) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200/60 px-5 py-4">
      <Sparkles className="mt-0.5 size-5 flex-shrink-0 text-[#FF6B35]" />
      <p className="text-sm leading-relaxed text-amber-900">{text}</p>
    </div>
  );
}
