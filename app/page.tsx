"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loadinig-spinner";
import { ToastNotification } from "@/components/toast-notification";

type RoomStatus = "available" | "occupied";

interface Room {
  id: string;
  number: string;
  floor: number;
  status: RoomStatus;
}

export default function Page() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });
  const getRooms = async () => {
    setIsLoading(true);
    const res = await fetch("/api/rooms");
    const data = await res.json();
    setRooms(data);
    setIsLoading(false);
  };
  useEffect(() => {
    getRooms();
  }, []);

  const showNotification = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  const handleBook = async () => {
    setIsLoading(true);
    if (numberOfRooms <= 0) return;

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: numberOfRooms }),
      });

      if (!res.ok) {
        const error = await res.json();
        showNotification("error", "Booking Failed", `${error.error}`);
        setIsLoading(false);

        return;
      }

      const data = await res.json();
      showNotification("success", "Booking Successful", data.message);
      const roomsRes = await fetch("/api/rooms");
      const roomsData = await roomsRes.json();
      setRooms(roomsData);
      setSelectedRooms(new Set());
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      showNotification(
        "error",
        "Booking Failed",
        `❌ Something went wrong while booking`
      );
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    setSelectedRooms(new Set());
    const result = await fetch("/api/reset", {
      method: "POST",
    });
    if (!result.ok) {
      const error = await result.json();
      showNotification(
        "error",
        "Reset Failed",
        `❌ Something went wrong while reset`
      );
      setIsLoading(false);
    }
    const rooms = await fetch("/api/rooms");
    const roomsData = await rooms.json();
    showNotification("success", "Reset Successful", "Data Cleared");
    setRooms(roomsData);
    setIsLoading(false);
  };

  const handleRandom = async () => {
    setIsLoading(true);
    const result = await fetch("/api/random", {
      method: "POST",
    });
    if (!result.ok) {
      const error = result.json();
      showNotification(
        "error",
        "Random Setting Failed",
        `❌ Something went wrong while network call`
      );
      setIsLoading(false);
    }
    showNotification(
      "success",
      "Random Set Successful",
      "Rooms are now set to Random Data"
    );

    await getRooms();
    setIsLoading(false);
  };

  const getRoomStatusColor = (room: Room) => {
    if (selectedRooms.has(room.id)) return "bg-primary text-primary-foreground";

    switch (room.status) {
      case "available":
        return "bg-card hover:bg-accent/50 border-border";
      case "occupied":
        return "bg-destructive text-destructive-foreground border-destructive";
      default:
        return "bg-card";
    }
  };

  const groupedRooms = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<number, Room[]>);

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(
    (room) => room.status === "available"
  ).length;
  const occupiedRooms = rooms.filter(
    (room) => room.status === "occupied"
  ).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            Hotel Room Reservation System
          </h1>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="roomCount"
                  className="text-sm font-medium text-foreground"
                >
                  No of Rooms:
                </label>
                <input
                  id="roomCount"
                  type="number"
                  min="1"
                  max="5"
                  disabled={isLoading}
                  value={numberOfRooms}
                  onChange={(e) =>
                    setNumberOfRooms(Number.parseInt(e.target.value) || 1)
                  }
                  className="w-20 px-3 py-2 border border-border rounded-md bg-input text-foreground"
                />
              </div>

              <Button
                onClick={handleBook}
                disabled={numberOfRooms === 0 || isLoading || isBooking}
                className="bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90"
              >
                {isBooking ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Booking...</span>
                  </div>
                ) : (
                  `Book ${numberOfRooms}`
                )}
              </Button>

              <Button
                onClick={handleReset}
                variant="outline"
                disabled={isLoading || isBooking}
                className="border-border cursor-pointer text-foreground hover:bg-accent/50 bg-transparent"
              >
                Reset
              </Button>

              <Button
                onClick={handleRandom}
                variant="outline"
                disabled={isLoading || isBooking}
                className="border-border cursor-pointer text-foreground hover:bg-accent/50 bg-transparent"
              >
                Random
              </Button>
            </div>

            {!isLoading && (
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-card border border-border rounded"></div>
                  <span className="text-muted-foreground">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-destructive rounded"></div>
                  <span className="text-muted-foreground">Occupied</span>
                </div>
              </div>
            )}
          </div>
          {!isLoading && (
            <div className="flex gap-4 mt-4">
              <Badge variant="outline" className="text-sm">
                Total: {totalRooms}
              </Badge>
              <Badge variant="outline" className="text-sm text-primary">
                Available: {availableRooms}
              </Badge>
              <Badge variant="outline" className="text-sm text-destructive">
                Occupied: {occupiedRooms}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          <div className="flex-shrink-0">
            <Card className="w-24 h-[600px] bg-card border-border flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-2">
                  <svg
                    className="w-6 h-6 text-primary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  LIFT
                </p>
              </div>
            </Card>
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground">Loading rooms...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.keys(groupedRooms)
                  .map(Number)
                  .sort((a, b) => b - a)
                  .map((floor) => (
                    <div key={floor} className="flex items-center gap-2">
                      <div className="w-16 text-sm font-medium text-muted-foreground">
                        Floor {floor}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {groupedRooms[floor]
                          .sort((a, b) => a.number.localeCompare(b.number))
                          .map((room) => (
                            <Card
                              key={room.id}
                              className={cn(
                                "w-16 h-12 flex items-center justify-center transition-all duration-200 border",
                                getRoomStatusColor(room),
                                room.status === "available" && "hover:scale-105"
                              )}
                            >
                              <span className="text-xs font-medium">
                                {room.number}
                              </span>
                            </Card>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastNotification
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
}
