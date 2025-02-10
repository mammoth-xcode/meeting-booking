import bcrypt from 'bcrypt';

// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, username, password, name, lastname } = await request.json();

    // Basic input validation
    if (!email || !username || !password || !name || !lastname) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Use async hash function

    const user = await db.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name,
        lastname,
      },
    });

    return new Response(JSON.stringify({ message: 'User created', user }), { status: 201 });
  } catch (error) {
    console.error(error); // Use console.error for errors
    return new Response(JSON.stringify({ error: 'User could not be created' }), { status: 500 });
  }
}
