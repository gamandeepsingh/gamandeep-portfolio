"use client"

import { useRouter } from "@bprogress/next/app"
import { useHotkeys } from "react-hotkeys-hook"

import { trackEvent } from "@/lib/events"

export function KeyboardShortcuts() {
  const router = useRouter()

  const navigate = (path: string, keys: string) => {
    trackEvent({
      name: "keyboard_shortcut_navigate",
      properties: { path, keys },
    })
    router.push(path)
  }

  useHotkeys("g>h", () => navigate("/", "g>h"))
  useHotkeys("g>e", () => navigate("/#experience", "g>e"))
  useHotkeys("g>p", () => navigate("/#projects", "g>p"))
  useHotkeys("g>b", () => navigate("/#blog", "g>b"))

  return null
}
