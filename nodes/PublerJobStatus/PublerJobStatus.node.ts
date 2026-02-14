import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from "n8n-workflow"

export class PublerJobStatus implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Publer Job Status",
    name: "publerJobStatus",
    icon: "file:logo.svg",
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
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        options: [
          {
            name: "Get Job Status",
            value: "getJobStatus",
            description: "Check the status of a specific job by ID",
            action: "Get job status",
          },
        ],
        default: "getJobStatus",
      },
      {
        displayName: "Job ID",
        name: "jobId",
        type: "string",
        default: "",
        required: true,
        description: "The ID of the job to check",
        placeholder: "12345",
        displayOptions: {
          show: {
            operation: ["getJobStatus"],
          },
        },
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

    const operation = this.getNodeParameter("operation", 0) as string
    this.logger.info("Starting execution", { operation, itemCount: items.length })

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        if (operation === "getJobStatus") {
          const jobId = this.getNodeParameter("jobId", itemIndex) as string

          const endpoint = `https://app.publer.com/api/v1/job_status/${jobId}`

          this.logger.info("Making API request", {
            itemIndex,
            endpoint,
            method: "GET",
            jobId,
          })

          const response = await this.helpers.requestWithAuthentication.call(this, "publerApi", {
            method: "GET",
            url: endpoint,
            headers: {
              Authorization: `Bearer-API ${apiToken}`,
              Accept: "application/json",
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
        }
      } catch (error) {
        this.logger.error("API request failed", {
          itemIndex,
          operation,
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
      operation,
      processedItems: returnData.length,
    })

    return [returnData]
  }
}
