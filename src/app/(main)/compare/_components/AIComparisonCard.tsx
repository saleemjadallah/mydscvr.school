'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { streamComparison } from '@/lib/api';

interface AIComparisonCardProps {
  schoolIds: string[];
  query?: string;
  /** If provided, render this static text instead of streaming */
  staticText?: string | null;
}

export default function AIComparisonCard({
  schoolIds,
  query,
  staticText,
}: AIComparisonCardProps) {
  const [text, setText] = useState(staticText ?? '');
  const [streaming, setStreaming] = useState(false);
  const [done, setDone] = useState(!!staticText);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(() => {
    if (staticText) return; // don't stream if we already have text
    setText('');
    setStreaming(true);
    setDone(false);
    setError(null);

    abortRef.current = streamComparison(schoolIds, query, {
      onText: (delta) => {
        setText((prev) => prev + delta);
      },
      onDone: () => {
        setStreaming(false);
        setDone(true);
      },
      onError: (msg) => {
        setStreaming(false);
        setError(msg);
      },
    });
  }, [schoolIds, query, staticText]);

  useEffect(() => {
    if (!staticText && schoolIds.length >= 2) {
      startStream();
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [startStream, staticText, schoolIds.length]);

  // Update if staticText changes (e.g., from cache)
  useEffect(() => {
    if (staticText) {
      setText(staticText);
      setDone(true);
      setStreaming(false);
    }
  }, [staticText]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #6B21A8 0%, #A855F7 50%, #FF6B35 100%)',
      }}
    >
      {/* Inner card with slight transparency */}
      <div className="m-[1px] rounded-2xl bg-white/[0.97] p-5 sm:p-6">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-[#FF6B35]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900">
              AI Comparison
            </span>
            {streaming && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-purple-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                Analyzing...
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        {text ? (
          <div className="prose prose-sm max-w-none text-gray-700 prose-headings:text-gray-900 prose-strong:text-gray-900 prose-li:marker:text-purple-500">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ children }) => (
                  <div className="my-4 overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full border-collapse text-sm">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-gray-100">{children}</tbody>
                ),
                tr: ({ children }) => (
                  <tr className="transition-colors hover:bg-gray-50/50">{children}</tr>
                ),
                th: ({ children }) => (
                  <th className="border-b border-gray-200 px-3 py-2.5 text-left font-semibold text-gray-700">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2.5 text-gray-600">{children}</td>
                ),
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={startStream}
              className="mt-2 text-xs font-medium text-red-700 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        ) : streaming ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
            <span className="text-sm text-gray-400">
              Generating AI analysis...
            </span>
          </div>
        ) : null}

        {/* Streaming cursor */}
        {streaming && text && (
          <span className="inline-block h-4 w-0.5 animate-pulse bg-purple-500" />
        )}
      </div>
    </motion.div>
  );
}
