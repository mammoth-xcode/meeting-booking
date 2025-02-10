'use client'

import { AccountVerification } from '@prisma/client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { SyncLoader } from "react-spinners";

export default function AuthenticatedPage() {
  const { data: session } = useSession()

  const router = useRouter()

  // if account not verified goto login with message.
  if (session?.user?.verification === AccountVerification.UNVERIFIED || !session) {
    signOut({ callbackUrl:
      '/?' +
      'username=' + session?.user?.username.toLowerCase() +
      '&' +
      'account_verified=' + AccountVerification.UNVERIFIED.toLowerCase()
    })
  } else {
    router.push('/dashboard')
  }

  return (
    <>
      <div className="flex w-screen h-[100dvh] items-center justify-center bg-[white] border-slate-300 border-none ">
        <div className="flex flex-row items-center justify-center container mx-auto ">
          <span className="mr-3 text-slate-800 text-base font-bold">ตรวจสอบข้อมูล</span><SyncLoader color="gold" size="11px" />
        </div>
      </div>
    </>
  )
}