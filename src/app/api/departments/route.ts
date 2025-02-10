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

    const departments = await db.department.findMany({
      select: {
        department_id: true,
        department_name: true,
      },
      orderBy: [
        {
          department_id: 'asc',
        },
      ],
    });

    // const departments = await db.department.findMany();

    // console.log(positions);
    
    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
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

    const { department_id, department_name } = await req.json();

    // Check if email or username already exists in the database
    const existsDepartment = await db.department.findFirst({
      where: {
        OR: [
          { department_id },
          { department_name },
        ],
      },
      select: { department_id: true, department_name: true },
    });

    if (existsDepartment) {
      if (existsDepartment.department_id) {
        return NextResponse.json({ error: 'Department ID is already in use' }, { status: 409 });
      }
      if (existsDepartment.department_name) {
        return NextResponse.json({ error: 'Department Name is already taken' }, { status: 409 });
      }
    }

    // // Get the department's details
    // const departmentId = await db.department.count(); // Count the total number of departments

    // // Generate the department ID by padding with leading zeros (2 padding zeros)
    // const formattedDepartmentId = `DP${(departmentId + 0).toString().padStart(2, '0')}`;

    // Function to generate a unique department_id
    const generateUniqueDepartmentId = async () => {
      let departmentId; // Declare a variable to store the generated department ID
      let formattedDepartmentId;

      do {
        // Get the highest numerical part from the department table (ignore 'DP' and '0')
        const maxDepartment = await db.department.findFirst({
            orderBy: { department_id: 'desc' }, // Get the most recent department_id
            select: { department_id: true },
        });
    
        // If no department is found, start from 'DP01'
        const nextId = maxDepartment
            ? parseInt(maxDepartment.department_id.replace('DP', '').replace(/^0+/, ''), 10) + 1
            : 1;
    
        // Format the next department_id with leading zeros
        formattedDepartmentId = `DP${nextId.toString().padStart(2, '0')}`;
    
        // Check if this ID exists in the database
        departmentId = await db.department.findUnique({
            where: { department_id: formattedDepartmentId },
        });
    
        // console.log(formattedDepartmentId);
    
      } while (departmentId); // Repeat if the generated ID already exists

      // Return the unique department ID
      return formattedDepartmentId;
    };

    const uniqueDepartmentId = await generateUniqueDepartmentId();
    const newDepartment = await db.department.create({
      data: {
        department_id : uniqueDepartmentId,
        department_name,
      },
    });
    return NextResponse.json(newDepartment, { status: 201 }); // 201 Created status
  } catch (error) {
    console.error("Failed to create department:", error);
    return NextResponse.json({ error: 'Failed to create Department' }, { status: 500 });
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

    const { department_id, department_name } = await req.json();

    const updatedDepartment = await db.department.update({
      where: { department_id },
      data: {
        department_name,
      },
    });

    return NextResponse.json(updatedDepartment, { status: 200 });
  } catch (error) {
    console.error("Failed to update Department:", error);
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

// DELETE method to delete a department
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

    const { department_id } = await req.json();

    const deletedDepartment = await db.department.delete({
      where: { department_id },
    });

    return NextResponse.json({ message: 'Department deleted successfully', department: deletedDepartment }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete Department:", error);
    return NextResponse.json({ error: 'Failed to delete Department' }, { status: 500 });
  }
}