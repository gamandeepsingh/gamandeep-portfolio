import { addQueryParams } from "@/utils/url"
import type { Root } from "hast"
import { visit } from "unist-util-visit"

/** Appends `params` (e.g. UTM tags) to every external `<a href>` in the tree. */
export function rehypeAddQueryParams(params: Record<string, string>) {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") {
        return
      }

      const href = node.properties?.href

      if (
        typeof href !== "string" ||
        href.startsWith("/") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#")
      ) {
        return
      }

      node.properties.href = addQueryParams(href, params)
    })
  }
}
