'use client'

import React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

import { 
    BsPersonFill,
    BsFillXSquareFill,
    BsShieldFillCheck
} from "react-icons/bs";

import {
    MenubarSeparator,
} from "@/components/ui/menubar"
import { UserRole } from '@prisma/client';
  
function ProfileMenu() {
    const { data: session, status } = useSession()
  return (
    <div className='flex items-center justify-center bg-transparent rounded-full border-none '>
        {
            session && 
            <DropdownMenu>
                <DropdownMenuTrigger asChild className='items-center justify-center bg-transparent mr-3 rounded-full border-none'>
                <Avatar>
                    <AvatarImage 
                    className={session?.user?.role === UserRole.ADMIN ? 
                            'hover:cursor-pointer w-9 h-9 rounded-full p-0.5 scale-x-[-1] border-1 border-yellow-400 bg-yellow-400' 
                        : 
                            'hover:cursor-pointer w-9 h-9 rounded-full p-0.5 scale-x-[-1]'} 
                    src={session?.user?.image || "https://github.com/shadcn.png"} alt={session?.user?.name || ''} />
                    <AvatarFallback className='bg-blue-800 hover:bg-blue-700 text-white hover:text-[whitesmoke] font-semibold'>US</AvatarFallback>
                </Avatar>
                </DropdownMenuTrigger>
                {/* {session?.user?.role === UserRole.ADMIN &&
                    <BsShieldFillCheck className='z-50 mt-[18px] ml-[-30px] w-[18px] h-[18px] text-yellow-400 mr-2' />
                } */}
                <DropdownMenuContent className="w-auto" align="end">
                    <DropdownMenuItem asChild>
                        <Link href='/profile'>
                            <div className='flex justify-start items-center text-base'>
                                <BsPersonFill className='mt-[-1px]' />&nbsp;{`${session?.user?.name} ${session?.user?.lastname}` || 'บัญชีผู้ใช้'}
                            </div>
                        </Link>
                    </DropdownMenuItem>
                    <MenubarSeparator />
                    <DropdownMenuItem asChild>
                        <Link href='/logout' className='font-medium'>
                            <div className='flex justify-start items-center font-medium text-base'><BsFillXSquareFill />&nbsp;ออกจากระบบ</div>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        }
    </div>
  )
}

export default ProfileMenu
