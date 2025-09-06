import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { count } = await req.json();

    if (!count || count < 1) {
      return NextResponse.json(
        { error: "Invalid room count" },
        { status: 400 }
      );
    }

    const availableRooms = await prisma.room.findMany({
      where: { isAvailable: true },
      take: count,
    });

    if (availableRooms.length < count) {
      return NextResponse.json(
        { error: "Not enough available rooms" },
        { status: 400 }
      );
    }

    const booked = await Promise.all(
      availableRooms.map((room) =>
        prisma.room.update({
          where: { id: room.id },
          data: { isAvailable: false },
        })
      )
    );

    return NextResponse.json({
      message: `✅ Successfully booked ${count} room(s)`,
      rooms: booked,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
