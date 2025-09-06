-- CreateTable
CREATE TABLE "public"."Floor" (
    "id" SERIAL NOT NULL,
    "floorNumber" INTEGER NOT NULL,
    "isLastFloor" BOOLEAN NOT NULL,

    CONSTRAINT "Floor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Room" (
    "id" SERIAL NOT NULL,
    "roomNumber" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "floorId" INTEGER NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Floor_floorNumber_key" ON "public"."Floor"("floorNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Room_roomNumber_key" ON "public"."Room"("roomNumber");

-- AddForeignKey
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "public"."Floor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
