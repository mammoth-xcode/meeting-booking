import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
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

// POST method to create a new user
export async function POST(req: NextRequest) {
  try {
    // Get the input data from the request body
    const { username, password, name, lastname, email, telephone, position_id, department_id, role, verification, employee_id } = await req.json();

    // Validate that required fields are provided
    if (!username || !password || !name || !lastname || !email || !position_id || !department_id || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if email or username already exists in the database
    const existsUser = await db.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
      select: { email: true, username: true },
    });

    if (existsUser) {
      if (existsUser.email) {
        return NextResponse.json({ error: 'Email is already in use' }, { status: 409 });
      }
      if (existsUser.username) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
      }
    }
    
    // Hash the password before saving it in the database
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds are set to 10

    // Create the new user in the database
    const newUser = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        lastname,
        email,
        telephone: telephone || '',
        position_id,
        department_id,
        role, // Ensure that role is being correctly set, like "USER", "ADMIN"
        verification,
        employee_id,
      },
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

    const regHeader = 'ขอลงทะเบียนใช้งานระบบจองห้องประชุมออนไลน์';

    // Setup email content
    const userMailOptions = {
      from: DEFAULT_EMAILS.SENDER, // Sender email
      to: email, // Recipient email : user
      subject: regHeader,
      text: `ระบบได้ดำเนินการลงทะเบียนเรียบร้อยแล้ว\nเมื่อผู้ดูแลระบบตรวจสอบ/ยืนยันการใช้งานแล้ว\nจะแจ้งให้ทราบทางอีเมล์นี้อีกครั้ง.\n\nชื่อผู้ใช้งาน : ${name} ${lastname}\nเบอร์โทร : ${telephone}\nอีเมล์ : ${email}\n\nรหัสผู้ใช้งาน : ${username}\nรหัสผ่าน : ${password}`,
    };
    await transporter.sendMail(userMailOptions);

    // // Send the email to user
    // const userEmailResponse = await transporter.sendMail(userMailOptions);
    // if (userEmailResponse) {
    //   console.log('Email not sent to user !');
    //   return NextResponse.json({ error: 'Email not sent to user !' }, { status: 550 });
    // }

    const mailOptions = {
      from: DEFAULT_EMAILS.SENDER, // Sender email
      to: DEFAULT_EMAILS.ADMIN, // Recipient email : admin
      subject: regHeader,
      text: `${regHeader}\n\n รหัสผู้ใช้งาน : ${username}\nชื่อผู้ใช้งาน : ${name} ${lastname}\nเบอร์โทร : ${telephone}\nอีเมล์ : ${email}\n\nตรวจสอบข้อมูล : ${process.env.NEXTAUTH_URL}/users`,
    };
    await transporter.sendMail(mailOptions);

    // // Send the email to admin
    // const adminEmailResponse = await transporter.sendMail(mailOptions);
    // if (adminEmailResponse) {
    //   console.log('Email not sent to Admin !');
    //   return NextResponse.json({ error: 'Email not sent to Admin !' }, { status: 550 });
    // }

    // Send LINE Notify message about the new user registration to admin
    const message = `${regHeader}\n\nรหัสผู้ใช้งาน: ${username}\nชื่อผู้ใช้งาน: ${name} ${lastname}\nอีเมล์: ${email}\nTelephone: ${telephone}\n\nตรวจสอบข้อมูล : ${process.env.NEXTAUTH_URL}/users`;
    await sendLineNotify(message);

    // Return the newly created user in the response
    return NextResponse.json(newUser, { status: 201 });

  } catch (error) {
    console.error("Register API : Failed to create user:", error);
    return NextResponse.json({ error: 'Register API : Failed to create user' }, { status: 500 });
  }
}
