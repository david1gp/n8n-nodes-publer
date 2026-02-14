import { ICredentialType, INodeProperties } from "n8n-workflow"

export class PublerApi implements ICredentialType {
  name = "publerApi"
  displayName = "Publer API"
  documentationUrl = "https://publer.com/docs"
  properties: INodeProperties[] = [
    {
      displayName: "API Token",
      name: "apiToken",
      type: "string",
      typeOptions: {
        password: true,
      },
      default: "",
      description: "Your Publer API token",
    },
  ]
  authenticate = {
    type: "generic" as const,
    properties: {
      headers: {
        Authorization: "=Bearer-API {{$credentials.apiToken}}",
      },
    },
  }
}
