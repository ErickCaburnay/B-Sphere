import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const firstName = searchParams.get("firstName");
    const lastName = searchParams.get("lastName");
    const birthdate = searchParams.get("birthdate");

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Build the where clause
    const whereClause = {
      AND: [
        {
          firstName: {
            contains: firstName
          }
        },
        {
          lastName: {
            contains: lastName
          }
        }
      ]
    };

    // Add birthdate to search if provided and valid
    if (birthdate) {
      const searchDate = new Date(birthdate);
      // Check if the date is valid before proceeding
      if (!isNaN(searchDate.getTime())) {
        searchDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(searchDate);
        nextDay.setDate(nextDay.getDate() + 1);

        whereClause.AND.push({
          birthdate: {
            gte: searchDate,
            lt: nextDay
          }
        });
      } else {
        console.warn("Invalid birthdate provided to search API:", birthdate);
      }
    }

    // Search for residents
    console.log("Searching residents with where clause:", JSON.stringify(whereClause, null, 2));
    const residents = await prisma.resident.findMany({
      where: whereClause,
      orderBy: {
        lastName: 'asc'
      }
    });

    // Format the response
    const formattedResidents = residents.map(resident => ({
      ...resident,
      birthdate: resident.birthdate.toISOString()
    }));

    return NextResponse.json(formattedResidents);
  } catch (error) {
    console.error("Error searching residents:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: "Failed to search residents" },
      { status: 500 }
    );
  }
} 