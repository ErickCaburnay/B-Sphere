import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all officials
export async function GET() {
  try {
    const officials = await prisma.official.findMany({
      include: {
        resident: true
      },
      orderBy: {
        position: 'asc'
      }
    });

    // Format dates in the response
    const formattedOfficials = officials.map(official => ({
      ...official,
      termStart: official.termStart.toISOString(),
      termEnd: official.termEnd.toISOString()
    }));

    return NextResponse.json(formattedOfficials);
  } catch (error) {
    console.error("Error fetching officials:", error);
    return NextResponse.json(
      { error: "Failed to fetch officials" },
      { status: 500 }
    );
  }
}

// POST new official
export async function POST(request) {
  try {
    const body = await request.json();
    const { residentId, position, termStart, termEnd, chairmanship, status } = body;

    if (!residentId) {
      return NextResponse.json(
        { error: "Resident ID is required" },
        { status: 400 }
      );
    }

    // Check if resident is already an official
    const existingOfficial = await prisma.official.findFirst({
      where: {
        residentId: residentId
      }
    });

    if (existingOfficial) {
      return NextResponse.json(
        { error: "This resident is already an official" },
        { status: 400 }
      );
    }

    // Check for unique positions
    const uniquePositions = [
      "Barangay Captain",
      "Barangay Treasurer",
      "Barangay Secretary",
      "SK Chairperson"
    ];

    if (uniquePositions.includes(position)) {
      const existingPositionHolder = await prisma.official.findFirst({
        where: {
          position: position,
          status: "Active"
        },
        include: {
          resident: true
        }
      });

      if (existingPositionHolder) {
        return NextResponse.json(
          { 
            error: "Position already taken",
            message: `The position of ${position} is currently held by ${existingPositionHolder.resident.firstName} ${existingPositionHolder.resident.lastName}. Please remove the current official from this position first.`
          },
          { status: 400 }
        );
      }
    }

    // Create the official
    const official = await prisma.official.create({
      data: {
        residentId: residentId,
        position,
        termStart: new Date(termStart),
        termEnd: new Date(termEnd),
        chairmanship,
        status
      },
      include: {
        resident: true
      }
    });

    return NextResponse.json(official);
  } catch (error) {
    console.error("Error creating official:", error);
    return NextResponse.json(
      { error: "Failed to create official" },
      { status: 500 }
    );
  }
}

// DELETE official
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const residentId = searchParams.get("residentId");

    if (!residentId) {
      return NextResponse.json(
        { error: "Official Resident ID is required" },
        { status: 400 }
      );
    }

    await prisma.official.delete({
      where: { residentId }
    });

    return NextResponse.json({ message: "Official deleted successfully" });
  } catch (error) {
    console.error("Error deleting official:", error);
    return NextResponse.json(
      { error: "Failed to delete official" },
      { status: 500 }
    );
  }
}

// PUT update official
export async function PUT(request) {
  try {
    const body = await request.json();
    const { residentId, position, termStart, termEnd, chairmanship, status } = body;

    if (!residentId) {
      return NextResponse.json(
        { error: "Resident ID is required for update" },
        { status: 400 }
      );
    }

    const updatedOfficial = await prisma.official.update({
      where: { residentId: residentId },
      data: {
        position,
        termStart: new Date(termStart),
        termEnd: new Date(termEnd),
        chairmanship,
        status
      },
      include: {
        resident: true
      }
    });

    return NextResponse.json(updatedOfficial);
  } catch (error) {
    console.error("Error updating official:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Official not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update official" },
      { status: 500 }
    );
  }
} 