// Import necessary modules from Next.js and other libraries
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from "next/server";

// GET method to retrieve room by ID
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

    const room = await db.room.findUnique({
      where: { room_id: params.id },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // console.log(room);

    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT method to update room by ID
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
  
    if (admin?.role !== UserRole.ADMIN) {
      console.error('Forbidden: Admin privileges required');
      return NextResponse.json({ error: 'Forbidden: Admin privileges required' }, { status: 403 });
    }

    const { room_name, roomtype_id, equipment_id, capacity, location, image_name } = await req.json();
    
    const updatedData = {
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
    };

    const updatedRoom = await db.room.update({
      where: { room_id: params.id },
      data: updatedData,
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE method to delete room by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deletedRoom = await db.room.delete({
      where: { room_id: params.id },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
