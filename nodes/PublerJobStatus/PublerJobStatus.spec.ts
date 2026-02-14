import { expect, test } from "bun:test"
import { PublerJobStatus } from "./PublerJobStatus.node"

test("PublerJobStatus", () => {
  const node = new PublerJobStatus()
  expect(node.description.properties).toBeDefined()
})
