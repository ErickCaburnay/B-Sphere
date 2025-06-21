// /app/api/residents/search/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("q")?.trim();

    if (!keyword) {
      // If no keyword, return all residents (or empty array if you prefer)
      const allResidents = await prisma.resident.findMany({
        orderBy: { lastName: 'asc' },
      });
      const formatted = allResidents.map(r => ({
        ...r,
        birthdate: r.birthdate.toISOString(),
      }));
      return NextResponse.json(formatted);
    }

    // Flexible search: match on name or ID (case-insensitive)
    const residents = await prisma.resident.findMany({
      where: {
        OR: [
          { firstName: { contains: keyword, mode: 'insensitive' } },
          { middleName: { contains: keyword, mode: 'insensitive' } },
          { lastName: { contains: keyword, mode: 'insensitive' } },
          { suffix: { contains: keyword, mode: 'insensitive' } },
          { id: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      orderBy: { lastName: 'asc' },
    });

    const formattedResidents = residents.map(resident => ({
      ...resident,
      birthdate: resident.birthdate.toISOString(),
    }));

    return NextResponse.json(formattedResidents);
  } catch (error) {
    console.error("Error searching residents:", error);
    return NextResponse.json(
      { error: "Failed to search residents" },
      { status: 500 }
    );
  }
}
