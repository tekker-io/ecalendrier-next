import admin from "@/lib/firebaseAdmin";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const idToken = body.idToken;

  if (!idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  if (!admin.apps.length) {
    return NextResponse.json(
      { error: "Server not configured with Firebase Admin" },
      { status: 500 }
    );
  }

  try {
    // Create a session cookie (expires in 5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in ms
    const sessionCookie = await admin
      .auth()
      .createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ ok: true });
    // Set cookie (HTTP only, secure in production)
    res.cookies.set("session", sessionCookie, {
      httpOnly: true,
      path: "/",
      maxAge: expiresIn / 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res;
  } catch (err) {
    console.error("Failed to create session cookie", err);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
