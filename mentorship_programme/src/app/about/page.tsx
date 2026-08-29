import MarkdownRenderer from "@/components/MarkdownRenderer";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold text-qosf-blue mb-8">About the Mentorship Programme</h1>
      <MarkdownRenderer content={`
The Quantum Open Source Foundation (QOSF) Mentorship Program connects quantum
computing enthusiasts with experienced mentors from academia and industry.

## Mission

Our mission is to lower the barrier to entry for contributing to open-source
quantum computing software. By pairing learners with mentors, we create a
supportive environment where participants can:

- Deepen their understanding of quantum computing
- Contribute to meaningful open-source projects
- Build professional networks in the quantum ecosystem
- Gain hands-on experience with quantum software tools

## How It Works

The program runs in cohorts. Each cohort follows a structured timeline:

1. **Application Period** — Mentees and mentors submit their applications
2. **Matching** — Based on research interests, timezone compatibility, and
   educational background, participants are paired
3. **Mentorship Period** — Pairs work together on an open-source project over
   several weeks
4. **Showcase** — Completed projects are presented to the community

## For Mentees

If you are passionate about quantum computing and want to work on real
open-source projects with expert guidance, this program is for you.

**Requirements:**
- Basic understanding of quantum computing concepts
- Programming experience (Python recommended)
- Commitment to dedicate 5-10 hours per week

## For Mentors

If you have expertise in quantum computing and want to give back to the
community, we welcome you as a mentor.

**Requirements:**
- Experience in quantum computing research or development
- Willingness to commit 1-2 hours per week per mentee
- Passion for teaching and mentoring

## Past Cohorts

- [Cohort 9 Showcase](/archive/mentorship_cohort_9) — 24 completed projects
- Previous cohorts available in the [archive](/archive)
      `} />
    </div>
  );
}