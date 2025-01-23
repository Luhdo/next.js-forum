import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { REPUTATION_POINTS } from "@/lib/reputation";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, action } = await request.json();
    if (!Object.keys(REPUTATION_POINTS).includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const points = REPUTATION_POINTS[action as keyof typeof REPUTATION_POINTS];
    const db = await getDb();

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $inc: { reputation: points },
        $push: {
          reputationHistory: {
            action,
            points,
            timestamp: new Date(),
          },
        },
      }
    );

    if (!result.matchedCount) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(userId) },
        { projection: { reputation: 1 } }
      );

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update reputation:", error);
    return NextResponse.json(
      { error: "Failed to update reputation" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const userId = new ObjectId(session.user.id);

    const user = await db.collection("users").findOne(
      { _id: userId },
      {
        projection: {
          reputation: 1,
          reputationHistory: 1,
        },
      }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch reputation:", error);
    return NextResponse.json(
      { error: "Failed to fetch reputation" },
      { status: 500 }
    );
  }
}
