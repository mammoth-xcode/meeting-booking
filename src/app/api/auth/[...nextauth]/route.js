import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()

import { db } from "@/lib/db";

import bcrypt from 'bcrypt'
import { PrismaAdapter } from '@next-auth/prisma-adapter'



const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        // email: { label: 'Email', type: 'email', placeholder: 'john@doe.com' },
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null
        const user = await db.user.findUnique({
          // where: { email: credentials.email },
          where: { username: credentials.username },
        })

        // not exist user.
        if (user?.username === undefined) {
          console.log('username:', user?.username , ' not exist !')
          throw new Error('Invalid username !')
        }

        // exist user.
        if (
          // password matching.
          user &&
          (await bcrypt.compare(credentials.password, user.password))
        ) {
          // matched.
          return {
            id: user.id,
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            username: user.username,
            role: user.role,
            verification: user.verification,
            position_id: user.position_id,
            department_id: user.department_id,
            employee_id: user.employee_id,
          }
        } else {
          // not matched !
          // console.log('account info:', user)
          throw new Error('Invalid username or password !')
        }
      },
    })
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: async ({ token, user }) => {             // server side.
      if (user) {
        token.id = user.id                        // id
        token.lastname = user.lastname            // lastname
        token.username = user.username            // username
        token.email = user.email                  // email
        token.role = user.role                    // role : สิทธิการใช้งานระบบ
        token.verification = user.verification    // account verification : VERIFIED | UNVERIFIED : ยืนยันการใช้งานระบบ
        token.position_id = user.position_id
        token.department_id = user.department_id
        token.employee_id = user.employee_id
      }
      return token
    },
    session: async ({ session, token }) => {      // client side.
      if (session.user) {
        session.user.id = token.id
        session.user.lastname = token.lastname
        session.user.username = token.username
        session.user.email = token.email
        session.user.role = token.role
        session.user.verification = token.verification
        session.user.position_id = token.position_id
        session.user.department_id = token.department_id
        session.user.employee_id = token.employee_id
      }
      return session
    }
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }