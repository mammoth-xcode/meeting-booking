import { getServerSession } from 'next-auth'

// Import necessary modules from Next.js and other libraries
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

// GET method to retrieve roomtype by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  // server side session.
  const session = await getServerSession()

  if (!session) {
    console.error("Unauthorized !");
    return NextResponse.json({ error: 'Unauthorized !' }, { status: 401 });
  }

  try {
    // Get the admin's details from the session
    const admin = await db.user.findUnique({
      where: { email: session?.user?.email || '' }, // or another identifier from session
      select: { role: true },
    });

    // console.log(admin?.role)
    // if admin allow to access api
    if (admin?.role !==   UserRole.ADMIN) {
      console.error('Not admin!');
      return NextResponse.json({ error: '403 Forbidden !', details: 'Need Administrator privilege.' }, { status: 403 }); // 403 Forbidden
    }

    const rmType = await db.roomType.findUnique({
      select: {
        roomtype_id: true,
        roomtype_name: true,
      },
      where: { roomtype_id: params.id },
    });

    if (!rmType) {
      return NextResponse.json({ error: 'Room Type not found' }, { status: 404 });
    }

    return NextResponse.json(rmType);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT method to update roomtype by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  // server side session.
  const session = await getServerSession()

  if (!session) {
    console.error("Unauthorized !");
    return NextResponse.json({ error: 'Unauthorized !' }, { status: 401 });
  }

  try {
    // Get the admin's details from the session
    const admin = await db.user.findUnique({
      where: { email: session?.user?.email || '' }, // or another identifier from session
      select: { role: true },
    });

    // console.log(admin?.role)
    // if admin allow to access api
    if (admin?.role !== UserRole.ADMIN) {
      console.error('Not admin!');
      return NextResponse.json({ error: '403 Forbidden !', details: 'Need Administrator privilege.' }, { status: 403 }); // 403 Forbidden
    }

    const { roomtype_id, roomtype_name } = await req.json();

    // Check if email or username already exists in the database
    const existsRoomType = await db.roomType.findFirst({
      where: {
        OR: [
          { roomtype_name },
        ],
        NOT: {
          roomtype_id: roomtype_id,  // Exclude roomtype_id if present
        },
      },
      select: { roomtype_id: true, roomtype_name: true },
    });

    if (existsRoomType) {
      if (existsRoomType.roomtype_id) {
        return NextResponse.json({ error: 'Room Type ID is already in use' }, { status: 409 });
      }
      if (existsRoomType.roomtype_name) {
        return NextResponse.json({ error: 'Room Type Name is already taken' }, { status: 400 });
      }
    }
    
    const updatedData = {
      roomtype_name,
    };

    const updatedRoomType = await db.roomType.update({
      where: { roomtype_id: params.id },
      data: updatedData,
    });

    return NextResponse.json(updatedRoomType);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE method to delete roomType by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  // server side session.
  const session = await getServerSession();

  if (!session) {
    console.error("Unauthorized !");
    return NextResponse.json({ error: 'Unauthorized !' }, { status: 401 });
  }

  try {
    // Get the admin's details from the session
    const admin = await db.user.findUnique({
      where: { email: session?.user?.email || '' }, // or another identifier from session
      select: { role: true },
    });

    // Check if the user has the required role (ADMIN)
    if (admin?.role !== UserRole.ADMIN) {
      console.error('Not admin!');
      return NextResponse.json({ error: '403 Forbidden !', details: 'Need Administrator privilege.' }, { status: 403 }); // 403 Forbidden
    }

    // Get the rooms's roomType details
    const roomRmTypeUsed = await db.room.findFirst({
      select: {
        roomtype_id: true,
      },
      where: { roomtype_id: params.id },
    });
    if (roomRmTypeUsed) {
      return NextResponse.json({ error: 'Cannot delete Room Type because it has associated rooms' }, { status: 400 }); // Already used by rooms.
    }

    // Attempt to delete the roomType
    const deletedRoomType = await db.roomType.delete({
      where: { roomtype_id: params.id.toString() },
    });

    console.log('Deleted Room Type:', deletedRoomType); // Log the deleted roomType
    return NextResponse.json({ status: 200, message: 'Room Type deleted successfully' }); // Ensure success message is returned
  } catch (error) {
    console.error('Error deleting Room Type:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}