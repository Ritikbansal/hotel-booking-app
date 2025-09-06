import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    await prisma.room.deleteMany();
    await prisma.floor.deleteMany();

    for (let floor = 1; floor <= 10; floor++) {
      const isLast = floor === 10;
      const createdFloor = await prisma.floor.create({
        data: {
          floorNumber: floor,
          isLastFloor: isLast,
        },
      });

      if (floor < 10) {
        for (let room = 1; room <= 10; room++) {
          const roomNumber = floor * 100 + room;
          await prisma.room.create({
            data: {
              roomNumber,
              isAvailable: true,
              floorId: createdFloor.id,
            },
          });
        }
      } else {
        for (let room = 1; room <= 7; room++) {
          const roomNumber = 1000 + room;
          await prisma.room.create({
            data: {
              roomNumber,
              isAvailable: true,
              floorId: createdFloor.id,
            },
          });
        }
      }
    }

    return NextResponse.json({
      message: "✅ Database reset and reseeded successfully",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "❌ Reset failed", details: error.message },
      { status: 500 }
    );
  }
}
