import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "33e3093a466cfba5c15031ae601e1da921502752990d545a31d2ce3a55be496d";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return NextResponse.json({ error: "No token found" }, { status: 401 });

  const token = cookieHeader
    .split(";")
    .find(cookie => cookie.trim().startsWith("token="))
    ?.split("=")[1];

  if (!token) return NextResponse.json({ error: "Token missing" }, { status: 401 });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ user: decoded });
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}