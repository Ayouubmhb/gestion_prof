import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

// Define validation schema for the user input
const passwordSchema = z.object({
  oldPassword: z.string().min(1, "L'ancien mot de passe est requis"),
  password: z
    .string()
    .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères")
    .regex(/[a-zA-Z]/, "Le mot de passe doit contenir des lettres")
    .regex(/[0-9]/, "Le mot de passe doit contenir des chiffres"),
  confirmPassword: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .regex(/[a-zA-Z]/, "Le mot de passe doit contenir des lettres")
    .regex(/[0-9]/, "Le mot de passe doit contenir des chiffres"),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    // Get the JSON data from the body
    const body = await request.json();

    // Validate the input data
    const validationResult = passwordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 });
    }

    const { oldPassword, password, confirmPassword } = validationResult.data;

    // Ensure new password matches the confirm password
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Les mots de passe ne correspondent pas." }, { status: 400 });
    }

    // Check if the user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Compare old password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(oldPassword, existingUser.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
    }

    //compare new password with old password in database
    const passwordMatchNew = await bcrypt.compare(password, existingUser.password);
    if (passwordMatchNew) {
      return NextResponse.json({ error: "Le nouveau mot de passe ne peut pas être le même que l'ancien." }, { status: 401 });
    }

    // Hash the new password before saving it to the database
    const hashedNewPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        password: hashedNewPassword,
      },
    });

    return NextResponse.json({ message: "Mot de passe mis à jour avec succès." }, { status: 200 });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe :", error);
    return NextResponse.json(
      { error: "Échec de la mise à jour du mot de passe", details: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}