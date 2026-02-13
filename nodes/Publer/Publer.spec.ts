import { Publer } from "./Publer.node"

test("Publer", () => {
  const node = new Publer()
  expect(node.description.properties).toBeDefined()
})
