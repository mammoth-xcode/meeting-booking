'use client'

import { AccountVerification, UserRole } from '@prisma/client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AccessDeniedPage from '../../components/AccessDenied'
import RoomBookingPage from '../../components/RoomBooking'
import Menu from '../../components/Menu'
import Footer from '../../components/Footer'
import { SyncLoader } from "react-spinners";

export default function BookingPage() {
  const { data: session, status } = useSession()

  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // if account not verified goto login with message.
  if (session?.user?.verification === AccountVerification.UNVERIFIED || !session) {
    signOut({ callbackUrl:
      '/?' + 
      'username=' + session?.user?.username.toLowerCase() +
      '&' +
      'account_verified=' + AccountVerification.UNVERIFIED.toLowerCase()
    })
  }

  // if(session?.user?.role === UserRole.USER){
  //   router.push('/access_denied')
  // }

  // When after loading success and have session, show profile
  // bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800 
  return (
    <>
      <div className="flex w-screen h-[100dvh] items-center justify-center bg-[white] border-slate-300 border-none " >
        {status === 'authenticated' &&
        (
          (session?.user?.verification === AccountVerification.VERIFIED) ?
            <RoomBookingPage editable={session.user.role === UserRole.ADMIN} />
          :
            <div className="flex flex-row bg-inherit p-6">
              <span className="mr-3 text-slate-800 text-base font-bold">ตรวจสอบข้อมูล</span><SyncLoader color="gold" size="11px" />
            </div>
        )}
      </div>
    </>
  )
}