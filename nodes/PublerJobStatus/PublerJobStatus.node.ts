import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from "n8n-workflow"

export class PublerJobStatus implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Publer Job Status",
    name: "publerJobStatus",
    icon: { light: 'file:../../public/logo.svg', dark: 'file:../../public/logo-dark.svg' },
    group: ["input"],
    version: 1,
    description: "Check the status of async jobs in Publer (e.g., media imports, bulk operations)",
    defaults: {
      name: "Publer Job Status",
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
        displayName: "Job ID",
        name: "jobId",
        type: "string",
        default: "",
        required: true,
        description: "The ID of the job to check",
        placeholder: "12345",
      },
      {
        displayName: "Workspace ID",
        name: "workspaceId",
        type: "string",
        default: "",
        required: true,
        description: "The workspace ID where the job was created",
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
        const jobId = this.getNodeParameter("jobId", itemIndex) as string

        const endpoint = `https://app.publer.com/api/v1/job_status/${jobId}`

        this.logger.info("Making API request", {
          itemIndex,
          endpoint,
          method: "GET",
          jobId,
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
