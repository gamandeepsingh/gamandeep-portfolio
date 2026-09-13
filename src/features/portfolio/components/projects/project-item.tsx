import Image from "next/image"
import { addQueryParams } from "@/utils/url"
import {
  BoxIcon,
  CoinsIcon,
  GlobeIcon,
  InfinityIcon,
  LinkIcon,
  PaletteIcon,
  SparklesIcon,
  WrenchIcon,
} from "lucide-react"

import { UTM_PARAMS } from "@/config/site"
import { IconTile } from "@/components/ui/icon-tile"
import { Tag } from "@/components/ui/tag"
import {
  Collapsible,
  CollapsibleChevronsUpDownIcon,
} from "@/components/base/collapsible-animated"
import {
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/base/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/base/ui/tooltip"
import { GitHubIcon } from "@/components/icons"
import { Markdown } from "@/components/markdown"

import type { Project, ProjectCategory } from "../../types/projects"

const CATEGORY_ICONS: Record<ProjectCategory, React.ReactElement> = {
  web3: <CoinsIcon />,
  web: <GlobeIcon />,
  tool: <WrenchIcon />,
  ui: <PaletteIcon />,
  ai: <SparklesIcon />,
}

/**
 * Deterministic "random" gradient derived from the project id so the same
 * project always gets the same colors and SSR/CSR output matches.
 */
function getPreviewGradient(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  const hue = Math.abs(hash) % 360
  const hue2 = (hue + 40 + (Math.abs(hash >> 8) % 80)) % 360
  const angle = Math.abs(hash >> 16) % 360
  return `linear-gradient(${angle}deg, oklch(0.8 0.14 ${hue}), oklch(0.65 0.18 ${hue2}))`
}

export function ProjectItem({
  className,
  project,
}: {
  className?: string
  project: Project
}) {
  const { start, end } = project.period
  const isOngoing = !end
  const isSinglePeriod = end === start

  const icon = project.icon ??
    (project.categories[0] ? CATEGORY_ICONS[project.categories[0]] : null) ?? (
      <BoxIcon />
    )

  return (
    <Collapsible className={className} defaultOpen={project.isExpanded}>
      <CollapsibleTrigger className="group/project flex w-full items-center text-left hover:bg-accent-muted">
        {project.logo ? (
          <Image
            src={project.logo}
            alt={project.title}
            width={32}
            height={32}
            quality={100}
            className="mx-4 flex size-6 shrink-0 grayscale select-none group-hover/project:grayscale-0"
            unoptimized
            aria-hidden
          />
        ) : (
          <IconTile className="mx-4">{icon}</IconTile>
        )}

        <div className="flex flex-1 items-center gap-2 border-l border-dashed border-line p-4 pr-2">
          <div className="flex-1">
            <h3 className="mb-1 leading-snug font-medium text-balance">
              {project.title}
            </h3>

            <dl className="flex items-center gap-2 text-sm text-muted-foreground">
              <dt className="sr-only">Period</dt>
              <dd className="flex items-center gap-0.5">
                <span>{start}</span>
                {!isSinglePeriod && (
                  <>
                    <span className="font-mono">—</span>
                    {isOngoing ? (
                      <InfinityIcon
                        className="size-4.5 translate-y-[0.5px]"
                        aria-label="Present"
                      />
                    ) : (
                      <span>{end}</span>
                    )}
                  </>
                )}
              </dd>

              {project.status && (
                <>
                  <dt className="sr-only">Status</dt>
                  <dd className="flex items-center gap-1.5 before:size-1 before:rounded-full before:bg-current before:opacity-60">
                    {project.status}
                  </dd>
                </>
              )}
            </dl>
          </div>

          {project.github && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    className="relative flex size-6 shrink-0 items-center justify-center text-muted-foreground after:absolute after:-inset-2 hover:text-foreground"
                    href={project.github}
                    target="_blank"
                    rel="noopener"
                    aria-label="View source code"
                  >
                    <GitHubIcon className="pointer-events-none size-4" />
                  </a>
                }
              />
              <TooltipContent>
                <p>Source code</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger
              render={
                <a
                  className="relative flex size-6 shrink-0 items-center justify-center text-muted-foreground after:absolute after:-inset-2 hover:text-foreground"
                  href={addQueryParams(project.link, UTM_PARAMS)}
                  target="_blank"
                  rel="noopener"
                  aria-label="Open project"
                >
                  <LinkIcon className="pointer-events-none size-4" />
                </a>
              }
            />
            <TooltipContent>
              <p>Open project</p>
            </TooltipContent>
          </Tooltip>

          <div className="shrink-0 text-muted-foreground [&_svg]:size-4">
            <CollapsibleChevronsUpDownIcon duration={0.15} />
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden">
        <div className="space-y-4 border-t border-line p-4">
          {project.image && (
            <a
              href={addQueryParams(project.link, UTM_PARAMS)}
              target="_blank"
              rel="noopener"
              className="relative block rounded-(--image-radius) p-10 grayscale transition-[filter] duration-300 ease-[cubic-bezier(0.42,0,0.58,1)] select-none hover:grayscale-0 [--image-radius:var(--radius-xl)]"
              style={{ backgroundImage: getPreviewGradient(project.id) }}
              aria-label={`Preview of ${project.title}`}
            >
              <Image
                className="aspect-video w-full rounded-[calc(var(--image-radius)-0.2rem)] object-cover object-top"
                src={project.image}
                alt={`${project.title} preview`}
                width={1200}
                height={675}
                quality={100}
                loading="lazy"
                unoptimized
              />
              <div className="pointer-events-none absolute inset-0 rounded-(--image-radius) inset-ring-1 inset-ring-black/15 dark:inset-ring-white/15" />
            </a>
          )}

          {project.description && (
            <div className="typeset typeset-description">
              <Markdown>{project.description}</Markdown>
            </div>
          )}

          {project.skills.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {project.skills.map((skill, index) => (
                <li key={index} className="flex">
                  <Tag>{skill}</Tag>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
