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

    const dept = await db.department.findUnique({
      select: {
        department_id: true,
        department_name: true,
      },
      where: { department_id: params.id },
    });

    if (!dept) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json(dept);
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

    const { department_id, department_name } = await req.json();

    // Check if email or username already exists in the database
    const existsDepartment = await db.department.findFirst({
      where: {
        OR: [
          { department_name },
        ],
        NOT: {
          department_id: department_id,  // Exclude department_id if present
        },
      },
      select: { department_id: true, department_name: true },
    });

    if (existsDepartment) {
      if (existsDepartment.department_id) {
        return NextResponse.json({ error: 'Department ID is already in use' }, { status: 409 });
      }
      if (existsDepartment.department_name) {
        return NextResponse.json({ error: 'Department Name is already taken' }, { status: 400 });
      }
    }
    
    const updatedData = {
      department_name,
    };

    const updatedDepartment = await db.department.update({
      where: { department_id: params.id },
      data: updatedData,
    });

    return NextResponse.json(updatedDepartment);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE method to delete department by ID
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

    // Get the users's department details
    const userDeptUsed = await db.user.findFirst({
      select: {
        department_id: true,
      },
      where: { department_id: params.id },
    });
    if (userDeptUsed) {
      return NextResponse.json({ error: 'Cannot delete department because it has associated users' }, { status: 400 }); // Already used by users.
    }

    // Attempt to delete the department
    const deletedDepartment = await db.department.delete({
      where: { department_id: params.id.toString() },
    });

    console.log('Deleted Department:', deletedDepartment); // Log the deleted department
    return NextResponse.json({ status: 200, message: 'Department deleted successfully' }); // Ensure success message is returned
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}