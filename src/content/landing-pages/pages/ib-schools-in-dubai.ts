import type { LandingPageConfig } from "../types";

export const config: LandingPageConfig = {
  slug: "ib-schools-in-dubai",
  title: "Best IB Schools in Dubai (2026) | mydscvr.ai",
  metaDescription:
    "Find the top IB World Schools in Dubai. Compare IB Diploma results, KHDA ratings, fees, and parent reviews. PYP, MYP & DP programmes covered.",
  h1: "Best IB Schools in Dubai",
  pageType: "curriculum",

  filters: {
    emirate: "dubai",
    curriculum: "IB",
  },

  introContent: `
    <h2>International Baccalaureate Schools in Dubai</h2>
    <p>
      The International Baccalaureate (IB) is widely regarded as one of the most rigorous and globally respected
      curricula available. Dubai is home to a growing number of authorised IB World Schools offering the
      Primary Years Programme (PYP), Middle Years Programme (MYP), and the prestigious IB Diploma Programme (DP).
    </p>
    <p>
      IB schools in Dubai tend to attract internationally mobile families who value critical thinking, research skills,
      and a holistic education. The IB Diploma is accepted by universities in over 150 countries, including top-tier
      institutions in the UK, US, Canada, Australia, and Europe.
    </p>
    <h3>Key Features of IB Schools</h3>
    <ul>
      <li><strong>Inquiry-based learning</strong> — students are encouraged to ask questions, investigate, and construct their own understanding.</li>
      <li><strong>Creativity, Activity, Service (CAS)</strong> — the DP requires students to engage in creative, physical, and community service activities.</li>
      <li><strong>Extended Essay</strong> — a 4,000-word independent research project that prepares students for university-level work.</li>
      <li><strong>Theory of Knowledge (TOK)</strong> — a unique course that explores how we know what we know.</li>
      <li><strong>International mindedness</strong> — IB schools emphasise global awareness, cultural respect, and multilingualism.</li>
    </ul>
    <p>
      Browse the top-rated IB schools in Dubai below. Each profile includes KHDA inspection results, average
      IB Diploma scores (where published), fee structures, and authentic parent reviews.
    </p>
  `,

  faqs: [
    {
      question: "How many IB schools are in Dubai?",
      answer:
        "Dubai has approximately 20–25 authorised IB World Schools. Some offer the full IB continuum (PYP, MYP, DP), while others offer only one or two programmes. A few schools combine IB with another curriculum (e.g., British/IB dual pathway).",
    },
    {
      question: "What are the average IB fees in Dubai?",
      answer:
        "IB schools in Dubai generally range from AED 40,000 to over AED 95,000 per year. IB schools tend to be positioned in the mid-to-premium fee bracket due to the extensive resources and trained staff required for IB authorisation.",
    },
    {
      question: "What IB Diploma scores do Dubai schools achieve?",
      answer:
        "Top IB schools in Dubai report average Diploma scores of 34–38 out of 45, which is above the global average of approximately 30. Some schools achieve pass rates above 95%, with multiple students scoring 40+ points.",
    },
    {
      question: "Is the IB better than the British curriculum?",
      answer:
        "Neither is objectively better — it depends on the child. The IB is broader (students study 6 subjects across all disciplines) while A-Levels allow deeper specialisation (typically 3–4 subjects). IB suits self-motivated learners who enjoy research and writing; A-Levels suit students who already know their university direction.",
    },
    {
      question: "Can students switch from British to IB mid-school?",
      answer:
        "Yes, many families switch at the start of Year 11 (from GCSE to MYP Year 5) or Year 12 (from A-Levels to IB Diploma). Schools will assess readiness. The transition is smoother if the student has strong study skills, as the IB workload is demanding across all subjects.",
    },
  ],

  relatedSlugs: [
    "british-schools-in-dubai",
    "ib-schools-in-abu-dhabi",
    "ib-schools-in-al-barsha",
    "outstanding-schools-in-dubai",
  ],
};
