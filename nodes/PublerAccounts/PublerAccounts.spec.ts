import { PublerAccounts } from "./PublerAccounts.node"

test("PublerAccounts", () => {
  const node = new PublerAccounts()
  expect(node.description.properties).toBeDefined()
})
