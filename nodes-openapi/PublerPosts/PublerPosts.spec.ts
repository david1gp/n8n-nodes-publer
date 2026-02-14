import { PublerPosts } from "./PublerPosts.node"

test("PublerPosts", () => {
  const node = new PublerPosts()
  expect(node.description.properties).toBeDefined()
})
