import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const prisma = new PrismaClient()

const professorSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().regex(/^\d{10}$/, "Le numéro de téléphone doit contenir 10 chiffres"),
  type: z.enum(["permanent", "vacataire"]),
  matieresEnseignees: z.array(z.string()).min(1, "Au moins une matière enseignée est requise"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = z.array(professorSchema).parse(body)

    const results = await Promise.all(
      validatedData.map(async (professor) => {
        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: professor.email },
        })

        if (existingUser) {
          return {
            status: "error",
            message: `L'email ${professor.email} est déjà utilisé.`,
          }
        }

        // ✅ Generate random password and hash it
        const randomPassword = Math.random().toString(36).slice(-10); // Random 10-character password
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // If email doesn't exist, create the new professor
        try {
          const newUser = await prisma.user.create({
            data: {
              nom: professor.nom,
              prenom: professor.prenom,
              email: professor.email,
              telephone: professor.telephone,
              password: hashedPassword, // password
              professeur: {
                create: {
                  type: professor.type,
                  matieresProfesseurs: {
                    create: professor.matieresEnseignees.map((matiereName) => ({
                      matiere: {
                        connectOrCreate: {
                          where: { nom: matiereName },
                          create: { nom: matiereName },
                        },
                      },
                    })),
                  },
                },
              },
            },
          })

          // ✅ Send password to user's email in French
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: process.env.EMAIL_USER, // Set environment variable
              pass: process.env.EMAIL_PASS, // Set environment variable
            },
          });
      
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: professor.email,
            subject: "Votre compte a été créé avec succès",
            text: `Bonjour ${professor.prenom} ${professor.nom},\n\nVotre compte a été créé avec succès.\nVoici votre mot de passe temporaire : ${randomPassword}\nVeuillez le changer dès que possible.\n\nCordialement,\nL'équipe.`,
          };
      
          await transporter.sendMail(mailOptions);

          return { status: "success", data: newUser }
        } catch (error) {
          return {
            status: "error",
            message: `Erreur lors de la création du professeur: ${error instanceof Error ? error.message : "Unknown error"}`,
          }
        }
      }),
    )

    const successCount = results.filter((result) => result.status === "success").length
    const errors = results.filter((result) => result.status === "error")

    return NextResponse.json(
      {
        importedCount: successCount,
        errors: errors.map((error) => error.message),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error importing professors:", error)
    return NextResponse.json(
      { error: "Failed to import professors", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}