import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Zod schema for professor input validation
const professorSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Email invalide"),


  telephone: z
    .string()
    .regex(/^\d{10}$/, "Le numéro de téléphone doit contenir 10 chiffres"),
  type: z.enum(["permanent", "vacataire"]),
  matieresEnseignees: z
    .array(z.string())
    .min(1, "Au moins une matière enseignée est requise"),
  photo: z.string().optional(),
});

export async function GET() {
  try {
    const professors = await prisma.professeur.findMany({
      include: {
        user: true,
        matieresProfesseurs: {
          include: {
            matiere: true,
          },
        },
      },
    });

    const transformedProfessors = professors.map(
      (prof: {
        id: string;
        user: {
          id: string;
          nom: string;
          prenom: string;
          email: string;
          telephone: string | null;
          photo: string | null;
        };
        type: string;
        matieresProfesseurs: any[];
      }) => ({
        id: prof.user.id,
        nom: prof.user.nom,
        prenom: prof.user.prenom,
        email: prof.user.email,
        telephone: prof.user.telephone,
        type: prof.type,
        matieresEnseignees: prof.matieresProfesseurs.map(
          (mp: { matiere: { nom: string } }) => mp.matiere.nom
        ),
        photo: prof.user.photo,
      })
    );

    return NextResponse.json(transformedProfessors);
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json(
      { error: "Failed to fetch professors from database" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries());

    // Handle file upload
    const file = formData.get("photo") as File | null;
    let photoUrl = "";

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Ensure the uploads directory exists
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "pictures"
      );
      await fs.mkdir(uploadDir, { recursive: true });

      // Generate a unique filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${
        file.name.split(".")[0]
      }-${uniqueSuffix}${path.extname(file.name)}`;
      const filepath = path.join(uploadDir, filename);

      // Write the file
      await fs.writeFile(filepath, buffer);

      // Set the photo URL
      photoUrl = `/uploads/pictures/${filename}`;
    }

    // Prepare data for validation
    const professorData = {
      ...body,
      matieresEnseignees: body.matieresEnseignees
        ? JSON.parse(body.matieresEnseignees as string)
        : [],
      photo: photoUrl,
    };

    // Validate input data
    const validationResult = professorSchema.safeParse(professorData);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors);
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { nom, prenom, email, telephone, type, matieresEnseignees, photo } =
      validationResult.data;
    // ✅ Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email déjà utilisée" },
        { status: 400 }
      );
    }

    // ✅ Generate random password and hash it
    const randomPassword = Math.random().toString(36).slice(-10); // Random 10-character password
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        nom,
        prenom,
        email,
        telephone,
        photo,
        password: hashedPassword, // hashed random password
        professeur: {
          create: {
            type,
            matieresProfesseurs: {
              create: matieresEnseignees.map((matiereName) => ({
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
      include: {
        professeur: {
          include: {
            matieresProfesseurs: {
              include: {
                matiere: true,
              },
            },
          },
        },
      },

    });
    
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
      to: email,
      subject: "Votre compte a été créé avec succès",
      text: `Bonjour ${prenom} ${nom},\n\nVotre compte a été créé avec succès.\nVoici votre mot de passe temporaire : ${randomPassword}\nVeuillez le changer dès que possible.\n\nCordialement,\nL'équipe.`,
    };

    await transporter.sendMail(mailOptions);


    console.log("Professor created successfully:");

    return NextResponse.json("Success", { status: 201 });
  } catch (error) {
    console.error("Error adding professor:", error);
    return NextResponse.json(
      {
        error: "Failed to add professor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const data = await request.json();
    const id = data.id;
    console.log(id);

    if (!id) {


      return NextResponse.json(
        { error: "Professor ID is required" },
        { status: 400 }
      );
    }

    const deletedProfessor = await prisma.user.delete({
      where: { id },
      include: { professeur: true },

    });

    return NextResponse.json(deletedProfessor);
  } catch (error) {
    console.error("Error deleting professor:", error);
    return NextResponse.json(
      { error: "Failed to delete professor" },
      { status: 500 }
    );
  }
}