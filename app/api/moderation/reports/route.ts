import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/db";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { reportContent } from "@/lib/moderation";

const reportSchema = z.object({
  contentId: z.string(),
  contentType: z.enum(["topic", "post"]),
  reason: z.enum([
    "hate_speech",
    "harassment",
    "spam",
    "adult_content",
    "misinformation",
    "personal_info",
    "copyright",
    "other",
  ]),
  description: z.string().min(10).max(1000),
  evidence: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = reportSchema.parse(body);

    const report = await reportContent(
      data.contentId,
      data.contentType,
      session.user.id,
      data.reason,
      data.description,
      data.evidence
    );

    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid report data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Failed to create report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role !== "admin" && session?.user?.role !== "moderator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  try {
    const db = await getDb();
    const query: any = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const reports = await db
      .collection("reports")
      .find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const total = await db.collection("reports").countDocuments(query);

    return NextResponse.json({
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
