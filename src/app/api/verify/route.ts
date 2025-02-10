import { getServerSession } from 'next-auth'

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserRole } from '@prisma/client';

import bcrypt from 'bcrypt';

// GET method to retrieve all users
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

    const users = await db.user.findMany({
      select: {
        employee_id: true,
        username: true,
        password: false,
        name: true,
        lastname: true,
        email: true,
        telephone:true ,
        position_id: true,
        department_id: true,
        role: true,
        verification: true,
        position: true,
        department: true,
      },
      orderBy: [
        {
          employee_id: 'asc',
        },
      ],
    });

    // const users = await db.user.findMany();

    // console.log(users);
    
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
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

    const { username, password, name, lastname, email, telephone, position_id, department_id, role, verification, employee_id } = await req.json();

    // Validation: Ensure the required fields are provided
    if (!username || !password || !name || !lastname || !email || !position_id || !department_id || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);  // 10 is the salt rounds

      const newUser = await db.user.create({
        data: {
          username,
          password: hashedPassword,  // Store the hashed password
          name,
          lastname,
          email,
          telephone: telephone || '',
          position_id,
          department_id,
          role,
          verification,
          employee_id,
        },
      });
      return NextResponse.json(newUser, { status: 201 }); // 201 Created status

  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
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

    const { employee_id, username, password, name, lastname, email, telephone } = await req.json();

    const updatedUser = await db.user.update({
      where: { employee_id },
      data: {
        username,
        password,
        name,
        lastname,
        email,
        telephone: telephone || '',
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE method to delete a user
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

    const { employee_id } = await req.json();

    const deletedUser = await db.user.delete({
      where: { employee_id },
    });

    return NextResponse.json({ message: 'User deleted successfully', user: deletedUser }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}