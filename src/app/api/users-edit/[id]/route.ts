import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import nodemailer from 'nodemailer';
import { DEFAULT_EMAILS } from "@/app/constants";

// Function to send LINE Notify message
const sendLineNotify = async (message : string) => {
  const token = process.env.LINE_NOTIFY_TOKEN; // Store the LINE Notify token in environment variables

  const response = await fetch('https://notify-api.line.me/api/notify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: new URLSearchParams({
      message: message,
    }),
  });

  if (!response.ok) {
    console.error('Failed to send LINE Notify message');
  }
};

// GET method to retrieve user by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session) {
    console.error("Unauthorized!");
    return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      select: {
        employee_id: true,
        username: true,
        name: true,
        lastname: true,
        email: true,
        telephone: true,
        role: true,
        verification: true,
        position_id: true,
        department_id: true,
      },
      where: { employee_id: Number(params.id) },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT method to update user by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    console.error("Unauthorized: No session or user email found");
    return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
  }

  try {
    // Parse the incoming request
    const { name, lastname, email, username, position_id, department_id, password } = await req.json();
    
    // Log the incoming data for debugging
    console.log("Received data:", { name, lastname, email, username, position_id, department_id, password });

    // Hash the password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const updatedData = {
      name,
      lastname,
      email,
      username,
      position_id,
      department_id,
      ...(hashedPassword && { password: hashedPassword }),
    };

    const updatedUser = await db.user.update({
      where: { employee_id: Number(params.id) },
      data: updatedData,
    });

    console.log('User updated:', updatedUser); // Log the updated user object

    // // Send email to admin to verify user status.
    // Create the transporter using Gmail (you can change this for other email services)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Replace with another email service if needed
      auth: {
        user: DEFAULT_EMAILS.SENDER, // Your email username
        pass: process.env.EMAIL_APP_PASS, // Your email password or app-specific password
      },
    });

    // const regHeader = 'แก้ไขข้อมูลผู้ใช้งาน';

    // // Setup email content
    // const userMailOptions = {
    //   from: DEFAULT_EMAILS.SENDER, // Sender email
    //   to: email, // Recipient email : user
    //   subject: regHeader,
    //   text: `${regHeader} เรียบร้อยแล้ว.\n\nชื่อผู้ใช้งาน : ${name} ${lastname}\nเบอร์โทร : ${telephone}\nอีเมล์ : ${email}\n\nรหัสผู้ใช้งาน : ${username}`,
    // };

    // const mailOptions = {
    //   from: DEFAULT_EMAILS.SENDER, // Sender email
    //   to: DEFAULT_EMAILS.ADMIN, // Recipient email : admin
    //   subject: regHeader,
    //   text: `${regHeader} เรียบร้อยแล้ว.\n\nรหัสผู้ใช้งาน : ${username}\nชื่อผู้ใช้งาน : ${name} ${lastname}\nเบอร์โทร : ${telephone}\nอีเมล์ : ${email}\n\nตรวจสอบข้อมูล : ${process.env.NEXTAUTH_URL}/users`,
    // };

    // // Send the email to user
    // await transporter.sendMail(userMailOptions);

    // // Send the email to admin
    // await transporter.sendMail(mailOptions);

    // // Send LINE Notify message about the new user registration to admin
    // const message = `${regHeader} เรียบร้อยแล้ว.\n\nรหัสผู้ใช้งาน: ${username}\nชื่อผู้ใช้งาน: ${name} ${lastname}\nอีเมล์: ${email}\nTelephone: ${telephone}\n\nตรวจสอบข้อมูล : ${process.env.NEXTAUTH_URL}/users`;
    // await sendLineNotify(message);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE method to delete user by ID
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session) {
    console.error("Unauthorized!");
    return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 });
  }

  try {
    const deletedUser = await db.user.delete({
      where: { employee_id: Number(params.id) },
    });

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
