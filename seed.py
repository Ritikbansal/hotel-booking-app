import psycopg2

# Update these with your DB credentials
DB_NAME = "hotel"
DB_USER = "postgres"
DB_PASSWORD = "postgres"
DB_HOST = "localhost"
DB_PORT = "5432"


def seed():
    conn = psycopg2.connect(
        dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT
    )
    cursor = conn.cursor()

    # Insert floors
    for floor in range(1, 11):
        is_last = floor == 10
        cursor.execute(
            'INSERT INTO "Floor" ("floorNumber", "isLastFloor") VALUES (%s, %s) RETURNING id;',
            (floor, is_last),
        )
        floor_id = cursor.fetchone()[0]

        # Insert rooms
        if floor < 10:
            # Floors 1–9 → 10 rooms (e.g. 101–110)
            for room in range(1, 11):
                room_number = floor * 100 + room
                cursor.execute(
                    'INSERT INTO "Room" ("roomNumber", "isAvailable", "floorId") VALUES (%s, %s, %s);',
                    (room_number, True, floor_id),
                )
        else:
            # Floor 10 → only 7 rooms (1001–1007)
            for room in range(1, 8):
                room_number = 1000 + room
                cursor.execute(
                    'INSERT INTO "Room" ("roomNumber", "isAvailable", "floorId") VALUES (%s, %s, %s);',
                    (room_number, True, floor_id),
                )

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Database seeded with 10 floors and rooms.")


if __name__ == "__main__":
    seed()
