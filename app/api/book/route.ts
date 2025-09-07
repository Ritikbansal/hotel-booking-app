export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
type Room = {
  id: number;
  roomNumber: number;
  floorNumber?: number;
  isAvailable: boolean;
};
type RoomPosition = {
  id: number;
  roomNumber: number;
  floorNumber: number;
  position: number;
  isAvailable: boolean;
};
type FloorWithRooms = {
  id: number;
  floorNumber: number;
  isLastFloor: boolean;
  rooms: Room[];
};
class RoomBookingOptimizer {
  private floors: FloorWithRooms[];

  constructor(floors: FloorWithRooms[]) {
    this.floors = floors;
  }

  private getRoomPositions(): RoomPosition[] {
    return this.floors.flatMap((floor) =>
      floor.rooms
        .filter((room) => room.isAvailable)
        .map((room) => ({
          id: room.id,
          roomNumber: room.roomNumber,
          floorNumber: floor.floorNumber,
          position: room.roomNumber % 100,
          isAvailable: room.isAvailable,
        }))
    );
  }

  private calculateTravelTime(
    room1: RoomPosition,
    room2: RoomPosition
  ): number {
    if (room1.floorNumber === room2.floorNumber) {
      return Math.abs(room1.position - room2.position);
    } else {
      return (
        2 * Math.abs(room1.floorNumber - room2.floorNumber) +
        room1.position -
        1 +
        room2.position -
        1
      );
    }
  }

  private getTotalTravelTime(rooms: RoomPosition[]): number {
    if (rooms.length <= 1) return 0;

    let maxTime = 0;

    for (let i = 0; i < rooms.length; i++) {
      for (let j = i + 1; j < rooms.length; j++) {
        const time = this.calculateTravelTime(rooms[i], rooms[j]);
        if (time > maxTime) {
          maxTime = time;
        }
      }
    }

    return maxTime;
  }

  private findSingleFloorSolution(count: number): RoomPosition[] | null {
    for (const floor of this.floors) {
      const availableRooms = floor.rooms
        .filter((room) => room.isAvailable)
        .map((room) => ({
          id: room.id,
          roomNumber: room.roomNumber,
          floorNumber: floor.floorNumber,
          position: room.roomNumber % 100,
          isAvailable: room.isAvailable,
        }))
        .sort((a, b) => a.position - b.position);

      if (availableRooms.length >= count) {
        const consecutive = this.findConsecutiveRooms(availableRooms, count);
        if (consecutive.length === count) {
          return consecutive;
        }
        return availableRooms.slice(0, count);
      }
    }
    return null;
  }

  private findConsecutiveRooms(
    rooms: RoomPosition[],
    count: number
  ): RoomPosition[] {
    for (let i = 0; i <= rooms.length - count; i++) {
      let consecutive = [rooms[i]];

      for (let j = i + 1; j < rooms.length && consecutive.length < count; j++) {
        if (rooms[j].position === rooms[j - 1].position + 1) {
          consecutive.push(rooms[j]);
        } else {
          break;
        }
      }

      if (consecutive.length === count) {
        return consecutive;
      }
    }
    return [];
  }

  private findMultiFloorSolution(count: number): RoomPosition[] {
    const allRooms = this.getRoomPositions();

    if (allRooms.length < count) return [];

    return this.checkForRooms(allRooms, count);
  }

  private checkForRooms(rooms: RoomPosition[], count: number): RoomPosition[] {
    let bestCombination: RoomPosition[] = [];
    let minTravelTime = Infinity;

    const combinations = this.generateCombinations(rooms, count);

    for (const combination of combinations) {
      const travelTime = this.getTotalTravelTime(combination);
      if (travelTime < minTravelTime) {
        minTravelTime = travelTime;
        bestCombination = combination;
      } else if (travelTime === minTravelTime) {
        const currentSum = bestCombination.reduce(
          (acc, r) => acc + r.roomNumber,
          0
        );
        const newSum = combination.reduce((acc, r) => acc + r.roomNumber, 0);
        if (newSum < currentSum) {
          bestCombination = combination;
        }
      }
    }

    return bestCombination;
  }

  private generateCombinations<T>(arr: T[], k: number): T[][] {
    if (k > arr.length) return [];
    if (k === 1) return arr.map((item) => [item]);

    const result: T[][] = [];

    for (let i = 0; i <= arr.length - k; i++) {
      const head = arr[i];
      const tailCombos = this.generateCombinations(arr.slice(i + 1), k - 1);

      for (const tail of tailCombos) {
        result.push([head, ...tail]);
      }
    }

    return result;
  }

  public findOptimalRooms(count: number): RoomPosition[] {
    const singleFloorSolution = this.findSingleFloorSolution(count);
    if (singleFloorSolution) {
      return singleFloorSolution;
    }
    return this.findMultiFloorSolution(count);
  }
}

export async function POST(req: Request) {
  try {
    const { count } = await req.json();

    if (!count || count < 1) {
      return NextResponse.json(
        { error: "Invalid room count" },
        { status: 400 }
      );
    }

    const availableRooms = await prisma.floor.findMany({
      select: {
        id: true,
        floorNumber: true,
        isLastFloor: true,
        rooms: {
          select: {
            isAvailable: true,
            floorId: true,
            id: true,
            roomNumber: true,
          },
        },
      },
    });

    const optimizer = new RoomBookingOptimizer(availableRooms);

    const selectedRooms = optimizer.findOptimalRooms(count);
    if (selectedRooms.length < count) {
      return NextResponse.json(
        { error: "Not enough available rooms" },
        { status: 400 }
      );
    }
    const roomIds = selectedRooms.map((room) => room.id);
    const bookedRooms = await Promise.all(
      roomIds.map((roomId) =>
        prisma.room.update({
          where: { id: roomId },
          data: { isAvailable: false },
        })
      )
    );

    return NextResponse.json({
      message: `Successfully booked ${bookedRooms
        .map((room) => room.roomNumber)
        .join(",")} - ${count} room(s)`,
      rooms: bookedRooms.map((room) => room.roomNumber),
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
