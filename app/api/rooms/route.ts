export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: { floor: true },
      orderBy: [{ floorId: "asc" }, { roomNumber: "asc" }],
    });

    const formatted = rooms.map((r) => ({
      id: r.id.toString(),
      number: r.roomNumber.toString(),
      floor: r.floor.floorNumber,
      status: r.isAvailable ? "available" : "occupied",
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
