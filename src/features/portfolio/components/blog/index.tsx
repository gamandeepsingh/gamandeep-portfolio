import { compareDesc } from "date-fns"

import { cn } from "@/lib/utils"
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelTitleSup,
} from "@/features/portfolio/components/panel"
import { PanelTitleCopy } from "@/features/portfolio/components/panel-title-copy"
import { BLOG_POSTS } from "@/features/portfolio/data/blog"

import { PostItem } from "./post-item"

const ID = "blog"

const SORTED_POSTS = [...BLOG_POSTS].sort((a, b) =>
  compareDesc(new Date(a.publishedAt), new Date(b.publishedAt))
)

export function Blog() {
  return (
    <Panel id={ID}>
      <PanelHeader>
        <PanelTitle>
          <a href={`#${ID}`}>Blog</a>
          <PanelTitleSup>({BLOG_POSTS.length})</PanelTitleSup>
          <PanelTitleCopy id={ID} />
        </PanelTitle>
      </PanelHeader>

      <div className="relative py-4">
        <div className="pointer-events-none absolute inset-0 -z-1 grid grid-cols-1 gap-4 max-sm:hidden sm:grid-cols-2">
          <div className="border-r border-line"></div>
          <div className="border-l border-line"></div>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SORTED_POSTS.map((post) => (
            <li
              key={post.href}
              className={cn(
                "max-sm:screen-line-top max-sm:screen-line-bottom",
                "sm:nth-[2n+1]:screen-line-top sm:nth-[2n+1]:screen-line-bottom"
              )}
            >
              <PostItem post={post} headingAs="h3" />
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  )
}
