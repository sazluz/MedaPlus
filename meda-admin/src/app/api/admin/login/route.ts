import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { passphrase } = await req.json();
    const masterKey = process.env.ADMIN_SECRET_KEY;

    if (!masterKey || passphrase !== masterKey) {
      return NextResponse.json({ error: "Invalid admin passphrase." }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set("meda_admin_token", masterKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Server authentication error." }, { status: 500 });
  }
}