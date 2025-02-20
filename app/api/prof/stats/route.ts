import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const totalProfessors = await prisma.professeur.count();
    const permanentProfessors = await prisma.professeur.count({
      where: { type: "permanent" },
    });
    const vacataireProfessors = await prisma.professeur.count({
      where: { type: "vacataire" },
    });

    // To be replaced later
    const professorTrends = [
      { month: "Jan", count: 10 },
      { month: "Feb", count: 15 },
      { month: "Mar", count: 20 },
      { month: "Apr", count: 25 },
      { month: "May", count: 30 },
      { month: "Jun", count: 35 },
    ];

    return NextResponse.json({
      total: totalProfessors,
      permanent: permanentProfessors,
      vacataire: vacataireProfessors,
      trends: professorTrends, // Monthly trends
    });
  } catch (error) {
    console.error("Error fetching professor stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
