import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client"
import { z } from "zod"
import path from "path"
import fs from "fs/promises"

// Zod schema for professor input validation
const professorSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().regex(/^\d{10}$/, "Le numéro de téléphone doit contenir 10 chiffres"),
  type: z.enum(["permanent", "vacataire"]),
  matieresEnseignees: z.array(z.string()).min(1, "Au moins une matière enseignée est requise"),
  photo: z.string().optional(),
})

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  try {
    const professor = await prisma.user.findUnique({
      where: { id },
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

    if (!professor) {
      return NextResponse.json({ error: "Professeur non trouvé" }, { status: 404 });
    }

    const transformedProfessor = {
      id: professor.id,
      nom: professor.nom,
      prenom: professor.prenom,
      email: professor.email,
      telephone: professor.telephone,
      type: professor.professeur?.type || "",
      matieresEnseignees:
        professor.professeur?.matieresProfesseurs.map((mp: { matiere: { nom: any; }; }) => mp.matiere.nom) || [],
      photo: professor.photo,
    };

    return NextResponse.json(transformedProfessor);
  } catch (error) {
    console.error("Prisma error:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des données" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

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
      const uploadDir = path.join(process.cwd(), "public", "uploads", "pictures");
      await fs.mkdir(uploadDir, { recursive: true });

      // Generate a unique filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${file.name.split(".")[0]}-${uniqueSuffix}${path.extname(file.name)}`;
      const filepath = path.join(uploadDir, filename);

      // Write the file
      await fs.writeFile(filepath, buffer);

      // Set the photo URL
      photoUrl = `/uploads/pictures/${filename}`;
    }

    // Prepare data for validation
    const professorData = {
      ...body,
      matieresEnseignees: body.matieresEnseignees ? JSON.parse(body.matieresEnseignees as string) : [],
      photo: photoUrl || body.existingPhoto,
    };

    // Validate input data
    const validationResult = professorSchema.safeParse(professorData);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors);
      return NextResponse.json({ error: validationResult.error.errors[0].message }, { status: 400 });
    }

    const { nom, prenom, email, telephone, type, matieresEnseignees, photo } = validationResult.data;

    // ✅ Check if the user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Professeur non trouvé" }, { status: 404 });
    }

    // ✅ Check if email already exists for another user
    const emailUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (emailUser && emailUser.id !== id) {
      return NextResponse.json({ error: "L'email est déjà utilisé par un autre utilisateur." }, { status: 400 });
    }

    // Update user and professor details
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        nom,
        prenom,
        email,
        telephone,
        photo,
        professeur: {
          update: {
            type,
            matieresProfesseurs: {
              deleteMany: {}, // Remove existing subjects first
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

    console.log("Professor updated successfully:", updatedUser);

    return NextResponse.json("Success", { status: 200 });
  } catch (error) {
    console.error("Error updating professor:", error);
    return NextResponse.json(
      { error: "Failed to update professor", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}