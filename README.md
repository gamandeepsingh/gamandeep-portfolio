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

## Insights section (visitor stats)

Counted first-party in Redis — no third-party script, no cookies. Every page load pings `POST /api/insights/hit`, which hashes IP + user agent with a daily salt and records one unique visitor per UTC day (`insights:visitors:<date>`) plus a running total (`insights:visitors:total`). Set in `.env.local` / Vercel:

```
REDIS_URL=redis://default:<password>@<host>:<port>
```

The section stays hidden until `REDIS_URL` is set. Local hosts and headless browsers are never counted. Use `INSIGHTS_MOCK=true` in dev to preview it with fake data.

## Routes

- `/` — the portfolio
- `/vcard` — downloadable vCard
- `/api/insights/hit` — `POST`, first-party visitor counter (see above)
- `/og/simple?title=…&description=…` — OG image generator
- `/llms.txt`, `/about.md`, `/experience.md`, `/education.md`, `/projects.md`, `/awards.md`, `/certifications.md` — Markdown for AI agents
