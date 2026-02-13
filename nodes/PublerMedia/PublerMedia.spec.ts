import { PublerMedia } from "./PublerMedia.node"

test("PublerMedia", () => {
  const node = new PublerMedia()
  expect(node.description.properties).toBeDefined()
})
