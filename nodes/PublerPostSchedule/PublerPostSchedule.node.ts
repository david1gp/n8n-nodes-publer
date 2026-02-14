import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from "n8n-workflow"

export class PublerPostSchedule implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Publer Post Schedule",
    name: "publerPostSchedule",
    icon: "file:logo.svg",
    group: ["input"],
    version: 1,
    description: "Schedule posts with media (photo, video, link, carousel, etc.) via Publer",
    defaults: {
      name: "Publer Post Schedule",
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
            name: "Schedule Post",
            value: "schedulePost",
            description: "Schedule a post with media or other content types",
            action: "Schedule post",
          },
        ],
        default: "schedulePost",
      },
      {
        displayName: "Social Network",
        name: "network",
        type: "options",
        required: true,
        default: "",
        description: "Target social network for the post",
        options: [
          { name: "Facebook", value: "facebook" },
          { name: "Instagram", value: "instagram" },
          { name: "Twitter/X", value: "twitter" },
          { name: "LinkedIn", value: "linkedin" },
          { name: "Pinterest", value: "pinterest" },
          { name: "Google Business", value: "google" },
          { name: "YouTube", value: "youtube" },
          { name: "TikTok", value: "tiktok" },
          { name: "Telegram", value: "telegram" },
          { name: "Mastodon", value: "mastodon" },
          { name: "Threads", value: "threads" },
          { name: "Bluesky", value: "bluesky" },
        ],
      },
      {
        displayName: "Content Type",
        name: "contentType",
        type: "options",
        required: true,
        default: "",
        description: "The type of content to post",
        options: [
          { name: "Photo", value: "photo" },
          { name: "Video", value: "video" },
          { name: "Link", value: "link" },
          { name: "Carousel", value: "carousel" },
          { name: "Story", value: "story" },
          { name: "Reel", value: "reel" },
          { name: "GIF", value: "gif" },
          { name: "Poll", value: "poll" },
          { name: "Document", value: "document" },
          { name: "Event", value: "event" },
          { name: "Offer", value: "offer" },
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
        displayName: "Media IDs",
        name: "mediaIds",
        type: "string",
        required: false,
        default: "",
        description:
          "Comma-separated list of media IDs (required for photo, video, carousel, story, reel, gif types). Get these from PublerMediaImportFromUrl node.",
      },
      {
        displayName: "Link URL",
        name: "linkUrl",
        type: "string",
        required: false,
        default: "",
        displayOptions: {
          show: {
            contentType: ["link"],
          },
        },
        description: "The URL to share (required for link posts)",
      },
      {
        displayName: "Account IDs",
        name: "accountIds",
        type: "string",
        required: true,
        default: "",
        description: "Comma-separated list of account IDs to post to",
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
    ],
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData()
    const returnData: INodeExecutionData[] = []

    const credentials = await this.getCredentials("publerApi")
    const apiToken = credentials.apiToken as string
    const workspaceId = credentials.workspaceId as string

    if (!apiToken) {
      throw new Error("API Token is required")
    }

    if (!workspaceId) {
      throw new Error("Workspace ID is required for this operation")
    }

    const operation = this.getNodeParameter("operation", 0) as string

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        if (operation === "schedulePost") {
          const network = this.getNodeParameter("network", itemIndex) as string
          const contentType = this.getNodeParameter("contentType", itemIndex) as string
          const postText = this.getNodeParameter("postText", itemIndex) as string
          const accountIdsString = this.getNodeParameter("accountIds", itemIndex) as string
          const scheduledAt = this.getNodeParameter("scheduledAt", itemIndex) as string
          const state = this.getNodeParameter("state", itemIndex) as string

          const accountIds = accountIdsString.split(",").map((id) => id.trim())

          const accounts = accountIds.map((id) => ({
            id: id,
            scheduled_at: scheduledAt,
          }))

          const networkContent: any = {
            type: contentType,
            text: postText,
          }

          // Handle media types
          const mediaTypes = ["photo", "video", "carousel", "story", "reel", "gif"]
          if (mediaTypes.includes(contentType)) {
            const mediaIdsString = this.getNodeParameter("mediaIds", itemIndex) as string
            if (!mediaIdsString) {
              throw new Error(`Media IDs are required for ${contentType} posts`)
            }
            const mediaIds = mediaIdsString.split(",").map((id) => id.trim())
            networkContent.media = mediaIds.map((id) => ({
              id: id,
              type: contentType === "carousel" ? "photo" : contentType,
            }))
          }

          // Handle link posts
          if (contentType === "link") {
            const linkUrl = this.getNodeParameter("linkUrl", itemIndex) as string
            if (!linkUrl) {
              throw new Error("Link URL is required for link posts")
            }
            networkContent.url = linkUrl
          }

          const endpoint = "https://app.publer.com/api/v1/posts/schedule"

          const requestBody = {
            bulk: {
              state: state,
              posts: [
                {
                  networks: {
                    [network]: networkContent,
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
            },
            qs: {
              workspace_id: workspaceId,
            },
            body: requestBody,
            json: true,
          })

          returnData.push({
            json: response,
            pairedItem: { item: itemIndex },
          })
        }
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
