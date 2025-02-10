'use client'

import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AccountVerification } from '@prisma/client'
import { useSearchParams } from "next/navigation";
import Link from 'next/link'
import Menu from './components/Menu'
import Footer from './components/Footer'
import { FaBook, FaCircleExclamation, FaAddressBook, FaUserPlus, FaUserLock, FaFloppyDisk, FaArrowRotateLeft, FaCheck } from "react-icons/fa6";

import { toast, Toaster } from "sonner";

export default function SignIn() {
  const { data: session, status } = useSession()  // get session

  const NOT_VERIFIED = 'บัญชีผู้ใช้ยังไม่ได้รับการยืนยัน !'
  const INVALID_CREDENTIALS = 'ชื่อผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง !'

  // get Account verification message.
  const searchParams = useSearchParams();

  // callback username.
  const callbackUsername = searchParams.get("username")

  const router = useRouter()

  // force redirect to /profile
  useEffect(() => {
    if (status !== 'unauthenticated') {
      router.push('/authenticated')
    }
  }, [status, router])
  
  // const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errMessage, setErrMessage] = useState('')
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // begin login.
      // check credentials.
      const result = await signIn('credentials', {
        redirect: false,
        // email,
        username,
        password,
      })

      // if not exist credentials.
      if (result.error) {
        // console.error(result.error)
        let errMsg = INVALID_CREDENTIALS
        setErrMessage(errMsg)
        toast.error(errMsg);
      } else {
        router.push('/authenticated')
        // redirect('/profile')
      }
    } catch (error) {
      // console.log('error', error)
      setErrMessage(error)
      toast.error(error);
    }
  }

  // defind account verified message.
  var notifiedMessage = ''
  if (errMessage != '') {
    notifiedMessage = ''
  } else {
    notifiedMessage = searchParams.get("account_verified") === AccountVerification.UNVERIFIED.toLowerCase()
    ? NOT_VERIFIED
    : "";
  }
  
  return (
    !session &&
     (   // if not exists session then render login form , id='backgroundImage'
      <>
        <Toaster
          toastOptions={{
            classNames: {
              toast: 'bg-red-500 backdrop-blur-md border-2 border-red-700',
              title: 'text-white font-bold',
              description: 'text-red-400',
              actionButton: 'bg-white',
              cancelButton: 'bg-white',
              closeButton: 'bg-white',
              icon: 'text-white'
            },
          }}
        />
        <Menu />
        <div className="flex w-screen h-[100dvh] items-center justify-center bg-slate-50 border-slate-300 border-none " >
          <form
            onSubmit={handleSubmit}
            className="max-w-[350px] w-full bg-[white] backdrop-blur-md p-6 rounded-md shadow-2xl border-slate-300 border-[1px] "
          >
            {/* <div className="mb-4">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 px-3 py-2 rounded" // Added border
              />
            </div> */}
            <div className="mb-4">
              <div className="container mx-auto px-0 py-0 mb-2 mt-1 flex items-center justify-center">
                <FaUserLock  className="text-2xl font-semibold mb-3 px-0.5 " />
                <span className="text-lg font-semibold mb-2 px-0.5 ">กรุณาลงชื่อเข้าสู่ระบบ</span>
              </div>
              <label className='font-medium text-slate-500' htmlFor="username">ชื่อผู้ใช้งาน</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  const inputValue = e.target.value.replace(/[^a-z0-9\s]/g, '').toLowerCase(); // Clean input and force to lower case.
                  // Check if the first character is not numeric
                  if (!/^\d/.test(inputValue) || inputValue.length === 0) {
                    setUsername(inputValue); // Update state if valid
                  }
                }} 
                placeholder={callbackUsername || 'johnwick' }
                maxLength="20"
                required
                className="w-full border border-gray-300 px-3 py-2 rounded mt-1 focus:outline-none focus:border-blue-500" // Added border
              />
            </div>
            <div className="mb-4">
              <label className='font-medium text-slate-500'  htmlFor="password">รหัสผ่าน</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='********'
                maxLength="20"
                required
                className="w-full border border-gray-300 px-3 py-2 rounded mt-1 focus:outline-none focus:border-blue-500" // Added border
              />
            </div>
            <div className="my-0 text-slate-800 text-sm">
            <Link href='/reset' className='font-normal text-slate-600 hover:text-red-500'>ลืมรหัสผ่าน ?</Link>
            </div>
            <div className="my-2 text-red-500 text-sm font-bold">
              {notifiedMessage}
            </div>
            <div className="my-2 text-red-500 text-sm font-bold">
              {errMessage}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-800 tex-base text-white py-2 rounded my-1 opacity-95 hover:opacity-100"
            >
              เข้าสู่ระบบ
            </button> 
            <div className="mt-4 mb-0 text-slate-800 text-base">
              ยังไม่มีบัญชี ? <Link href='/register' className='font-bold text-slate-600 hover:text-blue-600'>สร้างบัญชีใหม่.</Link>
            </div>
            {' '}
          </form>
        </div>

        {/* <div className="w-dvw">
          <Footer />
        </div> */}

      </>
    )
  )
}