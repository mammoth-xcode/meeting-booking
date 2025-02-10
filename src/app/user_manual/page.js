'use client'

import { AccountVerification } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Menu from '../components/Menu'
import Footer from '../components/Footer'
import { SyncLoader } from "react-spinners";
import { DocumentViewer } from 'react-documents'

export default function UserManual() {
  // const { data: session, status } = useSession()

  // const router = useRouter()

  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/')
  //   }
  // }, [status, router])

  return (
    <>
      <div className="flex w-screen h-full items-start mt-40 justify-center bg-slate-50 border-slate-300 border-none " >
        <Menu />
        <div className="max-w-full w-11/12 h-dvh bg-slate-50 p-6 mb-20 ">
          <div className='mb-3 h-auto'><b>User Manual :: คู่มือการใช้งาน</b></div>

          <DocumentViewer 
            queryParams="hl=Th"
            url="https://wongwaimammoth.serv00.net/user_manual.pdf"
          >

          </DocumentViewer>

        </div>

      </div>
      {/* {status === 'authenticated' &&
        (<Footer />)
      } */}
    </>
  )
}