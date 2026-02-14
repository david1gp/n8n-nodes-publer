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
        displayName: "Media Name",
        name: "mediaName",
        type: "string",
        default: "",
        required: true,
        description: "Name for the imported media file",
        placeholder: "my-image.jpg",
      },
      {
        displayName: "Caption",
        name: "caption",
        type: "string",
        default: "",
        description: "Optional caption for the media",
      },
      {
        displayName: "Source",
        name: "source",
        type: "string",
        default: "",
        description: "Optional source attribution for the media",
      },
      {
        displayName: "Upload Type",
        name: "uploadType",
        type: "options",
        default: "single",
        options: [
          { name: "Single", value: "single" },
          { name: "Bulk", value: "bulk" },
          { name: "Thumbnail", value: "thumbnail" },
        ],
        description: "Type of upload operation",
      },
      {
        displayName: "Direct Upload",
        name: "directUpload",
        type: "boolean",
        default: false,
        description: "Whether to upload directly to S3 (slower, but required if you need the final media URL immediately)",
      },
      {
        displayName: "Save to Library",
        name: "inLibrary",
        type: "boolean",
        default: false,
        description: "Whether to save the media to your library",
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
        const mediaName = this.getNodeParameter("mediaName", itemIndex) as string
        const caption = this.getNodeParameter("caption", itemIndex, "") as string
        const source = this.getNodeParameter("source", itemIndex, "") as string
        const uploadType = this.getNodeParameter("uploadType", itemIndex, "single") as string
        const directUpload = this.getNodeParameter("directUpload", itemIndex, false) as boolean
        const inLibrary = this.getNodeParameter("inLibrary", itemIndex, false) as boolean
        const workspaceId = this.getNodeParameter("workspaceId", itemIndex) as string

        const endpoint = "https://app.publer.com/api/v1/media/from-url"

        this.logger.info("Making API request", {
          itemIndex,
          endpoint,
          method: "POST",
          mediaUrl,
        })

        const mediaItem: Record<string, string> = {
          url: mediaUrl,
          name: mediaName,
        }

        if (caption) {
          mediaItem.caption = caption
        }

        if (source) {
          mediaItem.source = source
        }

        const body: Record<string, unknown> = {
          media: [mediaItem],
          type: uploadType,
          direct_upload: directUpload,
          in_library: inLibrary,
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
