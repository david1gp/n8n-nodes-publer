import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from "n8n-workflow"

export class PublerMediaImportFromUrl implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Publer Media Import From URL",
    name: "publerMediaImportFromUrl",
    icon: "file:logo.svg",
    group: ["input"],
    version: 1,
    description: "Import media files from a URL into your Publer media library",
    defaults: {
      name: "Publer Media Import From URL",
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
        displayName: "Media URL",
        name: "mediaUrl",
        type: "string",
        default: "",
        required: true,
        description: "The URL of the media file to import",
        placeholder: "https://example.com/image.jpg",
      },
      {
        displayName: "File Name",
        name: "fileName",
        type: "string",
        default: "",
        description: "Optional custom file name for the imported media",
        placeholder: "my-image.jpg",
      },
      {
        displayName: "Folder ID",
        name: "folderId",
        type: "string",
        default: "",
        description: "Optional folder ID to store the imported media",
      },
      {
        displayName: "Workspace ID",
        name: "workspaceId",
        type: "string",
        default: "",
        required: true,
        description: "The workspace ID to import the media into",
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

    this.logger.info("Starting execution", { itemCount: items.length })

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const mediaUrl = this.getNodeParameter("mediaUrl", itemIndex) as string
        const fileName = this.getNodeParameter("fileName", itemIndex, "") as string
        const folderId = this.getNodeParameter("folderId", itemIndex, "") as string
        const workspaceId = this.getNodeParameter("workspaceId", itemIndex) as string

        const endpoint = "https://app.publer.com/api/v1/media/from-url"

        this.logger.info("Making API request", {
          itemIndex,
          endpoint,
          method: "POST",
          mediaUrl,
        })

        const body: Record<string, unknown> = {
          url: mediaUrl,
        }

        if (fileName) {
          body.file_name = fileName
        }

        if (folderId) {
          body.folder_id = folderId
        }

        const response = await this.helpers.requestWithAuthentication.call(this, "publerApi", {
          method: "POST",
          url: endpoint,
          headers: {
            Authorization: `Bearer-API ${apiToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            "Publer-Workspace-Id": workspaceId,
          },
          body,
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
