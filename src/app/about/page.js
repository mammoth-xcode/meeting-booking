'use client'

import { AccountVerification } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Menu from '../components/Menu'
import Footer from '../components/Footer'
import { SyncLoader } from "react-spinners";

export default function AboutPage() {
  // const { data: session, status } = useSession()

  // const router = useRouter()

  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/')
  //   }
  // }, [status, router])

  return (
    <>
      <div className="flex w-screen h-[100dvh] items-center justify-center bg-slate-50 border-slate-300 border-none " >
        {/* {status === 'authenticated' &&
        (
          (session?.user?.verification === AccountVerification.VERIFIED) ?
            <>
              <Menu />
              <div className="max-w-[350px] w-full h-[210px] bg-[#ffffff95] backdrop-blur-md p-6 rounded-md shadow-md border-slate-300 border-[1px] ">
                <div className='mb-3'><b>About :: เกี่ยวกับเรา</b></div>
                <p className='mb-3'>
                  ยินดีต้อนรับ, <b>{session?.user?.name} {session?.user?.lastname}</b>
                </p>
              </div>
            </>
          :
            <div className="flex flex-row bg-inherit p-6">
              <span className="mr-3 text-slate-800 text-base font-bold">ตรวจสอบข้อมูล</span><SyncLoader color="gold" size="11px" />
            </div>
        )} */}

        <Menu />
        <div className="max-w-[350px] w-full h-[260px] bg-[white] backdrop-blur-md p-6 rounded-md shadow-md border-slate-300 border-[1px] ">
          <div className='mb-3 text-blue-800'><b>About :: เกี่ยวกับเรา</b></div>
          <hr className='mb-1' />
          <p className='mb-3 mt-3'>
            <b><span className=' text-blue-800'>วิชา :: </span>DT402&nbsp;&nbsp;โครงงานนักศึกษา 2</b>
          </p>
          <hr />
          <p className='mb-3 mt-3'>
            <b><span className=' text-blue-800'>อาจารย์ประจำวิชา :: </span>นายอดุล&nbsp;&nbsp;ทองแกม</b>
          </p>
          <hr />
          <p className='mb-0 mt-3'>
            <p className='mb-1 mt-0 text-blue-800'><b>นักศึกษา  ประกอบด้วย :</b></p>
            <b>6620204013&nbsp;&nbsp;นายอภิรักษ์&nbsp;&nbsp;ว่องไว</b>
          </p>
          <p className='mb-3'>
            <b>6620204022&nbsp;&nbsp;นางสาววิภวานี&nbsp;&nbsp;หมู่ศิริ</b>
          </p>
        </div>

      </div>
      {/* {status === 'authenticated' &&
        (<Footer />)
      } */}
    </>
  )
}