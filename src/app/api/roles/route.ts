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

    const roles = await db.role.findMany({
      select: {
        role_id: true,
        role_name: true,
      },
      orderBy: [
        {
          role_id: 'asc',
        },
      ],
    });

    // const roles = await db.position.findMany();

    // console.log(roles);
    
    return NextResponse.json(roles, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

// POST method to create a new role
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

    const { role_id, role_name } = await req.json();

    // Check if email or username already exists in the database
    const existsRole = await db.role.findFirst({
      where: {
        OR: [
          { role_id },
          { role_name },
        ],
      },
      select: { role_id: true, role_name: true },
    });

    if (existsRole) {
      if (existsRole.role_id) {
        return NextResponse.json({ error: 'Role ID is already in use' }, { status: 409 });
      }
      if (existsRole.role_name) {
        return NextResponse.json({ error: 'Role Name is already taken' }, { status: 409 });
      }
    }

    // // Get the role's details
    // const roleId = await db.role.count(); // Count the total number of roles

    // // Generate the role ID by padding with leading zeros (2 padding zeros)
    // const formattedroleId = `RT${(roleId + 0).toString().padStart(2, '0')}`;

    // // Function to generate a unique role_id
    // const generateUniqueroleId = async () => {
    //   let roleId; // Declare a variable to store the generated position ID
    //   let formattedroleId;

    //   do {
    //     // Get the highest numerical part from the role table (ignore 'RT' and '0')
    //     const maxrole = await db.role.findFirst({
    //         orderBy: { role_id: 'desc' }, // Get the most recent role_id
    //         select: { role_id: true },
    //     });
    
    //     // If no role is found, start from 'PS01'
    //     const nextId = maxrole
    //         ? parseInt(maxrole.role_id.replace('RT', '').replace(/^0+/, ''), 10) + 1
    //         : 1;
    
    //     // Format the next role_id with leading zeros
    //     formattedroleId = `RT${nextId.toString().padStart(2, '0')}`;
    
    //     // Check if this ID exists in the database
    //     roleId = await db.role.findUnique({
    //         where: { role_id: formattedroleId },
    //     });
    
    //     // console.log(formattedroleId);
    
    //   } while (roleId); // Repeat if the generated ID already exists

    //   // Return the unique position ID
    //   return formattedroleId;
    // };

    // const uniqueroleId = await generateUniqueroleId();

    // console.log(role_id)
    // console.log(role_name)

    const newRole = await db.role.create({
      data: {
        role_id,
        role_name,
      },
    });
    return NextResponse.json(newRole, { status: 201 }); // 201 Created status
  } catch (error) {
    console.error("Failed to create Role:", error);
    return NextResponse.json({ error: 'Failed to create Role' }, { status: 500 });
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

    const { role_id, role_name } = await req.json();

    const updatedRole = await db.role.update({
      where: { role_id },
      data: {
        role_name,
      },
    });

    return NextResponse.json(updatedRole, { status: 200 });
  } catch (error) {
    console.error("Failed to update Role:", error);
    return NextResponse.json({ error: 'Failed to update Role' }, { status: 500 });
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
