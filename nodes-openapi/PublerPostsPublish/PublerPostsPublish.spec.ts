import { PublerPostsPublish } from "./PublerPostsPublish.node"

test("PublerPostsPublish", () => {
  const node = new PublerPostsPublish()
  expect(node.description.properties).toBeDefined()
})
