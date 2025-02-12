import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Count the total number of matieres
    const totalMatieres = await prisma.matiere.count();

    return NextResponse.json({
      total: totalMatieres,
    });
  } catch (error) {
    console.error("Error fetching matieres count:", error);
    return NextResponse.json(
      { error: "Failed to fetch matieres count" },
      { status: 500 }
    );
  }
}
