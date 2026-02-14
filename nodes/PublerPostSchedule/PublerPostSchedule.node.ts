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
          { name: "WordPress (Self-hosted)", value: "wordpress_basic" },
          { name: "WordPress (Hosted)", value: "wordpress_oauth" },
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
          { name: "Short (YouTube)", value: "short" },
          { name: "GIF", value: "gif" },
          { name: "Poll", value: "poll" },
          { name: "Document", value: "document" },
          { name: "Event", value: "event" },
          { name: "Offer", value: "offer" },
          { name: "Status (Text Only)", value: "status" },
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
        default: [],
        typeOptions: {
          multipleValues: true,
        },
        placeholder: "Add media ID…",
        description: "Media IDs from PublerMediaImportFromUrl node (required for photo/video/carousel/etc.)",
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
        const contentType = this.getNodeParameter("contentType", itemIndex) as string
        const postText = this.getNodeParameter("postText", itemIndex) as string
        const accountIds = this.getNodeParameter("accountIds", itemIndex, []) as string[]
        const cleanAccountIds = accountIds.filter((id) => id.trim() !== "")
        const scheduledAt = this.getNodeParameter("scheduledAt", itemIndex) as string
        const state = this.getNodeParameter("state", itemIndex) as string

        const accounts = cleanAccountIds.map((id) => ({
          id: id.trim(),
          scheduled_at: scheduledAt,
        }))

        const networkContent: any = {
          type: contentType,
          text: postText,
        }

        // Handle media types
        const mediaTypes = ["photo", "video", "carousel", "story", "reel", "gif", "short", "document"]
        if (mediaTypes.includes(contentType)) {
          const mediaIds = this.getNodeParameter("mediaIds", itemIndex, []) as string[]
          const cleanMediaIds = mediaIds.filter((id) => id.trim() !== "")
          if (cleanMediaIds.length === 0) {
            throw new Error(`At least one Media ID is required for ${contentType} posts`)
          }
          // Map content types to media types
          const mediaTypeMap: Record<string, string> = {
            photo: "image",
            video: "video",
            carousel: "image",
            story: "image",
            reel: "video",
            short: "video",
            gif: "gif",
            document: "document",
          }
          networkContent.media = cleanMediaIds.map((id) => ({
            id: id.trim(),
            type: mediaTypeMap[contentType] || contentType,
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
