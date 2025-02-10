import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface CheckRoomAvailabilityQuery {
  room_id: string;
  start_time: string; // In HHMM format
  end_time: string;   // In HHMM format
  booking_date: string; // In YYYYMMDD format
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const room_id = url.searchParams.get('room_id');
  const start_date = url.searchParams.get('start_date'); // start_date in YYYYMMDD format
  const stop_date = url.searchParams.get('stop_date'); // stop_date in YYYYMMDD format

  // Validate required query parameters
  if (!room_id || !start_date || !stop_date) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing required query parameters' }),
      { status: 400 }
    );
  }

  try {
    // Get today's date in YYYYMMDD format
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0].replace(/-/g, ''); // Get YYYYMMDD format

    // Get the first day of the current month (e.g., 2025-01-01)
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayFormatted = `${firstDayOfMonth.getFullYear()}${(firstDayOfMonth.getMonth() + 1).toString().padStart(2, '0')}${firstDayOfMonth.getDate().toString().padStart(2, '0')}`;

    // Get the last day of the current month (e.g., 2025-01-31)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const lastDayFormatted = `${lastDayOfMonth.getFullYear()}${(lastDayOfMonth.getMonth() + 1).toString().padStart(2, '0')}${lastDayOfMonth.getDate().toString().padStart(2, '0')}`;

    // Check if the provided dates are within the current month
    const isStartDateInRange = start_date >= firstDayFormatted && start_date <= lastDayFormatted;
    const isStopDateInRange = stop_date >= firstDayFormatted && stop_date <= lastDayFormatted;

    // If either start_date or stop_date is out of the range of the current month
    if (!isStartDateInRange || !isStopDateInRange) {
      return new NextResponse(
        JSON.stringify({ error: 'start_date or stop_date is out of range' }),
        { status: 400 }
      );
    }

    // Check if the provided range is in the future compared to the current date
    const isStartDateInFuture = start_date >= todayFormatted;
    const isStopDateInFuture = stop_date >= todayFormatted;

    if (!isStartDateInFuture || !isStopDateInFuture) {
      return new NextResponse(
        JSON.stringify({ error: 'Dates must be in the future' }),
        { status: 400 }
      );
    }

    // Prisma query to check if the room is booked in the specified time range
    const roomBookings = await db.booking.findMany({
      where: {
        room_id,
        booking_date: {
          gte: start_date, // Bookings on or after start date
          lte: stop_date   // Bookings on or before stop date
        }
      },
    });

    const inUsed = {
      status: 'in range',
      message: 'อยู่ในช่วงวันที่',
    };

    const available = {
      status: 'available',
      message: 'ห้องว่าง',
    };

    // If there are any bookings found, the room is considered in use
    if (roomBookings.length > 0) {
      return new NextResponse(
        JSON.stringify({ status: inUsed.status, message: inUsed.message }),
        { status: 200 }
      );
    } else {
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
