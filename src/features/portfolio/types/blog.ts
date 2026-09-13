export type BlogPost = {
  title: string
  description: string
  /** Cover image (absolute URL). Recommended size: 1200x630. */
  image: string
  /** External URL (Medium, Gist, etc.). */
  href: string
  /** Publish date in YYYY-MM-DD */
  publishedAt: string
  tag: string
  readTime: string
}
