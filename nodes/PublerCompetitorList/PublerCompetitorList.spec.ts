import { expect, test } from "bun:test"
import { PublerCompetitorList } from "./PublerCompetitorList.node"

test("PublerCompetitorList", () => {
  const node = new PublerCompetitorList()
  expect(node.description.properties).toBeDefined()
})
