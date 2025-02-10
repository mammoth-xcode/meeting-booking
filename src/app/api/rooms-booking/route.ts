import { getServerSession } from 'next-auth'

import { NextRequest, NextResponse } from "next/server";
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
    const rooms = await db.booking.findMany({
      select: {
        booking_id: true,
        room_id: true,
        user_id: true,
        booking_date: true,
        topic: true,
        start_date: true,
        stop_date: true,
        start_time: true,
        stop_time: true,
        approve_status: true,
        remark: true,
      },
      orderBy: [
        {
            booking_date: 'asc',
        },
      ],
      // include: {
      //   roomType: true,  // This will include the related RoomType for each Room
      // },
    });

    // Replace `null` with an empty string for the location
    const updatedRooms = rooms.map(room => ({
      ...room,
      //location: room.location ?? "",  // If `location` is null, replace it with an empty string
    }));

    // console.log(updatedRooms);

    return NextResponse.json(updatedRooms, { status: 200 });

    // return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch room's booking:", error);
    return NextResponse.json({ error: 'Failed to fetch rooms booking' }, { status: 500 });
  }
}
