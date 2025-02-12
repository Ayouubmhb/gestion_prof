import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch logs from the database
    const logs = await prisma.log.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true, // Include user details
      },
    });

    // Format the timestamp into Date and Time
    const formattedLogs = logs.map(log => {
      const [date, time] = log.createdAt.toISOString().split("T");
      const formattedTime = time.split(".")[0]; // Remove milliseconds if needed
      return {
        id: log.id,
        userId: log.userId,
        user: `${log.user.nom} ${log.user.prenom}`,
        action: log.action,
        details: log.details,
        date: date,
        time: formattedTime,
      };
    });

    return NextResponse.json(formattedLogs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des logs." }, { status: 500 });
  }
}