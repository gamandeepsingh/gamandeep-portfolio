export type ContributionOrg =
  | "solana-foundation"
  | "solana-rpc"
  | "tokio"
  | "blueshift"
  | "anza"
  | "passmark"
  | "hacktoberfest"

export type ContributionStatus = "merged" | "open" | "closed"

export type Contribution = {
  /** Stable unique identifier (used as list key/anchor). */
  id: string
  /** Short, human-readable summary of the change. */
  title: string
  /** GitHub `owner/name` slug, e.g. "solana-rpc/superbank". */
  repo: string
  /** Pull request number. */
  number: number
  /** Pull request URL. */
  link: string
  /** Organisation/program the repo belongs to, used for filter chips. */
  org: ContributionOrg
  /** Lifecycle of the PR on GitHub. */
  status: ContributionStatus
  /**
   * Date the PR was merged (or opened, if not merged), for display.
   * Use "MM.YYYY" format.
   */
  date: string
  /** Tags/technologies for chips or filtering. */
  skills: string[]
  /** Optional rich description; Markdown and line breaks supported. */
  description?: string
  /** Whether the card is expanded by default in the UI. */
  isExpanded?: boolean
}
