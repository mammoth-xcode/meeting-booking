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

    const equipments = await db.equipment.findMany({
      select: {
        equipment_id: true,
        equipment_name: true,
      },
      orderBy: [
        {
            equipment_id: 'asc',
        },
      ],
    });

    // const equipments = await db.equipment.findMany();

    // console.log(equipments);
    
    return NextResponse.json(equipments, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch equipments:", error);
    return NextResponse.json({ error: 'Failed to fetch equipments' }, { status: 500 });
  }
}

// POST method to create a new user
export async function POST(req: NextRequest) {
  // server side session
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

    if (admin?.role !== UserRole.ADMIN) {
      console.error('Not admin!');
      return NextResponse.json({ error: '403 Forbidden!', details: 'Need Administrator privilege.' }, { status: 403 });
    }

    const { equipment_name } = await req.json(); // Assuming equipment_id is auto-generated

    // Check if the equipment name already exists
    const existsEquipment = await db.equipment.findFirst({
      where: { equipment_name },
      select: { equipment_id: true, equipment_name: true },
    });

    if (existsEquipment) {
      return NextResponse.json({ error: 'Equipment Name is already taken' }, { status: 409 });
    }

    // Function to generate a unique equipment_id
    const generateUniqueEquipmentId = async () => {
      let equipmentId;
      let formattedEquipmentId;

      do {
        // Get the highest numerical part from the equipment table (ignore 'EQ' and '0')
        const maxEquipment = await db.equipment.findFirst({
            orderBy: { equipment_id: 'desc' }, // Get the most recent equipment_id
            select: { equipment_id: true },
        });
    
        // If no equipment is found, start from 'EQ01'
        const nextId = maxEquipment
            ? parseInt(maxEquipment.equipment_id.replace('EQ', '').replace(/^0+/, ''), 10) + 1
            : 1;
    
        // Format the next equipment_id with leading zeros
        formattedEquipmentId = `EQ${nextId.toString().padStart(2, '0')}`;
    
        // Check if this ID exists in the database
        equipmentId = await db.equipment.findUnique({
            where: { equipment_id: formattedEquipmentId },
        });
    
        // console.log(formattedEquipmentId);
    
      } while (equipmentId); // Repeat if the generated ID already exists

      return formattedEquipmentId;
    };

    const uniqueEquipmentId = await generateUniqueEquipmentId();

    // Create the new equipment record
    const newEquipment = await db.equipment.create({
      data: {
        equipment_id: uniqueEquipmentId,
        equipment_name,
      },
    });

    return NextResponse.json(newEquipment, { status: 201 });

  } catch (error) {
    console.error("Failed to create equipment:", error);
    return NextResponse.json({ error: `Failed to create equipment: ${error}` }, { status: 500 });
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

    const { equipment_id, equipment_name } = await req.json();

    const updateEquipment = await db.equipment.update({
      where: { equipment_id },
      data: {
        equipment_name,
      },
    });

    return NextResponse.json(updateEquipment, { status: 200 });
  } catch (error) {
    console.error("Failed to update equipment:", error);
    return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 });
  }
}

// DELETE method to delete a equipment
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

    const { equipment_id } = await req.json();

    const deletedEquipment = await db.equipment.delete({
      where: { equipment_id },
    });

    return NextResponse.json({ message: 'Equipment deleted successfully', equipment: deletedEquipment }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete equipment:", error);
    return NextResponse.json({ error: 'Failed to delete equipment' }, { status: 500 });
  }
}