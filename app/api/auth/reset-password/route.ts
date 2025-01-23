import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const resetRequest = await db.collection("resetTokens").findOne({
      token: createHash("sha256").update(token).digest("hex"),
      expires: { $gt: new Date() },
    });

    if (!resetRequest) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Promise.all([
      db
        .collection("users")
        .updateOne(
          { email: resetRequest.email },
          { $set: { password: hashedPassword } }
        ),
      db.collection("resetTokens").deleteOne({ _id: resetRequest._id }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reset password:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
