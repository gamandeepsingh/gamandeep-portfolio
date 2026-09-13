import type { SocialProfile } from "@/features/portfolio/types/social-links"

/**
 * Keyed registry of social profiles — the single source of truth. Icons are
 * bound separately in `social-link-icons.tsx` (keyed by the same `SocialName`),
 * so adding a profile here forces the icon map to stay in sync at compile time.
 */
export const SOCIAL = {
  x: {
    title: "X",
    handle: "@techie__ghost",
    href: "https://x.com/techie__ghost",
    sameAs: true,
  },
  github: {
    title: "GitHub",
    handle: "gamandeepsingh",
    href: "https://github.com/gamandeepsingh",
    sameAs: true,
  },
  linkedin: {
    title: "LinkedIn",
    handle: "gamandeep-singh",
    href: "https://www.linkedin.com/in/gamandeep-singh-344001256/",
    sameAs: true,
  },
  medium: {
    title: "Medium",
    handle: "@gamandeepsingh4",
    href: "https://medium.com/@gamandeepsingh4",
    sameAs: true,
  },
  npm: {
    title: "npm",
    handle: "gamandeepsingh",
    href: "https://www.npmjs.com/~gamandeep",
  },
  crates: {
    title: "crates.io",
    handle: "gamandeepsingh",
    href: "https://crates.io/users/gamandeepsingh",
  },
} satisfies Record<string, SocialProfile>

export type SocialName = keyof typeof SOCIAL

export type SocialLink = SocialProfile & { name: SocialName }

export const SOCIAL_LINKS: SocialLink[] = (
  Object.entries(SOCIAL) as [SocialName, SocialProfile][]
).map(([name, profile]) => ({ name, ...profile }))
