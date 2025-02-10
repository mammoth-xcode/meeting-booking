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

    const posi = await db.position.findUnique({
      select: {
        position_id: true,
        position_name: true,
      },
      where: { position_id: params.id },
    });

    if (!posi) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 });
    }

    return NextResponse.json(posi);
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

    const { position_id, position_name } = await req.json();

    // Check if email or username already exists in the database
    const existsPosition = await db.position.findFirst({
      where: {
        OR: [
          { position_name },
        ],
        NOT: {
          position_id: position_id,  // Exclude position_id if present
        },
      },
      select: { position_id: true, position_name: true },
    });

    if (existsPosition) {
      if (existsPosition.position_id) {
        return NextResponse.json({ error: 'Position ID is already in use' }, { status: 409 });
      }
      if (existsPosition.position_name) {
        return NextResponse.json({ error: 'Position Name is already taken' }, { status: 400 });
      }
    }
    
    const updatedData = {
      position_name,
    };

    const updatedPosition = await db.position.update({
      where: { position_id: params.id },
      data: updatedData,
    });

    return NextResponse.json(updatedPosition);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE method to delete position by ID
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

    // Get the users's position details
    const userPosiUsed = await db.user.findFirst({
      select: {
        position_id: true,
      },
      where: { position_id: params.id },
    });
    if (userPosiUsed) {
      return NextResponse.json({ error: 'Cannot delete position because it has associated users' }, { status: 400 }); // Already used by users.
    }

    // Attempt to delete the position
    const deletedPosition = await db.position.delete({
      where: { position_id: params.id.toString() },
    });

    console.log('Deleted Position:', deletedPosition); // Log the deleted position
    return NextResponse.json({ status: 200, message: 'Position deleted successfully' }); // Ensure success message is returned
  } catch (error) {
    console.error('Error deleting position:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}