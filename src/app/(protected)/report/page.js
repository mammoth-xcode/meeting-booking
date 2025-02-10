'use client'

import { AccountVerification, UserRole } from '@prisma/client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AccessDeniedPage from '../../components/AccessDenied'
import Menu from '../../components/Menu'
import Footer from '../../components/Footer'
import { SyncLoader } from "react-spinners";
import { Button } from "@/components/ui/button";

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export default function ReportPage() {
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

  // // only MGR
  // if(session?.user?.role === UserRole.USER || UserRole.ADMIN){
  //   router.push('/access_denied')
  // }

  // When after loading success and have session, show profile
  // bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800 


  // Function to generate PDF
  async function createPdf() {
    const pdfDoc = await PDFDocument.create()
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const defFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    const fontSize = 18
    page.drawText('Creating PDFs in JavaScript is awesome!', {
      x: 50,
      y: height - 4 * fontSize,
      size: fontSize,
      font: defFont,
      color: rgb(0, 0.53, 0.71),
    })
  
    const pdfBytes = await pdfDoc.save()
    
    // Create a Blob and download the PDF
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated-report.pdf'
    a.click()
    URL.revokeObjectURL(url) // Cleanup
  }



  return (
    <>
      {session?.user?.role === UserRole.MANAGER || session?.user?.role === UserRole.ADMIN ? 
        <div className="flex flex-col w-screen h-full items-center justify-center bg-white border-white border-none " >
        {status === 'authenticated' &&
        (
          (session?.user?.verification === AccountVerification.VERIFIED) ?
            <>
              <Menu />
              <div className="max-w-[1122px] w-[1122px] max-h-[793px] h-[600px] bg-[white] backdrop-blur-md p-6 rounded-md border-slate-200 border-[1px] mt-36 ">
                <p className='mb-0 flex flex-row justify-center align-middle'>
                  <b>รายงานการใช้ห้องประชุม</b>
                </p>
                <p className='mb-3 flex flex-row justify-center align-middle'>
                  <b>ระหว่าง วันที่ 1 กุมภาพันธ์ 2568 ถึง 28 กุมภาพันธ์ 2568</b>
                </p>
              </div>
              <Button
                variant={"slate_green"}
                onClick={() => window.open('/report_a4', '_blank')}
                // onClick={createPdf}
                className='mt-1'
              >
                พิมพ์
              </Button>
            </>
          :
            <div className="flex flex-row bg-inherit p-6">
              <span className="mr-3 text-slate-800 text-base font-bold">ตรวจสอบข้อมูล</span><SyncLoader color="gold" size="11px" />
            </div>
        )}
        </div>
      : 
        <>
          <Menu />
          {session?.user?.role !== UserRole.MANAGER &&
            <AccessDeniedPage />
          }
        </>
      }
      {/* {status === 'authenticated' &&
        (<Footer />)
      } */}
    </>
  )
}