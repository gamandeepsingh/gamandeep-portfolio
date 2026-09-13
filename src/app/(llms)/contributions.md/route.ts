import { CONTRIBUTIONS } from "@/features/portfolio/data/contributions"

const content = `# Open Source Contributions

${CONTRIBUTIONS.map((item) => {
  const meta = `${item.repo} #${item.number} (${item.status}, ${item.date})\nPull request: ${item.link}`
  const skills = `\n\nSkills: ${item.skills.join(", ")}`
  const description = item.description ? `\n\n${item.description.trim()}` : ""
  return `## ${item.title}\n\n${meta}${skills}${description}`
}).join("\n\n")}
`

export const revalidate = false
export const dynamic = "force-static"

export async function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown;charset=utf-8",
    },
  })
}
