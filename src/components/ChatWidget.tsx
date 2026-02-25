'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SignUpWallModal from '@/components/SignUpWallModal';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  'Best British schools in Dubai Marina?',
  'Affordable nurseries with SEN support?',
  'IB schools under AED 60,000/year?',
];

export default function ChatWidget() {
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [wallOpen, setWallOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      if (!isSignedIn) {
        setWallOpen(true);
        return;
      }

      const userMsg: Message = { role: 'user', content: trimmed };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput('');
      setLoading(true);

      try {
        const res = await fetch('/api/search/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            session_id: sessionId,
          }),
        });

        if (!res.ok) throw new Error('Chat failed');
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.message },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              "I'm sorry, I couldn't process that. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, sessionId, isSignedIn]
  );

  return (
    <>
      <SignUpWallModal open={wallOpen} onClose={() => setWallOpen(false)} feature="chat" />

      {/* Floating button with pulse ring */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #FF6B35, #F59E0B)',
              boxShadow: '0 4px 20px rgba(255, 107, 53, 0.35)',
            }}
            aria-label="Open AI school advisor chat"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 animate-ping rounded-full bg-[#FF6B35]/30" />
            <MessageCircle className="relative size-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{
                background: 'linear-gradient(135deg, #FF6B35, #F59E0B)',
              }}
            >
              <Sparkles className="size-5 text-white" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  School Advisor
                </p>
                <p className="text-[11px] text-white/80">
                  AI-powered by mydscvr.ai
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="Close chat"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {messages.length === 0 && (
                <div className="space-y-3 pt-2">
                  <p className="text-sm text-gray-500">
                    Hi! I&apos;m your Dubai school advisor. Tell me what you&apos;re looking
                    for and I&apos;ll recommend schools.
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-400">
                      Try asking:
                    </p>
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="block w-full rounded-xl border border-gray-200 px-3 py-2 text-left text-xs text-gray-700 transition-colors hover:border-[#FF6B35] hover:bg-[#FF6B35]/5"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`mb-3 flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'rounded-br-md text-white'
                        : 'rounded-bl-md bg-gray-100 text-gray-800'
                    }`}
                    style={
                      msg.role === 'user'
                        ? {
                            background:
                              'linear-gradient(135deg, #FF6B35, #F59E0B)',
                          }
                        : undefined
                    }
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-gray-900">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({ children }) => (
                              <div className="my-2 overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full border-collapse text-xs">{children}</table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead className="bg-gray-50 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                                {children}
                              </thead>
                            ),
                            tbody: ({ children }) => (
                              <tbody className="divide-y divide-gray-100">{children}</tbody>
                            ),
                            tr: ({ children }) => (
                              <tr className="hover:bg-gray-50/50">{children}</tr>
                            ),
                            th: ({ children }) => (
                              <th className="border-b border-gray-200 px-2 py-1.5 text-left font-semibold text-gray-700">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="px-2 py-1.5 text-gray-600">{children}</td>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="mb-3 flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-gray-100 px-3.5 py-2.5 text-sm text-gray-500">
                    <Loader2 className="size-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t px-3 py-2.5">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Ask about schools..."
                  disabled={loading}
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35] disabled:opacity-50"
                />
                <Button
                  size="sm"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="text-white hover:opacity-90 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B35, #F59E0B)',
                  }}
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
