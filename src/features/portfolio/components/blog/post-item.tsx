import Image from "next/image"
import { addQueryParams } from "@/utils/url"
import { format } from "date-fns"
import { ArrowUpRightIcon } from "lucide-react"

import { UTM_PARAMS } from "@/config/site"
import type { BlogPost } from "@/features/portfolio/types/blog"

type HeadingTypes = "h2" | "h3" | "h4"

export function PostItem({
  post,
  headingAs,
}: {
  post: BlogPost
  headingAs?: HeadingTypes
}) {
  const Heading = headingAs ?? "h2"

  return (
    <div className="group/post relative flex h-full flex-col gap-2 p-2 transition-[background-color] ease-out hover:bg-accent-muted">
      <div className="relative select-none [--image-radius:var(--radius-xl)]">
        <Image
          className="aspect-1200/630 rounded-(--image-radius) object-cover grayscale transition-[filter] duration-300 ease-[cubic-bezier(0.42,0,0.58,1)] group-hover/post:grayscale-0"
          src={post.image}
          alt={post.title}
          width={1200}
          height={630}
          quality={100}
          loading="lazy"
          unoptimized
        />
        <div className="pointer-events-none absolute inset-0 rounded-(--image-radius) inset-ring-1 inset-ring-black/15 dark:inset-ring-white/15" />
      </div>

      <div className="flex flex-col gap-1 p-2">
        <Heading className="text-lg leading-snug font-medium text-balance">
          <a
            href={addQueryParams(post.href, UTM_PARAMS)}
            target="_blank"
            rel="noopener"
          >
            <span className="absolute inset-0" aria-hidden />
            {post.title}
            <ArrowUpRightIcon
              className="ml-1 inline-block size-4 -translate-y-px text-muted-foreground"
              aria-hidden
            />
          </a>
        </Heading>

        <dl className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          <dt className="sr-only">Published on</dt>
          <dd>
            <time dateTime={new Date(post.publishedAt).toISOString()}>
              {format(new Date(post.publishedAt), "MMM yyyy")}
            </time>
          </dd>
          <dt className="sr-only">Category</dt>
          <dd className="before:mr-2 before:content-['·']">{post.tag}</dd>
          <dt className="sr-only">Read time</dt>
          <dd className="before:mr-2 before:content-['·']">{post.readTime}</dd>
        </dl>
      </div>
    </div>
  )
}
