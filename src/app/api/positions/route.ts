import { getServerSession } from 'next-auth'

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserRole } from '@prisma/client';

// GET method to retrieve all positions
export async function GET() {
  // server side session.
  const session = await getServerSession()

  if (!session) {
    console.error("Unauthorized !");
    return NextResponse.json({ error: 'Unauthorized !' }, { status: 401 });
  }

  try {
    // // Get the admin's details from the session
    // const admin = await db.user.findUnique({
    //   where: { email: session?.user?.email || '' }, // or another identifier from session
    //   select: { role: true },
    // });

    // // console.log(admin?.role)

    // // if admin allow to access api
    // if (admin?.role !== UserRole.ADMIN) {
    //   console.error('Need Administrator privilege !');
    //   return NextResponse.json({ error: '403 Forbidden !', details: 'Need Administrator privilege !' }, { status: 403 }); // 403 Forbidden
    // }

    const positions = await db.position.findMany({
      select: {
        position_id: true,
        position_name: true,
      },
      orderBy: [
        {
          position_id: 'asc',
        },
      ],
    });

    // const positions = await db.position.findMany();

    // console.log(positions);
    
    return NextResponse.json(positions, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch positions:", error);
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 });
  }
}

// POST method to create a new user
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

    const { position_id, position_name } = await req.json();

    // Check if email or username already exists in the database
    const existsPosition = await db.position.findFirst({
      where: {
        OR: [
          { position_id },
          { position_name },
        ],
      },
      select: { position_id: true, position_name: true },
    });

    if (existsPosition) {
      if (existsPosition.position_id) {
        return NextResponse.json({ error: 'position ID is already in use' }, { status: 409 });
      }
      if (existsPosition.position_name) {
        return NextResponse.json({ error: 'position Name is already taken' }, { status: 409 });
      }
    }

    // // Get the position's details
    // const positionId = await db.position.count(); // Count the total number of positions

    // // Generate the position ID by padding with leading zeros (2 padding zeros)
    // const formattedpositionId = `DP${(positionId + 0).toString().padStart(2, '0')}`;

    // Function to generate a unique position_id
    const generateUniquePositionId = async () => {
      let positionId; // Declare a variable to store the generated position ID
      let formattedPositionId;

      do {
        // Get the highest numerical part from the position table (ignore 'PS' and '0')
        const maxPosition = await db.position.findFirst({
            orderBy: { position_id: 'desc' }, // Get the most recent position_id
            select: { position_id: true },
        });
    
        // If no position is found, start from 'PS01'
        const nextId = maxPosition
            ? parseInt(maxPosition.position_id.replace('PS', '').replace(/^0+/, ''), 10) + 1
            : 1;
    
        // Format the next position_id with leading zeros
        formattedPositionId = `PS${nextId.toString().padStart(2, '0')}`;
    
        // Check if this ID exists in the database
        positionId = await db.position.findUnique({
            where: { position_id: formattedPositionId },
        });
    
        // console.log(formattedPositionId);
    
      } while (positionId); // Repeat if the generated ID already exists

      // Return the unique position ID
      return formattedPositionId;
    };

    const uniquePositionId = await generateUniquePositionId();
    const newPosition = await db.position.create({
      data: {
        position_id : uniquePositionId,
        position_name,
      },
    });
    return NextResponse.json(newPosition, { status: 201 }); // 201 Created status
  } catch (error) {
    console.error("Failed to create position:", error);
    return NextResponse.json({ error: 'Failed to create position' }, { status: 500 });
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

    const { position_id, position_name } = await req.json();

    const updatedPosition = await db.position.update({
      where: { position_id },
      data: {
        position_name,
      },
    });

    return NextResponse.json(updatedPosition, { status: 200 });
  } catch (error) {
    console.error("Failed to update position:", error);
    return NextResponse.json({ error: 'Failed to update position' }, { status: 500 });
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

    const { position_id } = await req.json();

    const deletedPosition = await db.position.delete({
      where: { position_id },
    });

    return NextResponse.json({ message: 'position deleted successfully', position: deletedPosition }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete position:", error);
    return NextResponse.json({ error: 'Failed to delete position' }, { status: 500 });
  }
}