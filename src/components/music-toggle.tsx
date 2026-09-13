"use client"

import { useEffect, useState } from "react"
import { AudioLinesIcon, Music2Icon } from "lucide-react"
import { useHotkeys } from "react-hotkeys-hook"

import { musicPlayer } from "@/lib/soundcn/music-player"
import { useClickSound } from "@/hooks/soundcn/use-click-sound"

import { Tooltip, TooltipContent, TooltipTrigger } from "./base/ui/tooltip"
import { Button } from "./ui/button"
import { Kbd } from "./ui/kbd"

export function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [click] = useClickSound()

  const toggle = () => {
    click()
    if (musicPlayer.isPlaying) {
      musicPlayer.pause()
    } else {
      void musicPlayer.play()
    }
  }

  useHotkeys("m", () => toggle())

  // State follows the element itself, so OS media keys and a refused
  // autoplay both land on the right icon.
  useEffect(() => musicPlayer.subscribe(setIsPlaying), [])

  const label = isPlaying ? "Pause music" : "Play music"

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className="relative touch-manipulation border-none"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            aria-pressed={isPlaying}
            onClick={() => toggle()}
          >
            <span
              className="absolute size-12 pointer-fine:hidden"
              aria-hidden
            />
            {isPlaying ? (
              <AudioLinesIcon className="animate-pulse" aria-hidden />
            ) : (
              <Music2Icon aria-hidden />
            )}
          </Button>
        }
      />
      <TooltipContent className="pr-2 pl-3">
        <div className="flex items-center gap-3">
          {label}
          <Kbd>M</Kbd>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
