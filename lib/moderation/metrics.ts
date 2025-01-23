import { getDb } from "../db";
import { ObjectId } from "mongodb";

export async function generateModerationMetrics(
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();

  const [reports, logs] = await Promise.all([
    db
      .collection("reports")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              status: "$status",
              reason: "$reason",
              priority: "$priority",
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray(),

    db
      .collection("moderationLogs")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              moderatorId: "$moderatorId",
              action: "$action",
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray(),
  ]);

  // Calculate average resolution time
  const resolvedReports = await db
    .collection("reports")
    .aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: "resolved",
          "resolution.timestamp": { $exists: true },
        },
      },
      {
        $project: {
          resolutionTime: {
            $subtract: ["$resolution.timestamp", "$createdAt"],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: "$resolutionTime" },
          minResolutionTime: { $min: "$resolutionTime" },
          maxResolutionTime: { $max: "$resolutionTime" },
        },
      },
    ])
    .toArray();

  // Calculate moderator performance metrics
  const moderatorMetrics = await Promise.all(
    logs
      .reduce((acc: ObjectId[], log) => {
        if (!acc.includes(log._id.moderatorId)) {
          acc.push(log._id.moderatorId);
        }
        return acc;
      }, [])
      .map(async (moderatorId) => {
        const moderator = await db
          .collection("users")
          .findOne({ _id: moderatorId }, { projection: { name: 1, email: 1 } });

        const moderatorLogs = logs.filter((log) =>
          log._id.moderatorId.equals(moderatorId)
        );

        return {
          moderator,
          actions: moderatorLogs.reduce((acc, log) => {
            acc[log._id.action] = log.count;
            return acc;
          }, {} as Record<string, number>),
          totalActions: moderatorLogs.reduce((sum, log) => sum + log.count, 0),
        };
      })
  );

  return {
    summary: {
      totalReports: reports.reduce((sum, r) => sum + r.count, 0),
      byStatus: reports.reduce((acc, r) => {
        acc[r._id.status] = (acc[r._id.status] || 0) + r.count;
        return acc;
      }, {} as Record<string, number>),
      byReason: reports.reduce((acc, r) => {
        acc[r._id.reason] = (acc[r._id.reason] || 0) + r.count;
        return acc;
      }, {} as Record<string, number>),
      byPriority: reports.reduce((acc, r) => {
        acc[r._id.priority] = (acc[r._id.priority] || 0) + r.count;
        return acc;
      }, {} as Record<string, number>),
    },
    resolutionTimes: resolvedReports[0] || {
      avgResolutionTime: 0,
      minResolutionTime: 0,
      maxResolutionTime: 0,
    },
    moderatorPerformance: moderatorMetrics,
  };
}
