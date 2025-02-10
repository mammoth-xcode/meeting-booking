import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import nodemailer from 'nodemailer';
import { DEFAULT_USERS, DEFAULT_EMAILS } from "@/app/constants";

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

// PUT method to update user by ID
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    console.error("Unauthorized: No session or user email found");
    return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
  }

  try {
    const admin = await db.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (admin?.role !== UserRole.ADMIN) {
      console.error('Forbidden: Admin privileges required');
      return NextResponse.json({ error: 'Forbidden: Admin privileges required' }, { status: 403 });
    }

    const { password, email } = await req.json();
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const updatedData = {
      ...(hashedPassword && { password: hashedPassword }),
    };

    // reset password
    const updatedUser = await db.user.update({
      where: { employee_id: Number(params.id) },
      data: updatedData,
    });

    // // Send email to admin to verify user status.
    // Create the transporter using Gmail (you can change this for other email services)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Replace with another email service if needed
      auth: {
        user: DEFAULT_EMAILS.SENDER, // Your email username
        pass: process.env.EMAIL_APP_PASS, // Your email password or app-specific password
      },
    });

    const regHeader = 'รีเซ็ตรหัสผ่านระบบจองห้องประชุมออนไลน์';
    const defaultUserPassword = DEFAULT_USERS.PASSWORD;  // Assuming DEFAULT_USERS.PASSWORD exists

    // Setup email content
    const userMailOptions = {
      from: DEFAULT_EMAILS.SENDER, // Sender email
      to: email, // Recipient email : user
      subject: regHeader,
      text: `${regHeader} เรียบร้อยแล้ว.\n\nเข้าสู่ระบบอีกครั้ง ที่ลิงค์นี้ :\n${process.env.NEXTAUTH_URL}\n\nรหัสผ่านใหม่ คือ ${defaultUserPassword}\n\nเมื่อเข้าสู่ระบบด้วยรหัสผ่านนี้แล้ว\nเพื่อความปลอดภัย กรุณาเปลี่ยนรหัสผ่านอีกครั้ง`,
    };

    // Send the email to user
    await transporter.sendMail(userMailOptions);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
