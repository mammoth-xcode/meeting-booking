import { getServerSession } from 'next-auth'

import { NextRequest, NextResponse } from "next/server";
import { UserRole } from '@prisma/client';
import { db } from "@/lib/db";

// GET method to retrieve all rooms
export async function GET() {
  // server side session.
    const session = await getServerSession()
  
    if (!session) {
      console.error("Unauthorized !");
      return NextResponse.json({ error: 'Unauthorized !' }, { status: 401 });
    }
  
  try {
    const rooms = await db.room.findMany({
      select: {
        room_id: true,
        room_name: true,
        roomtype_id: true,
        capacity: true,
        image_name: true,
        location: true,
        roomType: true,
        equipment: true,
      },
      orderBy: [
        {
          room_id: 'asc',
        },
      ],
      // include: {
      //   roomType: true,  // This will include the related RoomType for each Room
      // },
    });

    // Replace `null` with an empty string for the location
    const updatedRooms = rooms.map(room => ({
      ...room,
      location: room.location ?? "",  // If `location` is null, replace it with an empty string
    }));

    return NextResponse.json(updatedRooms, { status: 200 });

    // return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}


// POST method to create a new room
export async function POST(req: NextRequest) {
  // server side session.
  const session = await getServerSession();

  if (!session) {
    console.error("Unauthorized!");
    return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
  }

  try {
    // Get the admin's details from the session
    const admin = await db.user.findUnique({
      where: { email: session?.user?.email || "" }, // or another identifier from session
      select: { role: true },
    });

    if (admin?.role !== UserRole.ADMIN) {
      console.error("Not admin!");
      return NextResponse.json(
        { error: "403 Forbidden!", details: "Need Administrator privilege." },
        { status: 403 }
      ); // 403 Forbidden
    }

    const { room_name, roomtype_id, equipment_id, capacity, location, image_name } =
      await req.json();

    // Validation: Ensure the required fields are provided
    // || !roomtype_id || !capacity || !location || !equipment_id
    if (!room_name || !equipment_id) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if room already exists in the database
    const existsRoom = await db.room.findFirst({
      where: { room_name },
      select: { room_name: true },
    });

    if (existsRoom) {
      return NextResponse.json(
        { error: "Room name is already taken" },
        { status: 409 }
      );
    }

    // Function to generate a unique room_id
    const generateUniqueRoomId = async () => {
      let roomId;
      let formattedRoomId;

      do {
        // Get the highest numerical part from the room table (ignore 'R' and '0')
        const maxroom = await db.room.findFirst({
          orderBy: { room_id: "desc" }, // Get the most recent room_id
          select: { room_id: true },
        });

        // If no room is found, start from 'R001'
        const nextId = maxroom
          ? parseInt(maxroom.room_id.replace("R", "").replace(/^0+/, ""), 10) + 1
          : 1;

        // Format the next room_id with leading zeros
        formattedRoomId = `R${nextId.toString().padStart(3, "0")}`;

        // Check if this ID exists in the database
        roomId = await db.room.findUnique({
          where: { room_id: formattedRoomId },
        });
      } while (roomId); // Repeat if the generated ID already exists

      return formattedRoomId;
    };

    const uniqueRoomId = await generateUniqueRoomId();

    // Check if the roomtype_id is valid
    const roomType = await db.roomType.findUnique({
      where: { roomtype_id },
    });

    if (!roomType) {
      return NextResponse.json({ error: "Invalid room type" }, { status: 400 });
    }

    // Create new room with relationships
    const newRoom = await db.room.create({
      data: {
        room_id: uniqueRoomId, // Generate a unique room_id
        room_name,
        roomType: {
          connect: { roomtype_id }, // Connect to roomType by roomtype_id
        },
        capacity,
        location,
        image_name: image_name || "", // Optional
        equipment: {
          connect: { equipment_id }, // Connect to equipment by equipment_id
        },
      },
    });

    return NextResponse.json(newRoom, { status: 201 }); // 201 Created status
  } catch (error) {
    console.error("Failed to create room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}




// // PUT method to update room


// DELETE method to delete a user
export async function DELETE(req: NextRequest) {
  // server side session.
  const session = await getServerSession()

  if (!session) {
    console.error("Unauthorized !");
    return NextResponse.json({ error: 'Unauthorized !' }, { status: 401 });
  }

  try {
    // Get the admin's details from the session
    const admin = await db.user.findUnique({
      where: { email: session?.user?.email || '' },
      select: { role: true },
    });

    // Check if the admin has the required privileges
    if (admin?.role !== UserRole.ADMIN) {
      console.error('Not admin!');
      return NextResponse.json({ error: '403 Forbidden !', details: 'Need Administrator privilege.' }, { status: 403 });
    }

    const { room_id } = await req.json();

    const deletedRoom = await db.room.delete({
      where: { room_id },
    });

    return NextResponse.json({ message: 'Room deleted successfully', room: deletedRoom }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete room :", error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}