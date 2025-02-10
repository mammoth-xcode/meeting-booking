import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import nodemailer from 'nodemailer';
import { DEFAULT_USERS, DEFAULT_EMAILS } from "@/app/constants";

export async function PUT(req: NextRequest) {
  if (req.method !== 'PUT') {
    // Method Not Allowed
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    // Parse the incoming JSON body
    const { email } = await req.json();

    // Validate the email input
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Get the admin's details from the session
        const existsEmail = await db.user.findUnique({
          where: { email: email || '' },
          select: { name: true, lastname: true },
        });

    if(!existsEmail){
      return NextResponse.json({ error: 'Email not found!' }, { status: 204 });
    }

    // Create the transporter using Gmail (you can change this for other email services)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Replace with another email service if needed
      auth: {
        user: DEFAULT_EMAILS.SENDER, // Your email username
        pass: process.env.EMAIL_APP_PASS, // Your email password or app-specific password
      },
    });

    const defaultUserPassword = DEFAULT_USERS.PASSWORD;  // Assuming DEFAULT_USERS.PASSWORD exists

    // Setup email content
    const mailOptions = {
      from: `${process.env.EMAIL_USER}`, // Sender email
      to: email, // Recipient email
      subject: 'รีเซ็ตรหัสผ่านระบบจองห้องประชุมออนไลน์',
      text: `เข้าสู่ระบบอีกครั้ง ที่ลิงค์นี้ :\n${process.env.NEXTAUTH_URL}\n\nรหัสผ่านใหม่ คือ ${defaultUserPassword}\n\nเมื่อเข้าสู่ระบบด้วยรหัสผ่านนี้แล้ว\nเพื่อความปลอดภัย กรุณาเปลี่ยนรหัสผ่านอีกครั้ง`,
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
