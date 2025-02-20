import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"; // We'll use nodemailer to send the email

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "33e3093a466cfba5c15031ae601e1da921502752990d545a31d2ce3a55be496d"; // Secret for JWT

// Mail transporter for sending the recovery email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  }
});

export async function POST(req: Request) {
  try {

    const { email } = await req.json();

    // Validate email
    if (!email) {
      return NextResponse.json({ error: "L'email est requis." }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({

        where: { email },
        
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
    }

    // Delete existing password reset entries for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Generate the JWT token with user id and email
    let token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    token = token.substring(0, 120);

    if(!token){
        return NextResponse.json({ error: "Erreur de génération de Token" }, { status: 404 });
    }

    // Store the token in the database for validation during password reset
    await prisma.passwordReset.create({
        data: {
            token,
            userId: user.id,
            expiresAt: new Date(Date.now() + 3600000), // 1 hour expiry
        },
    });

    // Construct the password reset URL
    const resetLink = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/reset-password?token=${token}`;

    // Send the recovery email with the reset link
    await transporter.sendMail({
      to: email,
      subject: "Réinitialisation du mot de passe",
      html: `
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe :</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Si vous n'avez pas demandé cela, ignorez ce message.</p>
      `,
    });

    return NextResponse.json({ message: "Un email de récupération a été envoyé." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}