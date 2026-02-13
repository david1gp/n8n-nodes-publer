import { PublerCompetitors } from "./PublerCompetitors.node"

test("PublerCompetitors", () => {
  const node = new PublerCompetitors()
  expect(node.description.properties).toBeDefined()
})
