import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { createHash } from "crypto";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const verificationRequest = await db
      .collection("verificationTokens")
      .findOne({
        token: createHash("sha256").update(token).digest("hex"),
        expires: { $gt: new Date() },
      });

    if (!verificationRequest) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    await Promise.all([
      db.collection("users").updateOne(
        { email: verificationRequest.email },
        {
          $set: { emailVerified: new Date() },
          $inc: { reputation: 5 }, // Bonus reputation for verifying email
        }
      ),
      db
        .collection("verificationTokens")
        .deleteOne({ _id: verificationRequest._id }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to verify email:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
