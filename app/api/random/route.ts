import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();
export async function POST() {
  const randomNumber = Math.floor(Math.random() * 97) + 1;
  await prisma.room.updateMany({
    data: {
      isAvailable: true,
    },
  });
  const allRooms = await prisma.room.findMany({
    where: {
      isAvailable: true,
    },
    select: {
      id: true,
    },
  });
  const shuffled = allRooms
    .sort(() => Math.random() - 0.5)
    .slice(0, randomNumber);
  await Promise.all(
    shuffled.map((room) =>
      prisma.room.update({
        where: { id: room.id },
        data: { isAvailable: false },
      })
    )
  );
  return NextResponse.json({ message: "Done!!" });
}
