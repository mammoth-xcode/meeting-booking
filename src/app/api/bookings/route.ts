import { getServerSession } from 'next-auth'

import { NextRequest, NextResponse } from "next/server";
import { UserRole } from '@prisma/client';
import { db } from "@/lib/db";

// // GET method to retrieve all bookings
export async function GET() {
  // server side session.
    const session = await getServerSession()
  
    if (!session) {
      console.error("Unauthorized !");
      return NextResponse.json({ error: 'Unauthorized !' }, { status: 401 });
    }
  
  try {
    const bookings = await db.booking.findMany({
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
          stop_date: 'desc',
        },
        {
          stop_time: 'desc',
        },
        {
          booking_id: 'desc',
        },
      ],
      // include: {
      //   roomType: true,  // This will include the related RoomType for each Room
      // },
    });

    // Replace `null` with an empty string for the location
    const updatedBookings = bookings.map(booking => ({
      ...booking,
      remark: booking.remark ?? "",  // If `remark` is null, replace it with an empty string
    }));

    return NextResponse.json(updatedBookings, { status: 200 });

    // return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// POST method to create a new room booking
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

    // if (admin?.role !== UserRole.ADMIN) {
    //   console.error("Not admin!");
    //   return NextResponse.json(
    //     { error: "403 Forbidden!", details: "Need Administrator privilege." },
    //     { status: 403 }
    //   ); // 403 Forbidden
    // }

    const { room_id, user_id: rawUserId, booking_date, topic, start_date, stop_date, start_time, stop_time, approve_status, remark } =
      await req.json();

    // Ensure user_id is an integer
    const user_id = parseInt(rawUserId, 10); // Using base 10 for integer conversion

    // Validation: Ensure the required fields are provided
    // || !remark || !approve_status
    if (!room_id || !user_id || !booking_date || !topic || !start_date || !stop_date || !start_time || !stop_time ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Function to generate a unique room_id
    const generateUniqueRoomBookingId = async () => {
      let roomBookingId;
      let formattedRoomBookingId;

      do {
        // Get the highest numerical part from the room booking table (ignore 'B' and '0')
        const maxroomb = await db.booking.findFirst({
          orderBy: { booking_id: "desc" }, // Get the most recent booking_id
          select: { booking_id: true },
        });

        // If no room booking is found, start from 'B001'
        const nextId = maxroomb
          ? parseInt(maxroomb.booking_id.replace("B", "").replace(/^0+/, ""), 10) + 1
          : 1;

        // Format the next room_id with leading zeros
        formattedRoomBookingId = `B${nextId.toString().padStart(3, "0")}`;

        // Check if this ID exists in the database
        roomBookingId = await db.booking.findUnique({
          where: { booking_id: formattedRoomBookingId },
        });
      } while (roomBookingId); // Repeat if the generated ID already exists

      return formattedRoomBookingId;
    };

    const uniqueRoomId = await generateUniqueRoomBookingId();

    // Check if room_id, start_date, and stop_date already exist
    const existingBooking = await db.booking.findFirst({
      where: {
        room_id,
        start_date,
        stop_date,
      },
    });

    if (existingBooking) {
      // Check if the start_time and stop_time do not overlap with the existing booking times
      const existingStartTime = existingBooking.start_time;
      const existingStopTime = existingBooking.stop_time;

      // Compare the new start_time and stop_time with the existing times
      const isStartTimeValid = start_time < existingStartTime || start_time > existingStopTime;
      const isStopTimeValid = stop_time < existingStartTime || stop_time > existingStopTime;
      const isStopTimeValidInRange = stop_time >= existingStartTime && stop_time <= existingStopTime;
      const isStopTimeValidAfterRangeButInDateRange = start_time < existingStartTime && stop_time > existingStopTime;
      const isStartAfterRange = start_time > existingStartTime && stop_time > existingStopTime;

      if(isStopTimeValidInRange){
        // If times overlap, return 409 Conflict
        return NextResponse.json(
          { error: "Time range conflict", details: "The room is already booked after stop used task." },
          { status: 409 }
        );
      }

      if(isStopTimeValidAfterRangeButInDateRange){
        // If times overlap, return 409 Conflict
        return NextResponse.json(
          { error: "Time range conflict", details: "The room is already booked after stop used task." },
          { status: 409 }
        );
      }

      if ((isStartTimeValid && isStopTimeValid) || isStartAfterRange) {
        // If the times are outside the range, allow the booking and return 201
        const newRoomBooking = await db.booking.create({
          data: {
            booking_id: await generateUniqueRoomBookingId(),
            room_id,
            user_id,
            booking_date,
            topic,
            start_date,
            stop_date,
            start_time,
            stop_time,
            approve_status: approve_status || "approved",
            remark,
          },
        });

        return NextResponse.json(newRoomBooking, { status: 201 }); // 201 Created
      } else {
        // If times overlap, return 409 Conflict
        return NextResponse.json(
          { error: "Time range conflict", details: "The room is already booked for the selected time." },
          { status: 409 }
        );
      }
    }

    // If no existing booking, proceed with creating the new booking
    const newRoomBooking = await db.booking.create({
      data: {
        booking_id: uniqueRoomId, // Generate a unique booking_id
        room_id,
        user_id: user_id, // Ensure user_id is an integer
        booking_date,
        topic,
        start_date,
        stop_date,
        start_time,
        stop_time,
        approve_status : approve_status || 'approved', // Default to 'approved'
        remark,
      },
    });

    return NextResponse.json(newRoomBooking, { status: 201 }); // 201 Created status
  } catch (error) {
    console.error("Failed to create room booking:", error);
    return NextResponse.json({ error: "Failed to create room booking" }, { status: 500 });
  }
}

// DELETE method to delete a bookings
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

    // // Check if the admin has the required privileges
    // if (admin?.role !== UserRole.ADMIN) {
    //   console.error('Not admin!');
    //   return NextResponse.json({ error: '403 Forbidden !', details: 'Need Administrator privilege.' }, { status: 403 });
    // }

    const { booking_id } = await req.json();

    const deletedBookings = await db.booking.delete({
      where: { booking_id },
    });

    return NextResponse.json({ message: 'Room booking deleted successfully', booking: deletedBookings }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete room booking :", error);
    return NextResponse.json({ error: 'Failed to delete room booking' }, { status: 500 });
  }
}
