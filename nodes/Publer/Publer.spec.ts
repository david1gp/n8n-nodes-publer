import {Publer} from "./Publer.node";

test("smoke", () => {
    const node = new Publer()
    expect(node.description.properties).toBeDefined()
})
