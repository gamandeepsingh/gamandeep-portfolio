import { addQueryParams } from "@/utils/url"

import { UTM_PARAMS } from "@/config/site"
import { cn } from "@/lib/utils"
import type { User } from "@/features/portfolio/types/user"

type ContributorLineProps = NonNullable<User["contributor"]> & {
  className?: string
}

/** "Core Contributor @a, @b and others" — handles link out, the rest is muted. */
export function ContributorLine({
  label,
  orgs,
  andOthers,
  className,
}: ContributorLineProps) {
  return (
    <p
      className={cn(
        "font-mono text-sm text-balance text-muted-foreground",
        className
      )}
    >
      {label}{" "}
      {orgs.map((org, i) => (
        <span key={org.handle}>
          <a
            className="text-foreground link"
            href={addQueryParams(org.href, UTM_PARAMS)}
            target="_blank"
            rel="noopener"
          >
            @{org.handle}
          </a>
          {i < orgs.length - 1 &&
            (andOthers || i < orgs.length - 2 ? ", " : " and ")}
        </span>
      ))}
      {andOthers && " and others"}
    </p>
  )
}
