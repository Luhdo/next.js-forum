import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type } = await request.json();
    const userId = new ObjectId(session.user.id);
    const postId = new ObjectId(params.id);
    const db = await getDb();

    const post = await db.collection("posts").findOne({ _id: postId });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const field = `reactions.${type}s`;
    const update = post.reactions[type + "s"].some((id: ObjectId) =>
      id.equals(userId)
    )
      ? { $pull: { [field]: userId } }
      : { $addToSet: { [field]: userId } };

    const result = await db
      .collection("posts")
      .findOneAndUpdate({ _id: postId }, update, { returnDocument: "after" });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update reaction:", error);
    return NextResponse.json(
      { error: "Failed to update reaction" },
      { status: 500 }
    );
  }
}
