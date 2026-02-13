import { PublerLocations } from "./PublerLocations.node"

test("PublerLocations", () => {
  const node = new PublerLocations()
  expect(node.description.properties).toBeDefined()
})
