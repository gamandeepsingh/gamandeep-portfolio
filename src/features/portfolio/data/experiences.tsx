import { BlocksIcon, CodeXmlIcon, LayoutIcon, ServerIcon } from "lucide-react"

import type { Experience } from "@/features/portfolio/types/experiences"

export const EXPERIENCES: Experience[] = [
  {
    id: "gpunet",
    companyName: "GPU.Net",
    companyLogo: "https://unavatar.io/gpu.net",
    companyWebsite: "https://gpu.net",
    location: "Bengaluru, India",
    locationType: "On-site",
    positions: [
      {
        id: "1",
        title: "Full Stack Engineer",
        employmentPeriod: {
          start: "10.2025",
        },
        employmentType: "Full-time",
        icon: <ServerIcon />,
        description: `- Built real-time backend systems using Node.js, Redis, and SSE for low-latency data streaming.
- Designed scalable event-driven architecture handling high-frequency updates and real-time feeds.
- Implemented caching strategies reducing backend load and improving response time.`,
        skills: [
          "Node.js",
          "TypeScript",
          "Redis",
          "SSE",
          "Event-driven Architecture",
          "Distributed Systems",
        ],
        isExpanded: true,
      },
    ],
    isCurrentEmployer: true,
  },
  {
    id: "solana-turbine",
    companyName: "Solana Turbine",
    companyLogo: "https://turbin3.org/favicon.png",
    companyWebsite: "https://turbin3.org",
    location: "Remote",
    locationType: "Remote",
    positions: [
      {
        id: "1",
        title: "Builder (Q2 Cohort)",
        employmentPeriod: {
          start: "04.2026",
          end: "06.2026",
        },
        employmentType: "Cohort",
        icon: <BlocksIcon />,
        description: `- Selected for Solana Turbine, building production-grade Web3 applications and backend systems.
- Developed on-chain programs, wallet infrastructure, and blockchain integrations with Rust and Anchor.
- Collaborated with developers on scalable decentralized applications.`,
        skills: ["Solana", "Rust", "Anchor", "Web3", "Blockchain"],
      },
    ],
  },
  {
    id: "credible",
    companyName: "Credible Finance",
    companyLogo: "https://unavatar.io/x/crediblefin",
    companyWebsite: "https://credible.finance",
    location: "Remote",
    locationType: "Remote",
    positions: [
      {
        id: "1",
        title: "Frontend Engineer",
        employmentPeriod: {
          start: "08.2025",
          end: "10.2025",
        },
        employmentType: "Contract",
        icon: <LayoutIcon />,
        description: `- Built the frontend for an on-chain credit protocol — the first stablecoin pay-later protocol.
- Developed REST APIs and integrated third-party financial services.
- Built backend systems for payments, transaction processing, and workflows.`,
        skills: [
          "Next.js",
          "TypeScript",
          "Tailwind CSS",
          "React Query",
          "Solana",
          "Web3",
        ],
      },
    ],
  },
  {
    id: "decharge",
    companyName: "Decharge Networks",
    companyLogo:
      "https://pbs.twimg.com/profile_images/2005992492207140864/aRpbC3dd_400x400.jpg",
    companyWebsite: "https://decharge.us",
    location: "Remote",
    locationType: "Remote",
    positions: [
      {
        id: "1",
        title: "Web3 Engineer",
        employmentPeriod: {
          start: "08.2025",
          end: "10.2025",
        },
        employmentType: "Freelance",
        icon: <BlocksIcon />,
        description: `- Developed backend services for blockchain transactions and wallet interactions on an EV charging platform.
- Integrated Web3 APIs and payment systems for crypto transactions.`,
        skills: ["Solana", "Next.js", "Web3 APIs", "Payment Systems", "Crypto"],
      },
    ],
  },
  {
    id: "elanine",
    companyName: "Elanine Creatives",
    companyLogo:
      "https://res.cloudinary.com/dib0peewu/image/upload/v1725112664/Screenshot_from_2024-08-31_19-23-09-removebg-preview_emtywq.png",
    companyWebsite: "https://elanine.com",
    location: "Remote",
    locationType: "Remote",
    positions: [
      {
        id: "1",
        title: "SDE Intern",
        employmentPeriod: {
          start: "07.2024",
          end: "09.2025",
        },
        employmentType: "Internship",
        icon: <CodeXmlIcon />,
        description: `- Built full stack systems for 10+ SaaS applications using Node.js, MongoDB, Postgres, and React/Next.js.
- Designed database schemas and REST APIs for production systems.
- Improved backend performance through query optimization and structured data modeling.`,
        skills: [
          "Node.js",
          "MongoDB",
          "PostgreSQL",
          "React",
          "Next.js",
          "Microservices",
        ],
      },
    ],
  },
  {
    id: "easyeduverse",
    companyName: "EasyEduverse",
    companyLogo:
      "https://pbs.twimg.com/profile_images/1682074886083317761/iepus53m_400x400.jpg",
    companyWebsite: "https://x.com/Easyeduverse",
    location: "Remote",
    locationType: "Remote",
    positions: [
      {
        id: "1",
        title: "Backend Intern",
        employmentPeriod: {
          start: "01.2024",
          end: "05.2024",
        },
        employmentType: "Internship",
        icon: <ServerIcon />,
        description: `- Developed backend services for an edtech platform using Node.js, MongoDB, and PostgreSQL.
- Designed and implemented REST APIs for course management, user authentication, and payment processing.`,
        skills: ["Node.js", "MongoDB", "PostgreSQL", "Microservices"],
      },
    ],
  },
]
