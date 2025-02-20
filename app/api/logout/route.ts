import { NextResponse } from "next/server";
import { serialize } from "cookie";
import { PrismaClient } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Extract the token from cookies
    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader?.match(/token=([^;]*)/)?.[1];

    let userId: string | null = null;
    let nom: string | null = null;
    let prenom: string | null = null;

    if (token) {
      // Decode the token to get user info
      const decodedToken = jwt.decode(token) as JwtPayload | null;
      userId = decodedToken?.id as string | null;
      nom = decodedToken?.nom as string | null;
      prenom = decodedToken?.prenom as string | null;
    }

    const action = "Déconnexion";
    const details = userId
      ? `${nom} ${prenom} s'est déconnecté.`
      : "Un utilisateur s'est déconnecté.";

    if (userId) {
      await prisma.log.create({
        data: {
          userId,
          action,
          details,
        },
      });
    }

    // Clear the cookie
    const cookie = serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0), // Expire immediately
    });

    const response = NextResponse.json({ message: "Logged out successfully" });
    response.headers.set("Set-Cookie", cookie);
    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
  
}