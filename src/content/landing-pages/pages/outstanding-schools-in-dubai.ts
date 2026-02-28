import type { LandingPageConfig } from "../types";

export const config: LandingPageConfig = {
  slug: "outstanding-schools-in-dubai",
  title: "Outstanding KHDA Schools in Dubai (2026) | mydscvr.ai",
  metaDescription:
    "Browse all KHDA Outstanding-rated schools in Dubai. Inspection criteria, what sets them apart, fees, and parent reviews. Only the top-rated schools.",
  h1: "Outstanding Schools in Dubai",
  pageType: "rating",

  filters: {
    emirate: "dubai",
    rating: "Outstanding",
  },

  introContent: `
    <h2>What Does a KHDA Outstanding Rating Mean?</h2>
    <p>
      Outstanding is the highest rating awarded by the Knowledge and Human Development Authority (KHDA),
      Dubai's private education regulator. Schools do not apply for this rating — they earn it through
      a rigorous annual inspection conducted by teams of trained inspectors who spend multiple days
      observing lessons, reviewing student work, interviewing staff and parents, and analysing academic
      outcomes.
    </p>
    <p>
      Fewer than 20% of Dubai's private schools hold the Outstanding rating. These schools consistently
      demonstrate exceptional quality across every dimension KHDA measures — from student achievement
      and progress to personal development, teaching quality, curriculum delivery, school leadership,
      and governance. Achieving Outstanding in one area is not enough; the school must excel across
      the board.
    </p>
    <h3>How KHDA Inspections Work</h3>
    <p>
      KHDA inspections follow the Dubai Schools Inspection Framework (DSIF), which evaluates schools
      across six performance standards. Each standard receives its own rating (Outstanding, Very Good,
      Good, Acceptable, or Weak), and the overall school rating reflects the collective performance.
    </p>
    <ul>
      <li><strong>Student achievement</strong> — Attainment and progress in core subjects (English, mathematics, science, Arabic). External exam results (GCSE, IB, AP, CBSE) are benchmarked against international standards.</li>
      <li><strong>Personal and social development</strong> — Student wellbeing, behaviour, attendance, attitudes to learning, community involvement, and understanding of Islamic values and UAE culture.</li>
      <li><strong>Teaching and assessment</strong> — Lesson quality, differentiation for varying abilities, use of assessment data to guide learning, and teacher-student interactions.</li>
      <li><strong>Curriculum</strong> — Breadth, balance, and how well the curriculum is adapted to meet the needs of all learners, including gifted students and those with special educational needs.</li>
      <li><strong>School leadership and management</strong> — Vision, self-evaluation accuracy, strategic direction, staffing, facilities, and governance.</li>
      <li><strong>Wellbeing and inclusion</strong> — A dimension KHDA now rates separately, covering safeguarding, health, SEN provision, and overall student welfare.</li>
    </ul>
    <h3>Are Outstanding Schools Worth the Fees?</h3>
    <p>
      Outstanding schools in Dubai span a wide fee range. While many sit in the premium bracket
      (AED 50,000–90,000+), a number of Indian and mid-range schools have also earned this rating at
      far lower price points. The rating is awarded on quality of education, not on fee level —
      meaning some of the best value in Dubai education comes from Outstanding schools with moderate
      fees. Compare fee data alongside ratings below to find the strongest value match.
    </p>
  `,

  faqs: [
    {
      question: "How many Outstanding schools are there in Dubai?",
      answer:
        "Dubai has approximately 30–35 schools rated Outstanding by KHDA, out of a total of nearly 220 private schools. The number fluctuates slightly each year as schools may move up from Very Good or, in rare cases, drop from Outstanding following a weaker inspection cycle.",
    },
    {
      question: "Which curricula have the most Outstanding schools?",
      answer:
        "British curriculum schools hold the largest share of Outstanding ratings, followed by IB and Indian schools. American curriculum schools also feature, though in smaller numbers. The curriculum itself does not determine the rating — KHDA evaluates execution and outcomes regardless of framework.",
    },
    {
      question: "How often are KHDA inspections conducted?",
      answer:
        "KHDA inspects every private school in Dubai annually. Inspections typically take place between October and March, with results published in the spring. The inspection team usually spends 3–5 days in the school, observing lessons, reviewing data, and speaking with students, parents, and staff.",
    },
    {
      question: "Can a school lose its Outstanding rating?",
      answer:
        "Yes. KHDA ratings are reassessed every year. A school rated Outstanding must demonstrate sustained excellence to maintain that status. If standards slip — due to staff turnover, rapid expansion, or declining results — the school may be downgraded to Very Good. This has happened to several schools in previous cycles.",
    },
    {
      question: "Are Outstanding schools harder to get into?",
      answer:
        "Generally, yes. Outstanding schools tend to have higher demand and may maintain waitlists for popular year groups, particularly FS1/FS2 (Reception), Year 1, and Year 7. Some require entrance assessments. Applying early — ideally 12 months before the desired start date — improves your chances significantly.",
    },
    {
      question: "Do Outstanding schools always have the highest fees?",
      answer:
        "No. While many Outstanding schools are in the premium fee bracket (AED 50,000+), several Indian curriculum schools and mid-range British schools have earned Outstanding ratings with fees below AED 30,000 per year. KHDA rates on quality of education, not on facilities or price. This makes the rating a valuable tool for identifying high-quality, affordable options.",
    },
  ],

  relatedSlugs: [
    "very-good-schools-in-dubai",
    "british-schools-in-dubai",
    "premium-schools-above-50000-aed",
    "ib-schools-in-dubai",
  ],
};
