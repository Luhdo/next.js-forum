import { getDb } from "./db";
import { ObjectId } from "mongodb";
import {
  Report,
  ReportReason,
  ModeratorAction,
  ContentFilter,
} from "./db/schema";
import { MODERATION_RULES } from "./moderation/rules";
import { filterContent } from "./moderation/filter";

export async function reportContent(
  contentId: string,
  contentType: "topic" | "post",
  reporterId: string,
  reason: ReportReason,
  description: string,
  evidence?: string
): Promise<Report> {
  const db = await getDb();

  // Check for existing reports from this user
  const existingReport = await db.collection("reports").findOne({
    contentId: new ObjectId(contentId),
    reporterId: new ObjectId(reporterId),
    status: { $in: ["pending", "in_review"] },
  });

  if (existingReport) {
    throw new Error("You have already reported this content");
  }

  // Calculate priority based on reason and content age
  const content = await db.collection(contentType + "s").findOne({
    _id: new ObjectId(contentId),
  });

  if (!content) {
    throw new Error("Content not found");
  }

  const priority = calculatePriority(reason, content.createdAt);

  const report = {
    contentId: new ObjectId(contentId),
    contentType,
    reporterId: new ObjectId(reporterId),
    reason,
    description,
    evidence,
    status: "pending",
    priority,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("reports").insertOne(report);
  return { ...report, _id: result.insertedId };
}

export async function moderateContent(
  reportId: string,
  moderatorId: string,
  action: ModeratorAction,
  note?: string
): Promise<void> {
  const db = await getDb();
  const report = await db.collection("reports").findOne({
    _id: new ObjectId(reportId),
  });

  if (!report) {
    throw new Error("Report not found");
  }

  const session = db.client.startSession();
  try {
    await session.withTransaction(async () => {
      // Update report status
      await db.collection("reports").updateOne(
        { _id: new ObjectId(reportId) },
        {
          $set: {
            status: "resolved",
            resolution: {
              action,
              note,
              moderatorId: new ObjectId(moderatorId),
              timestamp: new Date(),
            },
            updatedAt: new Date(),
          },
        }
      );

      // Create moderation log
      await db.collection("moderationLogs").insertOne({
        contentId: report.contentId,
        contentType: report.contentType,
        moderatorId: new ObjectId(moderatorId),
        action,
        reason: note || report.reason,
        metadata: {
          reportId: report._id,
          automatedAction: false,
        },
        createdAt: new Date(),
      });

      // Execute moderation action
      if (action !== "no_action") {
        await executeModerationAction(
          report.contentId,
          report.contentType,
          action
        );
      }
    });
  } finally {
    await session.endSession();
  }
}

export async function scanContent(
  content: string,
  type: "topic" | "post"
): Promise<{
  isAllowed: boolean;
  flags: Array<{
    type: string;
    reason: string;
  }>;
}> {
  const db = await getDb();
  const filters = await db
    .collection<ContentFilter>("contentFilters")
    .find({ isEnabled: true })
    .toArray();

  return filterContent(content, filters);
}

function calculatePriority(
  reason: ReportReason,
  contentDate: Date
): "low" | "medium" | "high" | "urgent" {
  const age = Date.now() - contentDate.getTime();
  const ageInHours = age / (1000 * 60 * 60);

  // High-priority reasons
  if (["hate_speech", "harassment", "personal_info"].includes(reason)) {
    return ageInHours < 24 ? "urgent" : "high";
  }

  // Medium-priority reasons
  if (["adult_content", "misinformation"].includes(reason)) {
    return ageInHours < 24 ? "high" : "medium";
  }

  // Low-priority reasons
  return ageInHours < 24 ? "medium" : "low";
}

async function executeModerationAction(
  contentId: ObjectId,
  contentType: "topic" | "post",
  action: ModeratorAction
): Promise<void> {
  const db = await getDb();

  switch (action) {
    case "delete_content":
      await db.collection(contentType + "s").deleteOne({ _id: contentId });
      break;

    case "suspend_user":
    case "ban_user":
      const content = await db
        .collection(contentType + "s")
        .findOne({ _id: contentId });
      if (content) {
        await db.collection("users").updateOne(
          { _id: content.authorId },
          {
            $set: {
              status: action === "suspend_user" ? "suspended" : "banned",
              statusUpdatedAt: new Date(),
            },
          }
        );
      }
      break;
  }
}
