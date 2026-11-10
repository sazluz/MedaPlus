import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("meda_admin_token")?.value;
  const masterKey = process.env.ADMIN_SECRET_KEY;
  return NextResponse.json({ authenticated: Boolean(token && masterKey && token === masterKey) });
}

export async function POST(req: NextRequest) {
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
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("meda_admin_token");
  return res;
}