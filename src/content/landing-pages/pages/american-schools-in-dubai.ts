import type { LandingPageConfig } from "../types";

export const config: LandingPageConfig = {
  slug: "american-schools-in-dubai",
  title: "Best American Schools in Dubai (2026) | mydscvr.ai",
  metaDescription:
    "Find top American curriculum schools in Dubai. AP courses, SAT prep, KHDA ratings, fees, and parent reviews. College-prep education for every budget.",
  h1: "Best American Schools in Dubai",
  pageType: "curriculum",

  filters: {
    emirate: "dubai",
    curriculum: "American",
  },

  introContent: `
    <h2>American Curriculum Schools in Dubai</h2>
    <p>
      American curriculum schools in Dubai follow a US-based educational framework, typically aligned
      with Common Core State Standards or individual state standards such as those from California,
      Massachusetts, or New York. These schools offer a familiar structure for American families
      relocating to Dubai, but they also attract a broad international community drawn to the
      flexibility and college-prep focus of the American system.
    </p>
    <p>
      Dubai is home to approximately 25 American curriculum schools, with fees ranging from around
      AED 20,000 at the entry level to over AED 90,000 at premium institutions. Every school is
      inspected annually by <a href="/schools">KHDA</a>, providing parents with an independent quality
      assessment alongside the school's own US accreditation.
    </p>
    <h3>How the American Curriculum Works</h3>
    <p>
      The American system divides education into Elementary (KG–Grade 5), Middle School (Grades 6–8),
      and High School (Grades 9–12). Students earn a US High School Diploma by accumulating credits
      across required and elective subjects — a structure that allows significant personalisation in
      the upper years.
    </p>
    <ul>
      <li><strong>Advanced Placement (AP)</strong> — Top American schools in Dubai offer 15–25 AP courses. Strong AP scores (4 or 5) can earn college credit at US universities, reducing time and cost at university.</li>
      <li><strong>SAT/ACT preparation</strong> — Most schools integrate SAT or ACT prep into the Grade 11–12 curriculum. Some schools serve as official SAT test centres.</li>
      <li><strong>GPA system</strong> — Continuous assessment through a GPA (Grade Point Average) system means no single high-stakes final exam determines a student's fate.</li>
      <li><strong>Extracurriculars</strong> — American schools typically offer extensive extracurricular programmes, from varsity sports to Model UN, debate, robotics, and performing arts.</li>
      <li><strong>US accreditation</strong> — Look for accreditation from bodies such as MSA-CESS, AdvancED (Cognia), or NEASC, which confirms the school meets US educational standards.</li>
    </ul>
    <h3>University Pathways from American Schools</h3>
    <p>
      The American High School Diploma with AP courses is accepted by universities worldwide. Students
      from Dubai's American schools regularly gain admission to Ivy League universities, top UK institutions,
      and leading universities across Canada, Australia, and the UAE. The holistic admissions approach —
      which values extracurriculars, leadership, and community service alongside grades — plays to the
      strengths of the American system.
    </p>
    <p>
      Explore every American school in Dubai below. Compare KHDA ratings, AP course offerings, fee
      structures, and parent reviews to find the right fit for your family.
    </p>
  `,

  faqs: [
    {
      question: "How many American schools are there in Dubai?",
      answer:
        "Dubai has approximately 25 American curriculum schools. These range from large all-through campuses (KG to Grade 12) to smaller schools focused on specific age groups. Several also offer dual American/IB pathways in the upper grades.",
    },
    {
      question: "What are the fees for American schools in Dubai?",
      answer:
        "Annual fees at American schools in Dubai range from around AED 20,000 for early years to over AED 90,000 at premium institutions. The average across all grade levels falls between AED 35,000 and AED 55,000. Fees tend to increase at the High School level, particularly when AP courses are offered.",
    },
    {
      question: "What is the difference between an American school and a British school?",
      answer:
        "The main differences are structure and assessment. American schools use continuous GPA-based assessment with AP exams in Grades 11–12, while British schools build toward GCSE and A-Level exams. American schools offer broader subject choice and more electives; British schools encourage earlier specialisation. Both are well-accepted by international universities.",
    },
    {
      question: "Do American schools in Dubai offer the IB Diploma?",
      answer:
        "Some American schools in Dubai offer a dual pathway — students can choose between the American High School Diploma with AP courses or the IB Diploma Programme in Grades 11–12. This gives families flexibility without needing to switch schools. Check individual school profiles for specific programme offerings.",
    },
    {
      question: "Are American school qualifications accepted by UK universities?",
      answer:
        "Yes. UK universities, including Russell Group institutions, accept the American High School Diploma with AP courses. Most require a minimum of 3 AP scores at grade 4 or 5, though requirements vary by university and course. The SAT is also accepted but not always required by UK institutions.",
    },
  ],

  relatedSlugs: [
    "british-schools-in-dubai",
    "ib-schools-in-dubai",
    "american-schools-in-abu-dhabi",
    "outstanding-schools-in-dubai",
  ],
};
