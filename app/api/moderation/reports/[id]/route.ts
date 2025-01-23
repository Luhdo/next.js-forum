import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { moderateContent } from "@/lib/moderation";
import { z } from "zod";

const moderationSchema = z.object({
  action: z.enum([
    "no_action",
    "edit_content",
    "delete_content",
    "warn_user",
    "suspend_user",
    "ban_user",
  ]),
  note: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role !== "admin" && session?.user?.role !== "moderator") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = moderationSchema.parse(body);

    await moderateContent(params.id, session.user.id, data.action, data.note);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid moderation data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Failed to moderate content:", error);
    return NextResponse.json(
      { error: "Failed to moderate content" },
      { status: 500 }
    );
  }
}
