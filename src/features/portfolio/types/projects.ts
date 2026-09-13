export type ProjectCategory = "web3" | "web" | "tool" | "ui" | "ai"

export type Project = {
  /** Stable unique identifier (used as list key/anchor). */
  id: string
  title: string
  /**
   * Project period for display and sorting.
   * Use "MM.YYYY" or "YYYY" format. Omit `end` for ongoing projects.
   */
  period: {
    /** Start date (e.g., "05.2025"). */
    start: string
    /** End date; leave undefined for "Present". */
    end?: string
  }
  /** Public URL (site, package, demo, or article). */
  link: string
  /** Source repository URL, when public. */
  github?: string
  /** Tags/technologies for chips or filtering. */
  skills: string[]
  /** Optional rich description; Markdown and line breaks supported. */
  description?: string
  /** Screenshot/preview image shown when the card is expanded. */
  image?: string
  /** Lifecycle label, e.g. "Live", "Published", "Completed". */
  status?: string
  /** Categories used to pick a default icon. */
  categories: ProjectCategory[]
  /** Logo image URL (absolute or path under /public). Takes precedence over `icon`. */
  logo?: string
  /** Inline SVG icon, framed in a tile. Used only when `logo` is unset. */
  icon?: React.ReactElement
  /** Whether the project card is expanded by default in the UI. */
  isExpanded?: boolean
}
