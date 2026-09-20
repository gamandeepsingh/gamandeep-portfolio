import type { Education } from "@/features/portfolio/types/education"

export const EDUCATION: Education[] = [
  {
    id: "solana-turbine",
    school: "Solana Turbine",
    degree: "Builder Cohort — Q2 2026",
    fieldOfStudy: "Solana Program Development",
    period: {
      start: "04.2026",
      end: "06.2026",
    },
    description: `- Selected for [Turbin3](https://turbin3.org)'s Q2 2026 builder cohort, an intensive program on production-grade Solana development.
- Wrote on-chain programs in Rust with Anchor: PDAs, CPIs, token programs and vault/escrow patterns.
- Shipped a capstone dApp end to end — program, tests, and a TypeScript client.`,
    skills: ["Rust", "Anchor", "Solana", "TypeScript", "Web3.js"],
    isExpanded: true,
  },
  {
    id: "kiet",
    school: "KIET Group of Institutions",
    degree: "Bachelor of Technology",
    fieldOfStudy: "Computer Science & Information Technology",
    period: {
      start: "2022",
      end: "03.2026",
    },
    description: `- Affiliated to Dr. A.P.J. Abdul Kalam Technical University (AKTU), Delhi NCR.
- CGPA: 9 / 10 — ranked 1st academically since the first year.
- Core Lead at [INNOGEEKS](https://innogeeks.in), handling all tech-related activities for a 250+ member community.
- Led the team organizing INNOHACKS 2.0 and the NASA Space Apps Challenge hackathons.
- Top 6 at Smart India Hackathon 2024; Top 50 of 4000+ teams at Google Solution Challenge 2023.`,
    skills: [
      "Data Structures & Algorithms",
      "Java",
      "C",
      "Operating Systems",
      "DBMS",
      "Computer Networks",
      "System Design",
      "Distributed Systems",
    ],
    isExpanded: true,
  },
  {
    id: "snps",
    school: "S.N. Public School",
    fieldOfStudy: "CBSE",
    period: {
      start: "2020",
      end: "2022",
    },
    description: `- Class XII (CBSE): 95.8%
- Class X (CBSE): 92.8%`,
    skills: ["Mathematics", "Physics", "Computer Science"],
  },
]
