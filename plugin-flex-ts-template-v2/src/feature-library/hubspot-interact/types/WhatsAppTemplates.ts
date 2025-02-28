export type ContentApprovalContentType = "twilio/quick-reply" | "twilio/simple"

export interface ContentApprovalRequest {
  allow_category_change: boolean
  category: "UTILITY" | "MARKETING",
  content_type: ContentApprovalContentType,
  name: string
  rejection_reason?: string
  status: "approved" | "rejected" | "pending"
}

export interface ContentApprovalInstance {
  dateCreated?: string
  dateUpdated?: string
  sid: string
  accountSid: string
  friendlyName: string
  language: string
  variables: {
    [key: string]: string
  }
  types: any
  approvalRequests: ContentApprovalRequest
}