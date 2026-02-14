import { PublerPostSchedule } from "./PublerPostSchedule.node"

test("PublerPostSchedule", () => {
  const node = new PublerPostSchedule()
  expect(node.description.properties).toBeDefined()
})
