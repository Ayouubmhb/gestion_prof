import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs/promises";
import { z } from "zod";
import jwt from "jsonwebtoken"
import { serialize } from "cookie"

// JWT Secret Key (should be stored in .env)
const JWT_SECRET = process.env.JWT_SECRET || "33e3093a466cfba5c15031ae601e1da921502752990d545a31d2ce3a55be496d"

const prisma = new PrismaClient();

const userSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().regex(/^\d{10}$/, "Le numéro de téléphone doit contenir 10 chiffres"),
  photo: z.string().optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries());

    // Handle file upload
    const file = formData.get("photo") as File | null;
    let photoUrl = body.existingPhoto;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads", "pictures");
      await fs.mkdir(uploadDir, { recursive: true });

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${file.name.split(".")[0]}-${uniqueSuffix}${path.extname(file.name)}`;
      const filepath = path.join(uploadDir, filename);

      await fs.writeFile(filepath, buffer);
      photoUrl = `/uploads/pictures/${filename}`;
    }

    const userData = {
      ...body,
      photo: photoUrl,
    };

    // Validate user input
    const validationResult = userSchema.safeParse(userData);
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 });
    }

    const { nom, prenom, email, telephone, photo } = validationResult.data;

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Check for email conflict
    const emailUser = await prisma.user.findUnique({ where: { email } });

    if (emailUser && emailUser.id !== id) {
      return NextResponse.json({ error: "L'email est déjà utilisé par un autre utilisateur." }, { status: 400 });
    }

    // Update user details
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { nom, prenom, email, telephone, photo },
    });

    // Decode existing JWT from cookie without verification
    const cookieHeader = request.headers.get("cookie") || "";
    const jwtCookie = cookieHeader.split("; ").find(cookie => cookie.startsWith("token="));
    const currentToken = jwtCookie ? jwtCookie.split("=")[1] : null;

    let isAdmin = false;
    let isProfesseur = false;

    if (currentToken) {
      const decodedToken: any = jwt.decode(currentToken);
      if (decodedToken) {
        isAdmin = decodedToken.isAdmin;
        isProfesseur = decodedToken.isProfesseur;
        console.log(decodedToken);
      }
    }

    // Generate a new JWT token with preserved values
    const tokenPayload = {
      id: updatedUser.id,
      nom: updatedUser.nom,
      prenom: updatedUser.prenom,
      email: updatedUser.email,
      photo: updatedUser.photo,
      telephone: updatedUser.telephone,
      isAdmin,
      isProfesseur,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1h" });

    // Set the token as a secure HTTP-only cookie
    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 3600, // 1 hour
    });

    console.log("User updated successfully:", tokenPayload);

    const response = NextResponse.json({ message: "User updated successfully" }, { status: 200 });
    response.headers.set("Set-Cookie", cookie);

    return response;

  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}