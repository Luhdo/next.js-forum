import { ObjectId } from "mongodb";

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  image?: string;
  role: "owner" | "co-owner" | "admin" | "vip" | "user";
  bio?: string;
  location?: string;
  website?: string;
  reputation: number;
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  _id: ObjectId;
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  authorId: ObjectId;
  visibility: "public" | "private";
  isPinned: boolean;
  isLocked: boolean;
  subscriberIds: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  _id: ObjectId;
  topicId: ObjectId;
  authorId: ObjectId;
  content: string;
  reactions: {
    likes: ObjectId[];
    bookmarks: ObjectId[];
  };
  parentId?: ObjectId; // For threaded comments
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  _id: ObjectId;
  contentId: ObjectId;
  contentType: "topic" | "post";
  reporterId: ObjectId;
  reason: ReportReason;
  description: string;
  evidence?: string;
  status: ReportStatus;
  priority: ReportPriority;
  assignedTo?: ObjectId;
  resolution?: {
    action: ModeratorAction;
    note?: string;
    moderatorId: ObjectId;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type ReportReason =
  | "hate_speech"
  | "harassment"
  | "spam"
  | "adult_content"
  | "misinformation"
  | "personal_info"
  | "copyright"
  | "other";

export type ReportStatus = "pending" | "in_review" | "resolved" | "rejected";
export type ReportPriority = "low" | "medium" | "high" | "urgent";
export type ModeratorAction =
  | "no_action"
  | "edit_content"
  | "delete_content"
  | "warn_user"
  | "suspend_user"
  | "ban_user";

export interface ModerationLog {
  _id: ObjectId;
  contentId: ObjectId;
  contentType: "topic" | "post";
  moderatorId: ObjectId;
  action: ModeratorAction;
  reason: string;
  metadata: {
    reportId?: ObjectId;
    previousContent?: string;
    automatedAction?: boolean;
  };
  createdAt: Date;
}

export interface ContentFilter {
  _id: ObjectId;
  type: "keyword" | "regex" | "domain";
  pattern: string;
  category: "hate_speech" | "adult_content" | "spam" | "personal_info";
  action: "flag" | "block" | "delete";
  isEnabled: boolean;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
