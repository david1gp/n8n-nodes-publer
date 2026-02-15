import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from "n8n-workflow"

export class PublerCompetitorList implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Publer Competitor List",
    name: "publerCompetitorList",
    icon: { light: 'file:../../public/logo.svg', dark: 'file:../../public/logo-dark.svg' },
    group: ["input"],
    version: 1,
    description: "List competitor accounts for a social media account",
    defaults: {
      name: "Publer Competitor List",
    },
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      {
        name: "publerApi",
        required: true,
      },
    ],
    properties: [
      {
        displayName: "Account ID",
        name: "accountId",
        type: "string",
        default: "",
        required: true,
        description: "The social media account ID to list competitors for",
        placeholder: "647a0edddb2797b89044e2c1",
      },
      {
        displayName: "Workspace ID",
        name: "workspaceId",
        type: "string",
        default: "",
        required: true,
        description: "The workspace ID that contains the account",
      },
    ],
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData()
    const returnData: INodeExecutionData[] = []

    const credentials = await this.getCredentials("publerApi")
    const apiToken = credentials.apiToken as string

    if (!apiToken) {
      this.logger.error("API Token is missing", {
        credentialName: "publerApi",
      })
      throw new Error("API Token is required")
    }

    this.logger.debug("Credentials retrieved", {
      hasApiToken: !!apiToken,
      itemCount: items.length,
    })

    const workspaceId = this.getNodeParameter("workspaceId", 0) as string

    if (!workspaceId) {
      this.logger.error("Workspace ID is missing", {
        nodeName: this.getNode().name,
      })
      throw new Error("Workspace ID is required for this operation")
    }

    this.logger.debug("Node parameters retrieved", {
      hasWorkspaceId: !!workspaceId,
    })
    this.logger.info("Starting execution", { itemCount: items.length })

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const accountId = this.getNodeParameter("accountId", itemIndex) as string
        const endpoint = `https://app.publer.com/api/v1/competitors/${accountId}`

        this.logger.info("Making API request", {
          itemIndex,
          endpoint,
          method: "GET",
          accountId,
          workspaceId: workspaceId,
        })

        const response = await this.helpers.requestWithAuthentication.call(this, "publerApi", {
          method: "GET",
          url: endpoint,
          headers: {
            Authorization: `Bearer-API ${apiToken}`,
            Accept: "application/json",
            "Publer-Workspace-Id": workspaceId,
          },
          json: true,
        })

        this.logger.info("API request successful", {
          itemIndex,
          endpoint,
          responseType: typeof response,
        })

        this.logger.debug("Response data", {
          itemIndex,
          responseKeys: response ? Object.keys(response) : [],
        })

        returnData.push({
          json: response,
          pairedItem: { item: itemIndex },
        })
      } catch (error) {
        this.logger.error("API request failed", {
          itemIndex,
          error: error.message,
          stack: error.stack,
        })

        if (this.continueOnFail()) {
          this.logger.warn("Continuing on fail", { itemIndex })
          returnData.push({
            json: { error: error.message },
            pairedItem: { item: itemIndex },
          })
        } else {
          throw error
        }
      }
    }

    this.logger.info("Execution completed", {
      processedItems: returnData.length,
    })

    return [returnData]
  }
}
