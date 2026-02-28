import type { LandingPageConfig } from "../types";

export const config: LandingPageConfig = {
  slug: "nurseries-in-dubai",
  title: "Best Nurseries in Dubai (2026) | mydscvr.ai",
  metaDescription:
    "Compare KHDA-regulated nurseries in Dubai. EYFS, Montessori & Reggio Emilia options. Fees, ratings, locations, and parent reviews for ages 0-4.",
  h1: "Best Nurseries in Dubai",
  pageType: "curriculum",

  filters: {
    emirate: "dubai",
    type: "nursery",
  },

  introContent: `
    <h2>Early Years Education in Dubai: A Parent's Guide</h2>
    <p>
      Nursery education in Dubai is regulated by KHDA for children aged 45 days to 4 years.
      The emirate has over 200 licensed nurseries offering a range of early years curricula
      including the British Early Years Foundation Stage (EYFS), Montessori, Reggio Emilia,
      and various play-based and bilingual approaches. With so many options, finding the right
      nursery is one of the first and most important educational decisions Dubai parents make.
    </p>
    <p>
      Unlike schools, nurseries in Dubai can operate without a specific national curriculum
      affiliation, giving them more flexibility in their pedagogical approach. However, all
      licensed nurseries must meet KHDA standards for health and safety, staffing ratios,
      and learning environments. KHDA conducts regular inspections and publishes nursery
      ratings to help parents make informed choices.
    </p>
    <h3>Popular Nursery Curricula in Dubai</h3>
    <ul>
      <li><strong>EYFS (Early Years Foundation Stage)</strong> — The most common framework in Dubai nurseries, imported from the UK. Covers seven areas of learning through play-based activities, with clear developmental milestones tracked for each child. Ideal if your child will transition to a British curriculum school.</li>
      <li><strong>Montessori</strong> — Child-led learning with specially designed materials across practical life, sensorial, language, mathematics, and culture. Mixed-age classrooms and uninterrupted work periods are hallmarks. Appeals to parents who value independence and self-directed exploration.</li>
      <li><strong>Reggio Emilia</strong> — An Italian-inspired approach emphasising project-based learning, creative expression, and the environment as a "third teacher." Less structured than EYFS or Montessori, with a strong emphasis on documentation and child-led inquiry.</li>
      <li><strong>Play-based / bilingual</strong> — Many nurseries offer hybrid approaches combining elements of different frameworks, often with bilingual instruction (English/Arabic, English/French, or English/Mandarin). These can work well for multilingual families.</li>
    </ul>
    <h3>What to Consider When Choosing a Nursery</h3>
    <p>
      Location matters more for nurseries than for schools. A nursery close to home or to
      a parent's workplace reduces daily stress for both child and family. Beyond proximity,
      evaluate the nursery's adult-to-child ratio (KHDA mandates specific ratios by age group),
      outdoor play space, meal provision, and the qualifications of the early years practitioners.
    </p>
    <p>
      Fees for Dubai nurseries typically range from AED 15,000 to AED 55,000 per year for
      full-day programmes, with half-day options and flexible schedules available at many
      locations. Some nurseries offer sibling discounts of 5–15%. Most charge registration
      and material fees on top of tuition.
    </p>
    <p>
      Browse KHDA-regulated nurseries in Dubai below. Each listing includes ratings, fees,
      curriculum details, and <a href="/schools">parent reviews</a> to help you find the
      right early years setting for your child.
    </p>
  `,

  faqs: [
    {
      question: "At what age can my child start nursery in Dubai?",
      answer:
        "Dubai nurseries accept children from as young as 45 days old. Most nurseries offer infant care (45 days to 12 months), toddler programmes (1-2 years), and pre-school programmes (2-4 years). Children typically move from nursery to FS1 (Foundation Stage 1 / Pre-K) at a school when they turn 3 or 4, depending on the school's age cut-off policy.",
    },
    {
      question: "How much do nurseries in Dubai cost?",
      answer:
        "Full-day nursery fees in Dubai range from approximately AED 15,000 to AED 55,000 per year. Infant care (under 1 year) is typically the most expensive due to lower staff-to-child ratios required. Half-day and flexible schedules are available at lower costs. Premium nurseries in areas like Jumeirah and Downtown can charge AED 60,000+. Registration fees (AED 500–2,000) and material fees are usually additional.",
    },
    {
      question: "Are Dubai nurseries regulated?",
      answer:
        "Yes. All nurseries in Dubai must be licensed by KHDA. The regulator sets standards for health and safety, staffing ratios, premises, and learning environments. KHDA conducts regular inspections and publishes nursery ratings. Operating an unlicensed nursery is illegal in Dubai. Always verify a nursery's KHDA license before enrolling your child.",
    },
    {
      question: "What is the best nursery curriculum?",
      answer:
        "There is no single best curriculum — it depends on your child's temperament and your family's educational philosophy. EYFS is the most structured and widely adopted, making it the easiest pathway into British schools. Montessori suits independent, curious children who thrive with self-directed learning. Reggio Emilia appeals to creative, project-oriented families. Visit nurseries using different approaches to see which environment feels right for your child.",
    },
    {
      question: "What adult-to-child ratios should I expect?",
      answer:
        "KHDA mandates minimum ratios based on age: 1:4 for infants (under 1 year), 1:6 for toddlers (1-2 years), and 1:8 for pre-schoolers (2-4 years). Top-rated nurseries often exceed these minimums. Ask about actual ratios during your visit, as they directly impact the amount of individual attention your child receives.",
    },
    {
      question: "Should my child's nursery match their future school curriculum?",
      answer:
        "It is helpful but not essential. A child in an EYFS nursery will transition most smoothly into a British curriculum school, as the developmental frameworks align. However, children are highly adaptable at this age. A Montessori nursery child can transition successfully into a British, IB, or American school at age 4. Focus on the quality of the nursery experience rather than forcing curriculum alignment at this early stage.",
    },
  ],

  relatedSlugs: [
    "british-schools-in-dubai",
    "schools-with-sen-support-dubai",
    "affordable-schools-under-30000-aed",
    "schools-in-jumeirah",
  ],
};
