import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { startOfWeek, startOfMonth } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "all";
    const db = await getDb();

    let query = {};
    let sort: any = { reputation: -1 };

    if (timeframe === "week" || timeframe === "month") {
      const startDate =
        timeframe === "week"
          ? startOfWeek(new Date())
          : startOfMonth(new Date());

      // Aggregate reputation gained in the specified timeframe
      const pipeline = [
        {
          $match: {
            "reputationHistory.timestamp": { $gte: startDate },
          },
        },
        {
          $addFields: {
            reputationGain: {
              $reduce: {
                input: {
                  $filter: {
                    input: "$reputationHistory",
                    as: "history",
                    cond: { $gte: ["$$history.timestamp", startDate] },
                  },
                },
                initialValue: 0,
                in: { $add: ["$$value", "$$this.points"] },
              },
            },
          },
        },
        {
          $sort: { reputationGain: -1 },
        },
        {
          $limit: 100,
        },
      ];

      const users = await db.collection("users").aggregate(pipeline).toArray();
      return NextResponse.json(users);
    }

    // All-time leaderboard
    const users = await db
      .collection("users")
      .find(query)
      .sort(sort)
      .limit(100)
      .project({
        name: 1,
        image: 1,
        role: 1,
        reputation: 1,
        createdAt: 1,
        reputationGain: "$reputation",
      })
      .toArray();

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
