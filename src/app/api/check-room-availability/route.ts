import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface CheckRoomAvailabilityQuery {
  room_id: string;
  start_time: string; // In HHMM format
  end_time: string;   // In HHMM format
  booking_date: string; // In YYYYMMDD format
  start_date: string; // In YYYYMMDD format
  stop_date: string; // In YYYYMMDD format
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const room_id = url.searchParams.get('room_id');
  const start_time = url.searchParams.get('start_time');
  const end_time = url.searchParams.get('end_time');
  // const booking_date = url.searchParams.get('booking_date');
  const start_date = url.searchParams.get('start_date');
  const stop_date = url.searchParams.get('stop_date');

  // Validate required query parameters
  if (!room_id || !start_time || !end_time || !start_date || !stop_date) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing required query parameters' }),
      { status: 400 }
    );
  }

  try {
    // Prisma query to check if the room is booked in the specified time range
    const roomBookings = await db.booking.findMany({
      where: {
        room_id,
        stop_date, // Check bookings for the given date
        OR: [
          {
            AND: [
              { start_time: { lte: end_time } },  // Booking start before or at requested end time
              { stop_time: { gte: start_time } },  // Booking stop after or at requested start time
            ],
          },
        ],
      },
    });

    const inUsed: {
      status: string;
      message: string;
    } = {
      status: 'in use',
      message: 'ใช้งาน'
    }
    const available: {
      status: string;
      message: string;
    } = {
      status: 'available',
      message: 'ว่าง'
    }
    // Check if any bookings were found
    if (roomBookings.length > 0) {
      // console.log(inUsed)
      return new NextResponse(
        JSON.stringify({ status: inUsed.status, message: inUsed.message }),
        { status: 200 }
      );
    } else {
      // console.log(inUsed)
      return new NextResponse(
        JSON.stringify({ status: available.status, message: available.message }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error checking room availability:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error checking room availability' }),
      { status: 500 }
    );
  }
}
