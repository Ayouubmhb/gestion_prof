import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token et mot de passe requis" },
        { status: 400 }
      );
    }

    //New password validation
    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères."}, {status: 400 });
    }
  
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
  
    if (!hasLetter || !hasNumber) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir des lettres et des chiffres." },
        { status: 400 }
      );
    }

    // Vérification directe du token en base
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token },
      include: {user: true},
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Token invalide" },
        { status: 400 }
      );
    }

    // Vérifications combinées
    if (new Date(resetToken.expiresAt) < new Date()) {
      await prisma.passwordReset.deleteMany({ where: { token } });
      return NextResponse.json(
        { error: "Token expiré" },
        { status: 400 }
      );
    }

    // Hash du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Transaction atomique
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.user.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.delete({ where: { token } }),
    ]);

    return NextResponse.json(
      { message: "Mot de passe réinitialisé avec succès" },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: "Échec de la réinitialisation" },
      { status: 500 }
    );
  }
}