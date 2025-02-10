import { getServerSession } from 'next-auth'

// Import necessary modules from Next.js and other libraries
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

// GET method to retrieve role by ID
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

    const role = await db.role.findUnique({
      select: {
        role_id: true,
        role_name: true,
      },
      where: { role_id: params.id },
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT method to update role by ID
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

    const { role_id, role_name } = await req.json();

    // Check if email or username already exists in the database
    const existsRole = await db.role.findFirst({
      where: {
        OR: [
          { role_name },
        ],
        NOT: {
          role_id: role_id,  // Exclude role_id if present
        },
      },
      select: { role_id: true, role_name: true },
    });

    if (existsRole) {
      if (existsRole.role_id) {
        return NextResponse.json({ error: 'Role ID is already in use' }, { status: 409 });
      }
      if (existsRole.role_name) {
        return NextResponse.json({ error: 'Role Name is already taken' }, { status: 400 });
      }
    }
    
    const updatedData = {
      role_name,
    };

    const updatedRole = await db.role.update({
      where: { role_id: params.id },
      data: updatedData,
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE method to delete role by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  // Server-side session check
  const session = await getServerSession();

  if (!session) {
    console.error("Unauthorized!");
    return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 });
  }

  try {
    // Get the admin's details from the session
    const admin = await db.user.findUnique({
      where: { email: session?.user?.email || '' },
      select: { role: true },
    });

    // Check if the user has the required role (ADMIN)
    if (admin?.role !== UserRole.ADMIN) {
      console.error('Not admin!');
      return NextResponse.json({ error: '403 Forbidden!', details: 'Administrator privilege required.' }, { status: 403 });
    }

    // Ensure params.id is a valid UserRole enum value
    const roleToDelete = params.id.toUpperCase() as keyof typeof UserRole;

    // Validate that the roleToDelete is a valid role in the enum
    if (!(roleToDelete in UserRole)) {
      console.error(`Invalid role: ${roleToDelete}`);
      return NextResponse.json({ error: 'Invalid role provided' }, { status: 400 });
    }

    // Get the role details to check if it's in use by any users
    const userRoleUsed = await db.user.findFirst({
      select: { role: true },
      where: { role: roleToDelete },
    });

    // If the role is in use by users, prevent deletion
    if (userRoleUsed) {
      return NextResponse.json({ error: 'Cannot delete Role because it has associated users' }, { status: 400 });
    }

    // // restricted delete---------------------------------------------------------------------------------------------
    // // Define restricted roles that cannot be deleted (ADMIN, USER, MANAGER)
    // const restrictedRoles = [UserRole.ADMIN, UserRole.USER, UserRole.MANAGER];

    // // Check if the role is in the restricted roles list
    // if (restrictedRoles.includes(roleToDelete as UserRole)) {
    //   return NextResponse.json({ error: 'Cannot delete this role, it is restricted.' }, { status: 400 });
    // }
    // // end restricted delete-----------------------------------------------------------------------------------------

    // Attempt to delete the role
    const deletedRole = await db.role.delete({
      where: { role_id: roleToDelete }, // Assuming role_id matches the role string
    });

    console.log('Deleted Role:', deletedRole);
    return NextResponse.json({ status: 200, message: 'Role deleted successfully' });

  } catch (error) {
    console.error('Error deleting Role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
