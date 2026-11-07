import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { secretKey } = await req.json();
    const masterKey = process.env.ADMIN_SECRET_KEY;

    if (!masterKey || secretKey !== masterKey) {
      return NextResponse.json({ error: "Invalid master key." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("meda_admin_token", masterKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Server authentication error" }, { status: 500 });
  }
}