import type { LandingPageConfig } from "../types";

export const config: LandingPageConfig = {
  slug: "british-schools-in-dubai",
  title: "Best British Schools in Dubai (2026) | mydscvr.ai",
  metaDescription:
    "Compare the best British curriculum schools in Dubai. KHDA ratings, fees from AED 15,000, IGCSE & A-Level results, and parent reviews all in one place.",
  h1: "Best British Schools in Dubai",
  pageType: "curriculum",

  filters: {
    emirate: "dubai",
    curriculum: "British",
  },

  introContent: `
    <h2>Why Choose a British Curriculum School in Dubai?</h2>
    <p>
      British curriculum schools are the most popular choice among Dubai's expat families, and for good reason.
      Following the English National Curriculum, these schools offer a structured pathway from Early Years Foundation
      Stage (EYFS) through GCSEs and A-Levels — qualifications recognised by universities worldwide.
    </p>
    <p>
      Dubai is home to over 60 British schools, more than any other city outside the UK. Schools range from
      affordable options starting at AED 15,000 per year to premium institutions charging above AED 80,000.
      The <a href="/schools">KHDA inspects every private school</a> in Dubai annually, giving parents a trusted
      quality benchmark that simply doesn't exist in most other cities.
    </p>
    <h3>What to Look for in a British School</h3>
    <ul>
      <li><strong>KHDA rating</strong> — Outstanding and Very Good schools consistently deliver the strongest GCSE and A-Level results.</li>
      <li><strong>Exam board</strong> — Most schools use Edexcel or Cambridge (CIE). Some offer both, giving students flexibility.</li>
      <li><strong>University placement</strong> — Ask for Oxbridge / Russell Group acceptance rates and overall university destination data.</li>
      <li><strong>Pastoral care</strong> — Look for schools with dedicated wellbeing programmes, which KHDA now rates separately.</li>
      <li><strong>Fees vs value</strong> — Higher fees don't always mean better outcomes. Compare KHDA ratings against fee brackets for the best value.</li>
    </ul>
    <p>
      Use the school cards below to compare KHDA ratings, annual fees, and Google reviews for every British school in Dubai.
      Click any school to see the full profile, fee breakdown by grade, and inspection reports.
    </p>
  `,

  faqs: [
    {
      question: "How many British schools are there in Dubai?",
      answer:
        "Dubai has over 60 schools following the British / English National Curriculum, making it the most widely offered curriculum in the emirate. These range from small primary-only schools to large all-through institutions offering EYFS to A-Levels.",
    },
    {
      question: "What are the fees for British schools in Dubai?",
      answer:
        "Annual tuition fees for British schools in Dubai range from approximately AED 15,000 for early years at budget-friendly schools to over AED 90,000 at premium institutions. The average fee across all British schools is around AED 35,000–45,000 per year. KHDA regulates maximum fee increases annually.",
    },
    {
      question: "Which British schools in Dubai are rated Outstanding by KHDA?",
      answer:
        "Several British schools hold the KHDA Outstanding rating, including GEMS Wellington International, Dubai College, Jumeirah English Speaking School (JESS), Kings' School Al Barsha, and Repton School Dubai. These schools consistently deliver exceptional academic results and pastoral care.",
    },
    {
      question: "What is the difference between IGCSE and GCSE in Dubai?",
      answer:
        "Most British schools in Dubai offer IGCSEs (International GCSEs) rather than standard UK GCSEs. IGCSEs are designed for an international audience and are offered by Cambridge (CIE) and Edexcel exam boards. They carry the same weight as GCSEs for UK and international university admissions.",
    },
    {
      question: "Can my child transfer from a British school in the UK to one in Dubai?",
      answer:
        "Yes. Because Dubai's British schools follow the same National Curriculum and exam boards, transfers are generally straightforward. Schools will assess your child's current level and may request recent school reports. Mid-year transfers are possible but subject to availability.",
    },
    {
      question: "Do British schools in Dubai accept children of all nationalities?",
      answer:
        "Yes, all British schools in Dubai are open to children of any nationality. Class sizes and admission criteria vary by school. Some highly rated schools maintain waitlists, so it's advisable to apply early — especially for FS1/FS2 (Reception) and Year 7 entry points.",
    },
  ],

  relatedSlugs: [
    "ib-schools-in-dubai",
    "british-schools-in-abu-dhabi",
    "outstanding-schools-in-dubai",
    "british-schools-in-jumeirah",
  ],
};
