import { format } from "date-fns"

import { HandwrittenPanelNote } from "@/features/portfolio/components/handwritten-note"
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelTitleSup,
} from "@/features/portfolio/components/panel"
import { PanelTitleCopy } from "@/features/portfolio/components/panel-title-copy"
import { getInsights } from "@/features/portfolio/data/insights"

import { InsightsChart } from "./insights-chart"
import { InsightsMetrics } from "./insights-metrics"
import { getPlottedRange } from "./plotted-range"

const ID = "insights"

/** Renders nothing until `REDIS_URL` is configured (see `.env.example`). */
export async function Insights({ figureNumber }: { figureNumber: number }) {
  const data = await getInsights()

  if (data === null) {
    return null
  }

  const range = getPlottedRange(data.series)

  return (
    <>
      <div className="stripe-divider h-(--separator-height) w-full border-x" />

      <Panel id={ID}>
        <PanelHeader>
          <PanelTitle>
            <a href={`#${ID}`}>Insights</a>
            {range && (
              <PanelTitleSup>
                ({format(range.start, "dd.MM")} – {format(range.end, "dd.MM")})
              </PanelTitleSup>
            )}
            <PanelTitleCopy id={ID} />
          </PanelTitle>
        </PanelHeader>

        <InsightsMetrics summary={data.summary} changes={data.changes} />

        <InsightsChart series={data.series} figureNumber={figureNumber} />
        <HandwrittenPanelNote side="left">
          hi, you&apos;re in here now
        </HandwrittenPanelNote>
      </Panel>
    </>
  )
}

export function InsightsSkeleton() {
  return <Panel className="h-90.75" />
}
