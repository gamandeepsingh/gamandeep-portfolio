# gamandeep.xyz

Personal portfolio of **Gamandeep Singh** — Full Stack Developer · Web3 Enthusiast.

## Editing content

All content lives in `src/features/portfolio/data/`:

| File                | Section                                                       |
| ------------------- | ------------------------------------------------------------- |
| `user.ts`           | Name, bio, contact, about, resume, avatar                     |
| `social-links.ts`   | Social profiles (icons in `components/social-link-icons.tsx`) |
| `experiences.tsx`   | Work experience                                               |
| `education.ts`      | Education                                                     |
| `projects.tsx`      | Projects (with preview image + GitHub)                        |
| `blog.ts`           | External blog posts (Medium, Gists)                           |
| `tech-stack.tsx`    | Stack badges (icons from `@icons-pack/react-simple-icons`)    |
| `awards.tsx`        | Awards                                                        |
| `certifications.ts` | Certifications                                                |

Avatar: `public/images/avatar.png`. Favicon: `public/icon.svg` / `public/icon-dark.svg`. Site mark: `src/components/ghost-mark.tsx`.

## Development

```bash
pnpm i
cp .env.example .env.local
pnpm dev
```

Before pushing:

```bash
pnpm lint
pnpm check-types
pnpm format:check
pnpm build
```

## Routes

- `/` — the portfolio
- `/vcard` — downloadable vCard
- `/og/simple?title=…&description=…` — OG image generator
- `/llms.txt`, `/about.md`, `/experience.md`, `/education.md`, `/projects.md`, `/awards.md`, `/certifications.md` — Markdown for AI agents
