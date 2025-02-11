// Import necessary modules from Next.js and other libraries
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from "next/server";

// GET method to retrieve room booking by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    console.error("Unauthorized: No session or user email found");
    return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
  }
  try {

    const booking = await db.booking.findUnique({
      where: { booking_id: params.id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Room booking not found' }, { status: 404 });
    }

    // console.log(booking);

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT method to update room booking by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    console.error("Unauthorized: No session or user email found");
    return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
  }

  try {
    const admin = await db.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
  
    // if (admin?.role !== UserRole.ADMIN) {
    //   console.error('Forbidden: Admin privileges required');
    //   return NextResponse.json({ error: 'Forbidden: Admin privileges required' }, { status: 403 });
    // }

    const { booking_id, room_id, user_id, booking_date, topic, start_date, stop_date, start_time, stop_time, approve_status, remark } = await req.json();
    
    const updatedData = {
        room_id,
        user_id,
        booking_date,
        topic,
        start_date,
        stop_date,
        start_time,
        stop_time,
        approve_status,
        remark,
    };

    const updatedRoomBooking = await db.booking.update({
      where: { booking_id: params.id },
      data: updatedData,
    });

    return NextResponse.json(updatedRoomBooking);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE method to delete room booking by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deletedRoomBooking = await db.booking.delete({
      where: { booking_id: params.id },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
