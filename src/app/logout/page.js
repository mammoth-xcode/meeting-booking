'use client'
import React, { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { SyncLoader } from "react-spinners";

function LogoutPage() {

  useEffect(() => {
    signOut({ callbackUrl: '/?callbackUrl=profile'});
  }, []);

  return (
    <>
      <div className="flex w-screen h-[100dvh] items-center justify-center bg-slate-50 border-slate-300 border-none " >
        <span className="mr-3 text-slate-800 text-base font-bold bg-slate-50">ออกจากระบบ</span><SyncLoader color="red" size="11px" />
      </div>
    </>
  );
}

export default LogoutPage;
