import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { serialize } from "cookie"

const prisma = new PrismaClient()

// JWT Secret Key (should be stored in .env)
const JWT_SECRET = process.env.JWT_SECRET || "33e3093a466cfba5c15031ae601e1da921502752990d545a31d2ce3a55be496d"

// Handle POST request for login
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Validate user input
    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe sont requis." }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        admin: true,
        professeur: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 })
    }

    // Compare password with hashed password in DB
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 })
    }

    // Determine user type
    const isAdmin = !!user.admin
    const isProfesseur = !!user.professeur

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        photo: user.photo,
        telephone: user.telephone,
        isAdmin,
        isProfesseur,
      },
      JWT_SECRET,
      { expiresIn: "1h" },
    )

    // Create HTTP-only cookie
    const cookie = serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600,
      path: "/",
    })

    // Create response
    const response = NextResponse.json(
      {
        message: "Authentification réussie",
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          isAdmin,
          isProfesseur,
        },
      },
      { status: 200 },
    )

    const action = "Connexion";
    const details = `${user.nom} ${user.prenom} s'est connecté.`
    // Create log for connection
    const newLog = await prisma.log.create({
      data: {
        userId: user.id,
        action: action,
        details: details,
      }
    });

    // Set cookie
    response.headers.set("Set-Cookie", cookie)

    return response
  } catch (error) {
    console.error("Login Error:", error)
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 })
  }
  
}