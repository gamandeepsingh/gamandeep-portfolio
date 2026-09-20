import { FilterableList } from "@/components/filterable-list"
import { HandwrittenPanelNote } from "@/features/portfolio/components/handwritten-note"
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelTitleSup,
} from "@/features/portfolio/components/panel"
import { PanelTitleCopy } from "@/features/portfolio/components/panel-title-copy"
import {
  PROJECT_CATEGORIES,
  PROJECTS,
} from "@/features/portfolio/data/projects"

import { ProjectItem } from "./project-item"

const ID = "projects"

export function Projects() {
  // Items render on the server (Markdown is async); the client list only
  // decides which of them to show.
  const entries = PROJECTS.map((project) => ({
    id: project.id,
    categories: project.categories,
    node: <ProjectItem project={project} />,
  }))

  return (
    <Panel id={ID}>
      <PanelHeader>
        <PanelTitle>
          <a href={`#${ID}`}>Projects</a>
          <PanelTitleSup>({PROJECTS.length})</PanelTitleSup>
          <PanelTitleCopy id={ID} />
        </PanelTitle>
      </PanelHeader>

      <FilterableList
        entries={entries}
        categories={PROJECT_CATEGORIES}
        filterLabel="Filter projects by category"
        max={4}
      />
      <HandwrittenPanelNote side="left">
        almost all of them work
      </HandwrittenPanelNote>
    </Panel>
  )
}
