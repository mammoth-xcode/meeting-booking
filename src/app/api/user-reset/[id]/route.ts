import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { DEFAULT_USERS, DEFAULT_EMAILS } from "@/app/constants";
import { getServerSession } from 'next-auth'

export async function PUT(
  req: Request,
  { params }: { params: { email: string } }
) {
  if (req.method !== 'PUT') {
    // Method Not Allowed
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  // server side session.
  const session = await getServerSession()
  if (!session) {
    console.error("Unauthorized !");
    return NextResponse.json({ error: 'Unauthorized !' }, { status: 401 });
  }

  try {
    // Parse the incoming JSON body
    const { email } = await req.json();

    // Validate the email input
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if email exists
    const existsUser  = await db.user.findUnique({
      where: { email },
      select: { employee_id: true, name: true, lastname: true },
    });
    
    console.log(existsUser);

    if(!existsUser){
      return NextResponse.json({ error: 'Email not found!' }, { status: 404 });
    }

    const hashedPassword = DEFAULT_USERS.PASSWORD ? await bcrypt.hash(DEFAULT_USERS.PASSWORD, 10) : undefined;

    const updatedData = {
      password : hashedPassword,
    };

    // reset password
    await db.user.update({
      where: { employee_id: existsUser.employee_id },
      data: updatedData,
    });

    // Create the transporter using Gmail (you can change this for other email services)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Replace with another email service if needed
      auth: {
        user: DEFAULT_EMAILS.SENDER, // Your email username
        pass: process.env.EMAIL_APP_PASS, // Your email password or app-specific password
      },
    });

    const regHeader = 'รีเซ็ตรหัสผ่าน';
    const defaultUserPassword = DEFAULT_USERS.PASSWORD;  // Assuming DEFAULT_USERS.PASSWORD exists

    // Setup email content
    const mailOptions = {
      from: `${process.env.EMAIL_USER}`, // Sender email
      to: email, // Recipient email
      subject: 'รีเซ็ตรหัสผ่านระบบจองห้องประชุมออนไลน์',
      text: `ขอแจ้งให้ทราบว่า เราได้${regHeader} ระบบจองห้องประชุมออนไลน์ ของท่านเรียบร้อยแล้ว.\n\nเข้าสู่ระบบอีกครั้ง ที่ลิงค์นี้ :\n${process.env.NEXTAUTH_URL}\n\nรหัสผ่านใหม่ คือ ${defaultUserPassword}\n\nเมื่อเข้าสู่ระบบด้วยรหัสผ่านนี้แล้ว\nเพื่อความปลอดภัย กรุณาเปลี่ยนรหัสผ่านอีกครั้ง`,
    };

    //text: `Click the link below to reset your password:\n\n${process.env.NEXTAUTH_URL} ${encodeURIComponent(email)}`

    // Send the email
    await transporter.sendMail(mailOptions);

    // Success response
    return NextResponse.json({ message: 'Password reset email sent successfully' }, { status: 200 });

  } catch (error) {
    console.error(error);
    // Internal server error
    return NextResponse.json({ error: 'Failed to send email', details: error }, { status: 500 });
  }
}
