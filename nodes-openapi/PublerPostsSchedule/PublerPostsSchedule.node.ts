import { INodeType, INodeTypeDescription } from "n8n-workflow"
import { N8NPropertiesBuilder, N8NPropertiesBuilderConfig } from "@devlikeapro/n8n-openapi-node"
import * as doc from "./openapi.json"

const config: N8NPropertiesBuilderConfig = {}
const parser = new N8NPropertiesBuilder(doc, config)
const properties = parser.build()

export class PublerPostsSchedule implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Publer Posts Schedule",
    name: "publerPostsSchedule",
    icon: "file:logo.svg",
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: "Interact with Publer Posts Schedule API - Schedule and publish posts",
    defaults: {
      name: "Publer Posts Schedule",
    },
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      {
        name: "publerApi",
        required: true,
      },
    ],
    requestDefaults: {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      baseURL: "https://app.publer.com",
    },
    properties: properties,
  }
}
