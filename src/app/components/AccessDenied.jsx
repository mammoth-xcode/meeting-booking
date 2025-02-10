'use client'
import React from 'react';
import { useRouter } from 'next/navigation'
import { BsExclamationTriangleFill } from "react-icons/bs";

function AccessDeniedPage() {
  const router = useRouter()

  return (
    <>
      <div className="flex flex-col w-screen h-[100dvh] items-center justify-center bg-[white] border-slate-300 border-none " >
        <div className="max-w-[350px] w-full h-[140px] bg-[#ffffff95] backdrop-blur-md p-6 rounded-md shadow-md border-slate-300 border-[1px] ">
          <div className='flex flex-row items-center justify-start text-lg text-red-600 mb-[-33px]'>
            <BsExclamationTriangleFill />
          </div>
          <div className='flex flex-row items-center justify-center text-lg text-slate-900 my-3'>
            <b>
              คุณไม่ได้รับสิทธิ์การใช้งานในส่วนนี้ !
              </b>
            </div>
          <p className='text-red-500 font-bold'>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-red-500 text-white py-2 rounded mt-1 mb-0 opacity-95 hover:opacity-100"
            >
              ตกลง
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

export default AccessDeniedPage;
