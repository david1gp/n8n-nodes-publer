import { expect, test } from "bun:test"
import { PublerCompetitorAnalysis } from "./PublerCompetitorAnalysis.node"

test("PublerCompetitorAnalysis", () => {
  const node = new PublerCompetitorAnalysis()
  expect(node.description.properties).toBeDefined()
})
