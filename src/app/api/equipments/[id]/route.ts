import { getServerSession } from 'next-auth'

// Import necessary modules from Next.js and other libraries
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

// GET method to retrieve user by ID
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

    const equip = await db.equipment.findUnique({
      select: {
        equipment_id: true,
        equipment_name: true,
      },
      where: { equipment_id: params.id },
    });

    if (!equip) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    return NextResponse.json(equip);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT method to update user by ID
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

    const { equipment_id, equipment_name } = await req.json();

    // Check if email or username already exists in the database
    const existsEquipment = await db.equipment.findFirst({
      where: {
        OR: [
          { equipment_name },
        ],
        NOT: {
            equipment_id: equipment_id,  // Exclude equipment_id if present
        },
      },
      select: { equipment_id: true, equipment_name: true },
    });

    if (existsEquipment) {
      if (existsEquipment.equipment_id) {
        return NextResponse.json({ error: 'Equipment ID is already in use' }, { status: 409 });
      }
      if (existsEquipment.equipment_name) {
        return NextResponse.json({ error: 'Equipment Name is already taken' }, { status: 400 });
      }
    }
    
    const updatedData = {
        equipment_name,
    };

    const updatedEquipment = await db.equipment.update({
      where: { equipment_id: params.id },
      data: updatedData,
    });

    return NextResponse.json(updatedEquipment);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE method to delete equipment by ID
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

    // Get the users's equipment details
    const roomEquipUsed = await db.room.findFirst({
      select: {
        equipment_id: true,
      },
      where: { equipment_id: params.id },
    });
    if (roomEquipUsed) {
      return NextResponse.json({ error: 'Cannot delete equipment because it has associated rooms' }, { status: 400 }); // Already used by rooms.
    }

    // Attempt to delete the equipment
    const deletedEquipment = await db.equipment.delete({
      where: { equipment_id: params.id.toString() },
    });

    console.log('Deleted equipment:', deletedEquipment); // Log the deleted equipment
    return NextResponse.json({ status: 200, message: 'Equipment deleted successfully' }); // Ensure success message is returned
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}