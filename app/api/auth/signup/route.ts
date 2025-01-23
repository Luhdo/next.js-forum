import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = randomBytes(32).toString("hex");

    const user = {
      name,
      email,
      password: hashedPassword,
      role: "user",
      reputation: 0,
      achievements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(user);

    // Create verification token
    await db.collection("verificationTokens").insertOne({
      token: verificationToken,
      email,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: `
        <h1>Welcome to our forum!</h1>
        <p>Click the link below to verify your email address:</p>
        <p><a href="${verificationUrl}">Verify Email</a></p>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    return NextResponse.json({ success: true, userId: result.insertedId });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
