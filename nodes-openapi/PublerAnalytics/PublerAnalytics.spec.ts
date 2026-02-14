import { PublerAnalytics } from "./PublerAnalytics.node"

test("PublerAnalytics", () => {
  const node = new PublerAnalytics()
  expect(node.description.properties).toBeDefined()
})
