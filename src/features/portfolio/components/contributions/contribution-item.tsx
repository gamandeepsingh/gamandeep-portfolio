import { addQueryParams } from "@/utils/url"
import {
  GitMergeIcon,
  GitPullRequestClosedIcon,
  GitPullRequestIcon,
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

import type {
  Contribution,
  ContributionStatus,
} from "../../types/contributions"

const STATUS: Record<
  ContributionStatus,
  { label: string; icon: React.ReactElement; className: string }
> = {
  merged: {
    label: "Merged",
    icon: <GitMergeIcon />,
    className:
      "text-purple-600 group-hover/contribution:bg-purple-500/10 group-hover/contribution:border-purple-500/30 dark:text-purple-400",
  },
  open: {
    label: "Open",
    icon: <GitPullRequestIcon />,
    className:
      "text-green-600 group-hover/contribution:bg-green-500/10 group-hover/contribution:border-green-500/30 dark:text-green-400",
  },
  closed: {
    label: "Closed",
    icon: <GitPullRequestClosedIcon />,
    className:
      "text-red-600 group-hover/contribution:bg-red-500/10 group-hover/contribution:border-red-500/30 dark:text-red-400",
  },
}

export function ContributionItem({
  className,
  contribution,
}: {
  className?: string
  contribution: Contribution
}) {
  const status = STATUS[contribution.status]

  return (
    <Collapsible className={className} defaultOpen={contribution.isExpanded}>
      <CollapsibleTrigger className="group/contribution flex w-full items-center text-left hover:bg-accent-muted">
        <IconTile
          className={`mx-4 transition-colors ${status.className}`}
          aria-label={status.label}
        >
          {status.icon}
        </IconTile>

        <div className="flex flex-1 items-center gap-2 border-l border-dashed border-line p-4 pr-2">
          <div className="flex-1">
            <h3 className="mb-1 leading-snug font-medium text-balance">
              {contribution.title}
            </h3>

            <dl className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
              <dt className="sr-only">Repository</dt>
              <dd className="font-mono text-[0.8125rem]">
                {contribution.repo}
                <span className="text-muted-foreground/60">
                  {" "}
                  #{contribution.number}
                </span>
              </dd>

              <dt className="sr-only">Date</dt>
              <dd className="flex items-center gap-1.5 before:size-1 before:rounded-full before:bg-current before:opacity-60">
                {contribution.date}
              </dd>

              <dt className="sr-only">Status</dt>
              <dd className="flex items-center gap-1.5 before:size-1 before:rounded-full before:bg-current before:opacity-60">
                {status.label}
              </dd>
            </dl>
          </div>

          <Tooltip>
            <TooltipTrigger
              render={
                <a
                  className="relative flex size-6 shrink-0 items-center justify-center text-muted-foreground after:absolute after:-inset-2 hover:text-foreground"
                  href={addQueryParams(contribution.link, UTM_PARAMS)}
                  target="_blank"
                  rel="noopener"
                  aria-label="View pull request"
                >
                  <GitHubIcon className="pointer-events-none size-4" />
                </a>
              }
            />
            <TooltipContent>
              <p>View pull request</p>
            </TooltipContent>
          </Tooltip>

          <div className="shrink-0 text-muted-foreground [&_svg]:size-4">
            <CollapsibleChevronsUpDownIcon duration={0.15} />
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden">
        <div className="space-y-4 border-t border-line p-4">
          {contribution.description && (
            <div className="typeset typeset-description">
              <Markdown>{contribution.description}</Markdown>
            </div>
          )}

          {contribution.skills.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {contribution.skills.map((skill, index) => (
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
