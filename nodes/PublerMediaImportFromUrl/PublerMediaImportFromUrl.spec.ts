import { PublerMediaImportFromUrl } from "./PublerMediaImportFromUrl.node"

test("PublerMediaImportFromUrl", () => {
  const node = new PublerMediaImportFromUrl()
  expect(node.description.properties).toBeDefined()
})
