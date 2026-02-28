"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface LandingFAQProps {
  faqs: { question: string; answer: string }[];
}

export default function LandingFAQ({ faqs }: LandingFAQProps) {
  if (faqs.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <h2 className="mb-6 font-display text-xl font-semibold text-gray-900 sm:text-2xl">
        Frequently Asked Questions
      </h2>
      <div className="max-w-3xl">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-xl border border-gray-200 bg-white px-5 data-[state=open]:shadow-sm"
            >
              <AccordionTrigger className="text-left text-sm font-semibold text-gray-900 hover:text-[#FF6B35] hover:no-underline sm:text-base [&[data-state=open]]:text-[#FF6B35]">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
