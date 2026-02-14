import { expect, test } from "bun:test"
import { PublerWorkspaceList } from "./PublerWorkspaceList.node"

test("PublerWorkspaceList", () => {
  const node = new PublerWorkspaceList()
  expect(node.description.properties).toBeDefined()
})
