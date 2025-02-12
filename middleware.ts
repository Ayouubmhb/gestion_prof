//secured middleware
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (err) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/recover"];

  // 1. Handle requests with token
  if (token) {
    const verifiedToken = await verifyToken(token);
    
    // Invalid token handling
    if (!verifiedToken) {
      // Clear invalid token
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      
      // Only redirect if trying to access protected routes
      if (!publicPaths.includes(path)) {
        return response;
      }
      return NextResponse.next();
    }

    const decodedToken = jwt.decode(token) as { isAdmin: boolean }; // Decode the JWT token

    // Valid token handling
    const isAdmin = decodedToken.isAdmin;
    
    // Redirect away from auth pages when logged in
    if (publicPaths.includes(path)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // admin access control
    if ((path.startsWith("/dashboard/professeurs") && !isAdmin) || (path.startsWith("/dashboard/logs") && !isAdmin)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Redirect admin from profile
    if (isAdmin && path.startsWith("/dashboard/profile")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // 2. Handle requests without token
  if (!publicPaths.includes(path)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/recover",
    "/dashboard",
    "/dashboard/:path*",
  ],
};