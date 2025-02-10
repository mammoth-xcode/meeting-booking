import { getServerSession } from 'next-auth'

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UserRole } from '@prisma/client';
import nodemailer from 'nodemailer';
import { DEFAULT_EMAILS } from "@/app/constants";

import bcrypt from 'bcrypt';

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

      // // Send email to admin to verify user status.
      // Create the transporter using Gmail (you can change this for other email services)
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Replace with another email service if needed
        auth: {
          user: DEFAULT_EMAILS.SENDER, // Your email username
          pass: process.env.EMAIL_APP_PASS, // Your email password or app-specific password
        },
      });
  
      const regHeader = 'ลงทะเบียนผู้ใช้งาน';
  
      // Setup email content
      const userMailOptions = {
        from: DEFAULT_EMAILS.SENDER, // Sender email
        to: email, // Recipient email : user
        subject: regHeader,
        text: `${regHeader} เรียบร้อยแล้ว.\n\nชื่อผู้ใช้งาน : ${name} ${lastname}\nเบอร์โทร : ${telephone}\nอีเมล์ : ${email}\n\nรหัสผู้ใช้งาน : ${username}\nรหัสผ่าน : ${password}\n\nเข้าสู่ระบบ : ${process.env.NEXTAUTH_URL}`,
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
        text: `${regHeader} เรียบร้อยแล้ว.\n\nรหัสผู้ใช้งาน : ${username}\nชื่อผู้ใช้งาน : ${name} ${lastname}\nเบอร์โทร : ${telephone}\nอีเมล์ : ${email}\n\nตรวจสอบข้อมูล : ${process.env.NEXTAUTH_URL}/users`,
      };
      await transporter.sendMail(mailOptions);
  
      // // Send the email to admin
      // const adminEmailResponse = await transporter.sendMail(mailOptions);
      // if (adminEmailResponse) {
      //   console.log('Email not sent to Admin !');
      //   return NextResponse.json({ error: 'Email not sent to Admin !' }, { status: 550 });
      // }
  
      // Send LINE Notify message about the new user registration to admin
      const message = `${regHeader} เรียบร้อยแล้ว.\n\nรหัสผู้ใช้งาน: ${username}\nชื่อผู้ใช้งาน: ${name} ${lastname}\nอีเมล์: ${email}\nเบอร์โทร: ${telephone}\n\nตรวจสอบข้อมูล : ${process.env.NEXTAUTH_URL}/users`;
      await sendLineNotify(message);

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

    const { employee_id, email, username, name, lastname } = await req.json();

    const deletedUser = await db.user.delete({
      where: { employee_id },
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

    const regHeader = 'ยกเลิกผู้ใช้งาน';

    // Setup email content
    const userMailOptions = {
      from: DEFAULT_EMAILS.SENDER, // Sender email
      to: email, // Recipient email : user
      subject: regHeader,
      text: `ขอแจ้งให้ทราบว่า เราได้${regHeader} ระบบจองห้องประชุมออนไลน์ ของผู้ใช้งาน : ${name} ${lastname} ( ${username} ) เรียบร้อยแล้ว.`,
    };

    const mailOptions = {
      from: DEFAULT_EMAILS.SENDER, // Sender email
      to: DEFAULT_EMAILS.ADMIN, // Recipient email : admin
      subject: regHeader,
      text: `${regHeader} ระบบจองห้องประชุมออนไลน์ ของผู้ใช้งาน : ${name} ${lastname} ( ${username} ) เรียบร้อยแล้ว.`,
    };

    // Send the email to user
    await transporter.sendMail(userMailOptions);

    // Send the email to admin
    await transporter.sendMail(mailOptions);

    // Send LINE Notify message about the new user registration to admin
    const message = `${regHeader} : ${name} ${lastname} ( ${username} ) เรียบร้อยแล้ว.`;
    await sendLineNotify(message);

    return NextResponse.json({ message: 'User deleted successfully', user: deletedUser }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}