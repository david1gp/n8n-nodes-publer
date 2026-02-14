import { PublerBasic } from "./PublerBasic.node"

test("PublerBasic", () => {
  const node = new PublerBasic()
  expect(node.description.properties).toBeDefined()
})
