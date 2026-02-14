import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from "n8n-workflow"

export class PublerCompetitorAnalysis implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Publer Competitor Analysis",
    name: "publerCompetitorAnalysis",
    icon: "file:logo.svg",
    group: ["input"],
    version: 1,
    description: "Get analytics data for competitor accounts",
    defaults: {
      name: "Publer Competitor Analysis",
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
            name: "Get Competitor Analytics",
            value: "getCompetitorAnalytics",
            description: "Retrieve analytics data for competitor accounts",
            action: "Get competitor analytics",
          },
        ],
        default: "getCompetitorAnalytics",
      },
      {
        displayName: "Account ID",
        name: "accountId",
        type: "string",
        default: "",
        required: true,
        description: "The social media account ID to analyze competitors for",
        placeholder: "647a0edddb2797b89044e2c1",
        displayOptions: {
          show: {
            operation: ["getCompetitorAnalytics"],
          },
        },
      },
      {
        displayName: "Competitor ID",
        name: "competitorId",
        type: "string",
        default: "",
        description: "Optional: Filter by specific competitor account ID",
        displayOptions: {
          show: {
            operation: ["getCompetitorAnalytics"],
          },
        },
      },
      {
        displayName: "Search Query",
        name: "query",
        type: "string",
        default: "",
        description: "Optional: Search filter for competitor account names",
        displayOptions: {
          show: {
            operation: ["getCompetitorAnalytics"],
          },
        },
      },
      {
        displayName: "From Date",
        name: "from",
        type: "string",
        default: "",
        description: "Optional: Start date for analytics data (YYYY-MM-DD)",
        placeholder: "2024-01-01",
        displayOptions: {
          show: {
            operation: ["getCompetitorAnalytics"],
          },
        },
      },
      {
        displayName: "To Date",
        name: "to",
        type: "string",
        default: "",
        description: "Optional: End date for analytics data (YYYY-MM-DD)",
        placeholder: "2024-12-31",
        displayOptions: {
          show: {
            operation: ["getCompetitorAnalytics"],
          },
        },
      },
      {
        displayName: "Page",
        name: "page",
        type: "number",
        default: 0,
        description: "Page number for pagination (default: 0)",
        displayOptions: {
          show: {
            operation: ["getCompetitorAnalytics"],
          },
        },
      },
      {
        displayName: "Sort By",
        name: "sortBy",
        type: "options",
        default: "followers",
        description: "Field to sort results by",
        options: [
          { name: "Followers", value: "followers" },
          { name: "Reach", value: "reach" },
          { name: "Engagement", value: "engagement" },
          { name: "Posts Count", value: "posts_count" },
          { name: "Videos Count", value: "videos_count" },
          { name: "Photos Count", value: "photos_count" },
          { name: "Links Count", value: "links_count" },
          { name: "Statuses Count", value: "statuses_count" },
        ],
        displayOptions: {
          show: {
            operation: ["getCompetitorAnalytics"],
          },
        },
      },
      {
        displayName: "Sort Direction",
        name: "sortType",
        type: "options",
        default: "asc",
        description: "Sort direction",
        options: [
          { name: "Ascending", value: "asc" },
          { name: "Descending", value: "desc" },
        ],
        displayOptions: {
          show: {
            operation: ["getCompetitorAnalytics"],
          },
        },
      },
      {
        displayName: "Workspace ID",
        name: "workspaceId",
        type: "string",
        default: "",
        required: true,
        description: "The workspace ID that contains the account",
        displayOptions: {
          show: {
            operation: ["getCompetitorAnalytics"],
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
    this.logger.info("Starting execution", { operation, itemCount: items.length })

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        if (operation === "getCompetitorAnalytics") {
          const accountId = this.getNodeParameter("accountId", itemIndex) as string
          const competitorId = this.getNodeParameter("competitorId", itemIndex, "") as string
          const query = this.getNodeParameter("query", itemIndex, "") as string
          const fromDate = this.getNodeParameter("from", itemIndex, "") as string
          const toDate = this.getNodeParameter("to", itemIndex, "") as string
          const page = this.getNodeParameter("page", itemIndex, 0) as number
          const sortBy = this.getNodeParameter("sortBy", itemIndex, "followers") as string
          const sortType = this.getNodeParameter("sortType", itemIndex, "asc") as string

          const endpoint = `https://app.publer.com/api/v1/competitors/${accountId}/analytics`

          const qs: Record<string, string | number> = {}
          if (competitorId) qs.competitor_id = competitorId
          if (query) qs.query = query
          if (fromDate) qs.from = fromDate
          if (toDate) qs.to = toDate
          qs.page = page
          if (sortBy) qs.sort_by = sortBy
          if (sortType) qs.sort_type = sortType

          this.logger.info("Making API request", {
            itemIndex,
            endpoint,
            method: "GET",
            accountId,
            workspaceId: workspaceId,
            queryParams: qs,
          })

          const response = await this.helpers.requestWithAuthentication.call(this, "publerApi", {
            method: "GET",
            url: endpoint,
            headers: {
              Authorization: `Bearer-API ${apiToken}`,
              Accept: "application/json",
              "Publer-Workspace-Id": workspaceId,
            },
            qs,
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
