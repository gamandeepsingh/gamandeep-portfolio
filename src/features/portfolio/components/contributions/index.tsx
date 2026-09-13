import { FilterableList } from "@/components/filterable-list"
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelTitleSup,
} from "@/features/portfolio/components/panel"
import { PanelTitleCopy } from "@/features/portfolio/components/panel-title-copy"
import {
  CONTRIBUTION_ORGS,
  CONTRIBUTIONS,
} from "@/features/portfolio/data/contributions"

import { ContributionItem } from "./contribution-item"

const ID = "contributions"

export function Contributions() {
  // Items render on the server (Markdown is async); the client list only
  // decides which of them to show.
  const entries = CONTRIBUTIONS.map((contribution) => ({
    id: contribution.id,
    categories: [contribution.org],
    node: <ContributionItem contribution={contribution} />,
  }))

  return (
    <Panel id={ID}>
      <PanelHeader>
        <PanelTitle>
          <a href={`#${ID}`}>Open Source</a>
          <PanelTitleSup>({CONTRIBUTIONS.length})</PanelTitleSup>
          <PanelTitleCopy id={ID} />
        </PanelTitle>
      </PanelHeader>

      <FilterableList
        entries={entries}
        categories={CONTRIBUTION_ORGS}
        filterLabel="Filter contributions by organisation"
        max={5}
      />
    </Panel>
  )
}
