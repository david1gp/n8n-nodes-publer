import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from "n8n-workflow"

export class PublerPostScheduleText implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Publer Post Schedule Text",
    name: "publerPostScheduleText",
    icon: { light: 'file:../../public/logo.svg', dark: 'file:../../public/logo-dark.svg' },
    group: ["input"],
    version: 1,
    description: "Schedule a text-only post (status) to social media accounts via Publer",
    defaults: {
      name: "Publer Post Schedule Text",
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
        displayName: "Social Network",
        name: "network",
        type: "options",
        required: true,
        default: "",
        description: "Target social network for the post",
        options: [
          { name: "Facebook", value: "facebook" },
          { name: "Twitter/X", value: "twitter" },
          { name: "LinkedIn", value: "linkedin" },
          { name: "Google Business", value: "google" },
          { name: "Telegram", value: "telegram" },
          { name: "Mastodon", value: "mastodon" },
          { name: "Threads", value: "threads" },
          { name: "Bluesky", value: "bluesky" },
          { name: "WordPress (Self-hosted)", value: "wordpress_basic" },
          { name: "WordPress (Hosted)", value: "wordpress_oauth" },
        ],
      },
      {
        displayName: "Post Text",
        name: "postText",
        type: "string",
        typeOptions: {
          rows: 4,
        },
        required: true,
        default: "",
        description: "The text content of your post",
      },
      {
        displayName: "Account IDs",
        name: "accountIds",
        type: "string",
        required: true,
        default: [],
        typeOptions: {
          multipleValues: true,
        },
        placeholder: "Add account ID…",
        description: "List of Publer account IDs to post to (one per line or add via button)",
      },
      {
        displayName: "Scheduled At",
        name: "scheduledAt",
        type: "dateTime",
        required: true,
        default: "",
        description: "ISO 8601 datetime (e.g., 2026-02-15T14:16:00+02:00). Defaults to current time if not provided.",
      },
      {
        displayName: "Post State",
        name: "state",
        type: "options",
        required: true,
        default: "scheduled",
        options: [
          { name: "Scheduled", value: "scheduled" },
          { name: "Draft", value: "draft" },
          { name: "Draft Private", value: "draft_private" },
          { name: "Draft Public", value: "draft_public" },
          { name: "Recurring", value: "recurring" },
        ],
        description: "The state of the post",
      },
      {
        displayName: "Workspace ID",
        name: "workspaceId",
        type: "string",
        default: "",
        required: true,
        description: "The workspace ID to schedule the post in",
      },
    ],
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData()
    const returnData: INodeExecutionData[] = []

    const credentials = await this.getCredentials("publerApi")
    const apiToken = credentials.apiToken as string

    if (!apiToken) {
      throw new Error("API Token is required")
    }

    const workspaceId = this.getNodeParameter("workspaceId", 0) as string

    if (!workspaceId) {
      throw new Error("Workspace ID is required for this operation")
    }

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const network = this.getNodeParameter("network", itemIndex) as string
        const postText = this.getNodeParameter("postText", itemIndex) as string
        const accountIds = this.getNodeParameter("accountIds", itemIndex, []) as string[]
        const cleanAccountIds = accountIds.filter((id) => id.trim() !== "")
        const scheduledAt = this.getNodeParameter("scheduledAt", itemIndex) as string
        const state = this.getNodeParameter("state", itemIndex) as string

        const accounts = cleanAccountIds.map((id) => ({
          id: id.trim(),
          scheduled_at: scheduledAt,
        }))

        const endpoint = "https://app.publer.com/api/v1/posts/schedule"

        const requestBody = {
          bulk: {
            state: state,
            posts: [
              {
                networks: {
                  [network]: {
                    type: "status",
                    text: postText,
                  },
                },
                accounts: accounts,
              },
            ],
          },
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
          body: requestBody,
          json: true,
        })

        returnData.push({
          json: response,
          pairedItem: { item: itemIndex },
        })
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: error.message },
            pairedItem: { item: itemIndex },
          })
        } else {
          throw error
        }
      }
    }

    return [returnData]
  }
}
