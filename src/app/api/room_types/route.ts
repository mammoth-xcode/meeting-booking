import { getServerSession } from 'next-auth'

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserRole } from '@prisma/client';

// GET method to retrieve all roomtypes
export async function GET() {
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
      console.error('Need Administrator privilege !');
      return NextResponse.json({ error: '403 Forbidden !', details: 'Need Administrator privilege !' }, { status: 403 }); // 403 Forbidden
    }

    const roomtypes = await db.roomType.findMany({
      select: {
        roomtype_id: true,
        roomtype_name: true,
      },
      orderBy: [
        {
            roomtype_id: 'asc',
        },
      ],
    });

    // const roomtypes = await db.roomType.findMany();

    // console.log(roomtypes);
    
    return NextResponse.json(roomtypes, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch roomtype:", error);
    return NextResponse.json({ error: 'Failed to fetch roomtype' }, { status: 500 });
  }
}

// POST method to create a new roomtype
export async function POST(req: NextRequest) {
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
          { roomtype_id },
          { roomtype_name },
        ],
      },
      select: { roomtype_id: true, roomtype_name: true },
    });

    if (existsRoomType) {
      if (existsRoomType.roomtype_id) {
        return NextResponse.json({ error: 'roomType ID is already in use' }, { status: 409 });
      }
      if (existsRoomType.roomtype_name) {
        return NextResponse.json({ error: 'roomType Name is already taken' }, { status: 409 });
      }
    }

    // // Get the roomType's details
    // const roomtypeId = await db.roomtype.count(); // Count the total number of roomtypes

    // // Generate the roomtype ID by padding with leading zeros (2 padding zeros)
    // const formattedroomtypeId = `RT${(roomtypeId + 0).toString().padStart(2, '0')}`;

    // Function to generate a unique roomtype_id
    const generateUniqueRoomTypeId = async () => {
      let roomTypeId; // Declare a variable to store the generated position ID
      let formattedRoomTypeId;

      do {
        // Get the highest numerical part from the roomtype table (ignore 'RT' and '0')
        const maxRoomType = await db.roomType.findFirst({
            orderBy: { roomtype_id: 'desc' }, // Get the most recent roomtype_id
            select: { roomtype_id: true },
        });
    
        // If no roomtype is found, start from 'PS01'
        const nextId = maxRoomType
            ? parseInt(maxRoomType.roomtype_id.replace('RT', '').replace(/^0+/, ''), 10) + 1
            : 1;
    
        // Format the next roomtype_id with leading zeros
        formattedRoomTypeId = `RT${nextId.toString().padStart(2, '0')}`;
    
        // Check if this ID exists in the database
        roomTypeId = await db.roomType.findUnique({
            where: { roomtype_id: formattedRoomTypeId },
        });
    
        // console.log(formattedRoomTypeId);
    
      } while (roomTypeId); // Repeat if the generated ID already exists

      // Return the unique position ID
      return formattedRoomTypeId;
    };

    const uniqueRoomTypeId = await generateUniqueRoomTypeId();
    const newRoomType = await db.roomType.create({
      data: {
        roomtype_id : uniqueRoomTypeId,
        roomtype_name,
      },
    });
    return NextResponse.json(newRoomType, { status: 201 }); // 201 Created status
  } catch (error) {
    console.error("Failed to create Room Type:", error);
    return NextResponse.json({ error: 'Failed to create Room Type' }, { status: 500 });
  }
}
// PUT method to update user details
export async function PUT(req: NextRequest) {
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

    const { roomtype_id, roomtype_name } = await req.json();

    const updatedRoomType = await db.roomType.update({
      where: { roomtype_id },
      data: {
        roomtype_name,
      },
    });

    return NextResponse.json(updatedRoomType, { status: 200 });
  } catch (error) {
    console.error("Failed to update Room Type:", error);
    return NextResponse.json({ error: 'Failed to update Room Type' }, { status: 500 });
  }
}

// DELETE method to delete a position
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

    const { roomtype_id } = await req.json();

    const deletedRoomType = await db.roomType.delete({
      where: { roomtype_id },
    });

    return NextResponse.json({ message: 'roomtype deleted successfully', roomtype: deletedRoomType }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete roomtype:", error);
    return NextResponse.json({ error: 'Failed to delete roomtype' }, { status: 500 });
  }
}