import { PublerPostsSchedule } from "./PublerPostsSchedule.node"

test("PublerPostsSchedule", () => {
  const node = new PublerPostsSchedule()
  expect(node.description.properties).toBeDefined()
})
