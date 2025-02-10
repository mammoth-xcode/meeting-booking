'use client'

import { AccountVerification } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Menu from '../components/Menu'
import Footer from '../components/Footer'
import { SyncLoader } from "react-spinners";
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const { data: session, status } = useSession()

  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  //console.log(session.user.position_name)

  return (
    <>
      <div className="flex w-screen h-[100dvh] items-center justify-center bg-slate-50 border-slate-300 border-none " >
      {status === 'authenticated' &&
      (
        (session?.user?.verification === AccountVerification.VERIFIED) ?
          <>
            <Menu />
            <div className="max-w-[400px] w-full h-[250px] bg-[white] backdrop-blur-md p-6 rounded-md shadow-md border-slate-300 border-[1px] ">
              <div className='mb-3'><b>Dashboard :: หน้าแรก</b></div>
              <p className='mb-3'>
                ยินดีต้อนรับ, <b>{session?.user?.name} {session?.user?.lastname}</b>
                {/* &nbsp;<span className='mb-3 font-bold text-blue-700'>({session?.user?.role})</span> */}
              </p>
              <p className='mb-3'>
                {/* สิทธิ์การใช้งาน: <b>{session?.user?.role}</b> */}
              </p>
              <p className='mb-3 font-bold text-blue-700'>
                *** ระบบจะเริ่มใช้งาน วันที่ 1 มีนาคม 2568
              </p>
              <p className='mb-3 font-bold text-blue-700'>
                *** สำหรับข้อมูลเพิ่มเติม กรุณาติดต่อ ฝ่าย IT
              </p>
              <div className='flex justify-center pt-2'>
                <Button
                  onClick={() => router.push('/rooms')}
                  className=" bg-green-600 hover:bg-green-500 text-white font-normal text-base py-2 px-4 rounded"    
                >
                  เลือกห้องประชุม
                </Button>
              </div>
            </div>
          </>
        :
          <div className="flex flex-row bg-inherit p-6">
            <span className="mr-3 text-slate-800 text-base font-bold">ตรวจสอบข้อมูล</span><SyncLoader color="gold" size="11px" />
          </div>
      )}
      </div>
      {/* {status === 'authenticated' &&
        (<Footer />)
      } */}
    </>
  )
}