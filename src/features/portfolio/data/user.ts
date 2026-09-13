import type { User } from "@/features/portfolio/types/user"

export const USER: User = {
  firstName: "Gamandeep",
  lastName: "Singh",
  displayName: "Gamandeep Singh",
  username: "gamandeepsingh",
  gender: "male",
  pronouns: "he/him",
  bio: "Full Stack Developer building scalable, real-time systems and Web3 applications on Solana.",
  flipSentences: [
    "Full Stack Developer. Web3 Developer.",
    "Building real-time backends with Node.js & Rust.",
    "Shipping on Solana.",
    "Also known as Ghost.",
  ],
  address: "Bengaluru, India",
  emailB64: "Z2FtYW5kZWVwc2luZ2g2QGdtYWlsLmNvbQ==", // base64 encoded
  website: "https://gamandeep.xyz",
  jobTitle: "Full Stack Engineer",
  jobs: [
    {
      title: "Full Stack Engineer",
      company: "GPU.Net",
      website: "https://gpu.net",
      experienceId: "gpunet",
    },
    {
      title: "Core Lead",
      company: "INNOGEEKS",
      website: "https://innogeeks.in",
    },
  ],
  about: `- I’m Gamandeep Singh (aka Ghost) — a Full Stack Developer with a focus on Web3, building scalable, event-driven backends and real-time systems with Node.js, Rust, and Solana.
- Currently solving complex problems at [GPU.Net](https://gpu.net), and a selected Builder in the [Solana Turbine](https://turbin3.org) Q2 2026 cohort.
- Core Lead at [INNOGEEKS](https://innogeeks.in), leading 250+ members and organizing INNOHACKS 2.0 & NASA Space Apps hackathons.
- Creator of [SOLAI Wallet](https://solai.website), [solana-pay-widget](https://www.npmjs.com/package/solana-pay-widget) (npm), and [QuickCache](https://crates.io/crates/quickcache) (Rust crate).
`,
  avatar: "/images/avatar.png",
  ogImage:
    "/og/simple?title=Gamandeep%20Singh&description=Full%20Stack%20Developer%20%C2%B7%20Web3%20Developer",
  resumeUrl:
    "https://drive.google.com/file/d/1zCZC-D79eKIy4BOGdzVE-kdfOT1SIb2s/view?usp=sharing",
  timeZone: "Asia/Kolkata",
  keywords: [
    "gamandeep singh",
    "gamandeepsingh",
    "gamandeep",
    "techie ghost",
    "full stack developer",
    "web3 developer",
    "solana developer",
    "rust developer",
    "bengaluru",
  ],
  dateCreated: "2026-09-13", // YYYY-MM-DD
}
