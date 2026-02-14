import { PublerMe } from "./PublerMe.node"

test("PublerMe", () => {
  const node = new PublerMe()
  expect(node.description.properties).toBeDefined()
})
