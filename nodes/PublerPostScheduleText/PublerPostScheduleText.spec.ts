import { PublerPostScheduleText } from "./PublerPostScheduleText.node"

test("PublerPostScheduleText", () => {
  const node = new PublerPostScheduleText()
  expect(node.description.properties).toBeDefined()
})
