'use client'

import React, { useEffect, useState } from "react";
import { useSession } from 'next-auth/react'
import { HiMiniCog6Tooth, HiDocumentText } from "react-icons/hi2";
import { FaBook, FaCircleExclamation, FaAddressBook, FaHouseUser, FaIdCardClip, FaCube, FaCircleCheck, FaBuildingCircleCheck, FaUser } from "react-icons/fa6";
import { IoApps } from "react-icons/io5";
import { 
  BsBookmarkCheckFill,  
  BsFillQuestionCircleFill, 
  BsBookmarkPlusFill, 
  BsBuildingFillCheck,
  BsFillHouseFill,
  BsFillXSquareFill,
  BsMicrosoft,
  BsShieldShaded,
  BsUiChecksGrid,
  BsPersonFill,
  BsShieldFillCheck,
  BsBuildingsFill,
  BsBuildingFill
 } from "react-icons/bs";

import {
  Menubar,
  // MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  // MenubarRadioGroup,
  // MenubarRadioItem,
  MenubarSeparator,
  // MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "../../components/ui/menubar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "../../components/ui/dropdown-menu";

import ProfileMenu from '../components/ProfileMenu'
import Link from 'next/link'
import { UserRole } from '@prisma/client';
import Header from './Header'

function Menu() {
    const { data: session, status } = useSession()

    const [loading, setLoading] = useState(true);
    const [roomsCount, setRoomsCount] = useState([]);
    const [roomsBookingCount, setRoomsBookingCount] = useState([]);
    const [roomTypesCount, setRoomTypesCount] = useState([]);
    const [usersCount, setUsersCount] = useState([]);
    const [rolesCount, setRolesCount] = useState([]);
    const [departmentsCount, setDepartmentsCount] = useState([]);
    const [positionsCount, setPositionsCount] = useState([]);
    const [equipmentsCount, setEquipmentsCount] = useState([]);

    // for all users.
    if(session){
        // Load Rooms data ------------------------------------------------------------------------------------------------------------------------------------
        useEffect(() => {
            const loadRoomsData = async () => {
            setLoading(true);
            try {
                // Fetch rooms data from API
                const responseRooms = await fetch('/api/rooms'); // Replace with your API endpoint
                const dataRooms = await responseRooms.json();
        
                setRoomsCount(dataRooms);
            } catch (error) {
                console.error("Error fetching rooms data:", error);
            } finally {
                setLoading(false);
            }
            };
        
            // Set an interval to fetch data every second
            const intervalId = setInterval(() => {
            loadRoomsData();
            }, 1000 * 30); // 1000 ms = 1 second
        
            // Initial data load when the component mounts
            loadRoomsData();
        
            // Cleanup the interval when the component unmounts
            return () => {
            clearInterval(intervalId);
            };
        }, []); // Empty dependency array ensures this effect runs only once on mount
        // End Load Rooms data ------------------------------------------------------------------------------------------------------------------------------------
        // Load Rooms Booking data ------------------------------------------------------------------------------------------------------------------------------------
        useEffect(() => {
            const loadRoomsBookingData = async () => {
            setLoading(true);
            try {
                // Fetch rooms Booking data from API
                const responseRoomsBooking = await fetch('/api/bookings'); // Replace with your API endpoint
                const dataRoomsBooking = await responseRoomsBooking.json();
        
                setRoomsBookingCount(dataRoomsBooking);
            } catch (error) {
                console.error("Error fetching rooms Booking data:", error);
            } finally {
                setLoading(false);
            }
            };
        
            // Set an interval to fetch data every second
            const intervalId = setInterval(() => {
            loadRoomsBookingData();
            }, 1000 * 30); // 1000 ms = 1 second
        
            // Initial data load when the component mounts
            loadRoomsBookingData();
        
            // Cleanup the interval when the component unmounts
            return () => {
            clearInterval(intervalId);
            };
        }, []); // Empty dependency array ensures this effect runs only once on mount
        // End Load Rooms Booking data ------------------------------------------------------------------------------------------------------------------------------------
    }

    // for ADMIN only.
    if(session && session?.user?.role === UserRole.ADMIN){
        // Load Departments data ------------------------------------------------------------------------------------------------------------------------------------
        useEffect(() => {
            const loadDepartmentsData = async () => {
            setLoading(true);
            try {
                // Fetch Departments data from API
                const responseDepartments = await fetch('/api/departments'); // Replace with your API endpoint
                const dataDepartments = await responseDepartments.json();
        
                setDepartmentsCount(dataDepartments);
            } catch (error) {
                console.error("Error fetching Departments data:", error);
            } finally {
                setLoading(false);
            }
            };
        
            // Set an interval to fetch data every second
            const intervalId = setInterval(() => {
                loadDepartmentsData();
            }, 1000 * 30); // 1000 ms = 1 second
        
            // Initial data load when the component mounts
            loadDepartmentsData();
        
            // Cleanup the interval when the component unmounts
            return () => {
            clearInterval(intervalId);
            };
        }, []); // Empty dependency array ensures this effect runs only once on mount
        // End Load Departments data ------------------------------------------------------------------------------------------------------------------------------------
                
        // Load Positions data ------------------------------------------------------------------------------------------------------------------------------------
        useEffect(() => {
            const loadPositionsData = async () => {
            setLoading(true);
            try {
                // Fetch Positions data from API
                const responsePositions = await fetch('/api/positions'); // Replace with your API endpoint
                const dataPositions = await responsePositions.json();
        
                setPositionsCount(dataPositions);
            } catch (error) {
                console.error("Error fetching Positions data:", error);
            } finally {
                setLoading(false);
            }
            };
        
            // Set an interval to fetch data every second
            const intervalId = setInterval(() => {
                loadPositionsData();
            }, 1000 * 30); // 1000 ms = 1 second
        
            // Initial data load when the component mounts
            loadPositionsData();
        
            // Cleanup the interval when the component unmounts
            return () => {
            clearInterval(intervalId);
            };
        }, []); // Empty dependency array ensures this effect runs only once on mount
        // End Load Positions data ------------------------------------------------------------------------------------------------------------------------------------
        
        // Load Users data ------------------------------------------------------------------------------------------------------------------------------------
        useEffect(() => {
            const loadUsersData = async () => {
            setLoading(true);
            try {
                // Fetch users data from API
                const responseUsers = await fetch('/api/users'); // Replace with your API endpoint
                const dataUsers = await responseUsers.json();

                setUsersCount(dataUsers);
            } catch (error) {
                console.error("Error fetching users data:", error);
            } finally {
                setLoading(false);
            }
            };

            // Set an interval to fetch data every second
            const intervalId = setInterval(() => {
                loadUsersData();
            }, 1000 * 30); // 1000 ms = 1 second

            // Initial data load when the component mounts
            loadUsersData();

            // Cleanup the interval when the component unmounts
            return () => {
            clearInterval(intervalId);
            };
        }, []); // Empty dependency array ensures this effect runs only once on mount
        // End Load Users data ------------------------------------------------------------------------------------------------------------------------------------

        // Load Equipments data ------------------------------------------------------------------------------------------------------------------------------------
        useEffect(() => {
            const loadEquipmentsData = async () => {
            setLoading(true);
            try {
                // Fetch Equipments data from API
                const responseEquipments = await fetch('/api/equipments'); // Replace with your API endpoint
                const dataEquipments = await responseEquipments.json();
        
                setEquipmentsCount(dataEquipments);
            } catch (error) {
                console.error("Error fetching Equipments data:", error);
            } finally {
                setLoading(false);
            }
            };
        
            // Set an interval to fetch data every second
            const intervalId = setInterval(() => {
                loadEquipmentsData();
            }, 1000 * 30); // 1000 ms = 1 second
        
            // Initial data load when the component mounts
            loadEquipmentsData();
        
            // Cleanup the interval when the component unmounts
            return () => {
            clearInterval(intervalId);
            };
        }, []); // Empty dependency array ensures this effect runs only once on mount
        // End Load Equipments data ------------------------------------------------------------------------------------------------------------------------------------

        // Load RoomTypes data ------------------------------------------------------------------------------------------------------------------------------------
        useEffect(() => {
            const loadRoomTypesData = async () => {
            setLoading(true);
            try {
                // Fetch RoomTypes data from API
                const responseRoomTypes = await fetch('/api/room_types'); // Replace with your API endpoint
                const dataRoomTypes = await responseRoomTypes.json();
        
                setRoomTypesCount(dataRoomTypes);
            } catch (error) {
                console.error("Error fetching Room Types data:", error);
            } finally {
                setLoading(false);
            }
            };
        
            // Set an interval to fetch data every second
            const intervalId = setInterval(() => {
            loadRoomTypesData();
            }, 1000 * 30); // 1000 ms = 1 second
        
            // Initial data load when the component mounts
            loadRoomTypesData();
        
            // Cleanup the interval when the component unmounts
            return () => {
            clearInterval(intervalId);
            };
        }, []); // Empty dependency array ensures this effect runs only once on mount
        // End Load RoomTypes data ------------------------------------------------------------------------------------------------------------------------------------

        // Load Roles data ------------------------------------------------------------------------------------------------------------------------------------
        useEffect(() => {
            const loadRolesData = async () => {
            setLoading(true);
            try {
                // Fetch Roles data from API
                const responseRoles = await fetch('/api/roles'); // Replace with your API endpoint
                const dataRoles = await responseRoles.json();
        
                setRolesCount(dataRoles);
            } catch (error) {
                console.error("Error fetching Roles data:", error);
            } finally {
                setLoading(false);
            }
            };
        
            // Set an interval to fetch data every second
            const intervalId = setInterval(() => {
            loadRolesData();
            }, 1000 * 30); // 1000 ms = 1 second
        
            // Initial data load when the component mounts
            loadRolesData();
        
            // Cleanup the interval when the component unmounts
            return () => {
            clearInterval(intervalId);
            };
        }, []); // Empty dependency array ensures this effect runs only once on mount
        // End Load Roles data ------------------------------------------------------------------------------------------------------------------------------------

    }

  return (
    <>
        <Header />
        <div className="mx-0 
                          fixed top-[90px] left-0 right-0 z-0 flex place-items-center w-100% h-[45px] items-center justify-center bg-blue-800 text-white px-0 text-base shadow-md *:" >{/* top full bar */}
        </div>
        <div className="mx-0 
                          fixed top-[90px] right-0 left-0 z-50 flex place-items-center w-100% h-[45px] items-center justify-center bg-blue-800 text-white px-0 text-base *:" >{/* top container bar */}

            <Link href='/dashboard'>
                {/* <BsMicrosoft className='px-1 w-[23px] ml-3 mr-0' /> */}
            </Link>

            <Menubar className='mx-0 w-[100dvw] text-white border-none bg-transparent shadow-none text-base px-0.5'>

                {/* for admin */}
                {session?.user?.role === UserRole.ADMIN ?
                    <MenubarMenu>
                        <MenubarTrigger className=' hover:cursor-pointer bg-transparent text-base px-2'>
                            <BsMicrosoft />&nbsp;เมนูหลัก
                        </MenubarTrigger>
                            <MenubarContent>
                                <Link href='/dashboard'>
                                    <MenubarItem className='h-9 text-base'>
                                        <BsFillHouseFill />&nbsp;หน้าแรก
                                    </MenubarItem>
                                </Link>
                                <MenubarSeparator />
                                <MenubarSub>
                                    <MenubarSubTrigger className='h-9 text-base'><BsUiChecksGrid />&nbsp;จัดการข้อมูล</MenubarSubTrigger>
                                    <MenubarSubContent>
                                        <MenubarSub className='h-9 text-base'>
                                            <MenubarSubTrigger className='h-9 text-base'><BsBuildingFill />&nbsp;ห้องประชุม</MenubarSubTrigger>
                                            <MenubarSubContent>
                                                <Link href='/room_types'>
                                                    <MenubarItem className='h-9 text-base'>
                                                        <BsBuildingsFill />&nbsp;ประเภทห้องประชุม
                                                        <div className='z-50 grid place-content-center place-items-center p-1 pt-1.5 mt-[-20px] ml-[-5px] w-[18px] h-[18px] text-sm text-white rounded-full bg-red-500' >
                                                            {roomTypesCount.length}
                                                        </div>
                                                    </MenubarItem>
                                                </Link>
                                                <Link href='/equipment'>
                                                    <MenubarItem className='h-9 text-base'>
                                                        <FaCube />&nbsp;อุปกรณ์
                                                            <div className='z-50 grid place-content-center place-items-center p-1 pt-1.5 mt-[-20px] ml-[-5px] w-[18px] h-[18px] text-sm text-white rounded-full bg-red-500' >
                                                                {equipmentsCount.length}
                                                            </div>
                                                    </MenubarItem>
                                                </Link>
                                                <Link href='/rooms_edit'>
                                                    <MenubarItem className='h-9 text-base'>
                                                        <BsBuildingFillCheck />&nbsp;รายการห้องประชุม
                                                        <div className='z-50 grid place-content-center place-items-center p-1 pt-1.5 mt-[-20px] ml-[-5px] w-[18px] h-[18px] text-sm text-white rounded-full bg-red-500' >
                                                            {roomsCount.length}
                                                        </div>
                                                    </MenubarItem>
                                                </Link>
                                            </MenubarSubContent>
                                        </MenubarSub>
                                        <MenubarSub className='h-9 text-base'>
                                            <MenubarSubTrigger className='h-9 text-base'><FaAddressBook />&nbsp;ผู้ใช้งาน</MenubarSubTrigger>
                                            <MenubarSubContent>
                                                <Link href='/department'>
                                                    <MenubarItem className='h-9 text-base'>
                                                        <FaHouseUser />&nbsp;ฝ่ายงาน
                                                            <div className='z-50 grid place-content-center place-items-center p-1 pt-1.5 mt-[-20px] ml-[-5px] w-[18px] h-[18px] text-sm text-white rounded-full bg-red-500' >
                                                                {departmentsCount.length}
                                                            </div>
                                                    </MenubarItem>
                                                </Link>
                                                <Link href='/position'>
                                                    <MenubarItem className='h-9 text-base'>
                                                        <FaIdCardClip />&nbsp;ตำแหน่ง
                                                            <div className='z-50 grid place-content-center place-items-center p-1 pt-1.5 mt-[-20px] ml-[-5px] w-[18px] h-[18px] text-sm text-white rounded-full bg-red-500' >
                                                                {positionsCount.length}
                                                            </div>
                                                    </MenubarItem>
                                                </Link>
                                                <Link href='/role'>
                                                    <MenubarItem className='h-9 text-base'>
                                                        <FaCircleCheck />&nbsp;สิทธิ์การใช้งาน
                                                            <div className='z-50 grid place-content-center place-items-center p-1 pt-1.5 mt-[-20px] ml-[-5px] w-[18px] h-[18px] text-sm text-white rounded-full bg-red-500' >
                                                                {rolesCount.length}
                                                            </div>
                                                    </MenubarItem>
                                                </Link>
                                                <Link href='/users'>
                                                    <MenubarItem className='h-9 text-base'>
                                                        <FaUser />&nbsp;รายการผู้ใช้งาน
                                                            <div className='z-50 grid place-content-center place-items-center p-1 pt-1.5 mt-[-20px] ml-[-5px] w-[18px] h-[18px] text-sm text-white rounded-full bg-red-500' >
                                                                {usersCount.length}
                                                            </div>
                                                    </MenubarItem>
                                                </Link>
                                            </MenubarSubContent>
                                        </MenubarSub>
                                    </MenubarSubContent>
                                </MenubarSub>
                                <MenubarSeparator />
                                <Link href='/booking'>
                                    <MenubarItem className='h-9 text-base'>
                                        <BsBookmarkPlusFill />&nbsp;จองห้องประชุม
                                    </MenubarItem>
                                </Link>
                                {/* <Link href='/setting'>
                                    <MenubarItem className='h-9 text-base'>
                                        <HiMiniCog6Tooth />&nbsp;ตั้งค่าระบบ
                                    </MenubarItem>
                                </Link> */}
                            </MenubarContent>
                    </MenubarMenu>
                :
                    <MenubarMenu>
                        <Link href='/dashboard'>
                            <MenubarTrigger className=' hover:cursor-pointer bg-transparent text-base'>
                                <BsFillHouseFill />&nbsp;หน้าแรก
                            </MenubarTrigger>
                        </Link>
                    </MenubarMenu>
                }

                {/* for all users */}
                {session && (
                    <>
                        <MenubarMenu className='h-9 text-base'>
                            <MenubarTrigger className='hover:cursor-pointer text-base px-2'>
                                <BsBookmarkCheckFill />&nbsp;ห้องประชุม
                                    {/* <span className='z-50 grid place-content-center place-items-center p-1 pt-1.5 mt-[-20px] ml-[-5px] w-[18px] h-[18px] text-sm text-white hover:text-white rounded-full bg-red-500 hover:bg-red-500' >
                                        {roomsBookingCount.length}
                                    </span> */}
                            </MenubarTrigger>
                                <MenubarContent>
                                <Link href='/booking'>
                                    <MenubarItem className='h-9 text-base'>
                                        <BsBookmarkPlusFill />&nbsp;จองห้องประชุม
                                        <div className='z-50 grid place-content-center place-items-center p-1 pt-1.5 mt-[-20px] ml-[-5px] w-[18px] h-[18px] text-sm text-white rounded-full bg-red-500' >
                                            {roomsBookingCount.length}
                                        </div>
                                    </MenubarItem>
                                </Link>
                                <Link href='/rooms'>
                                    <MenubarItem className='h-9 text-base'>
                                        <BsBuildingFillCheck />&nbsp;รายการห้องประชุม
                                        <div className='z-50 grid place-content-center place-items-center p-1 pt-1.5 mt-[-20px] ml-[-5px] w-[18px] h-[18px] text-sm text-white rounded-full bg-red-500' >
                                            {roomsCount.length}
                                        </div>
                                    </MenubarItem>
                                </Link>

                                {/* for MANAGER */}
                                {(session?.user?.role === UserRole.MANAGER || session?.user?.role === UserRole.ADMIN ) && (
                                    <Link href='/report'>
                                        <MenubarItem className='h-9 text-base'>
                                            <HiDocumentText />&nbsp;รายงานการใช้ห้องประชุม
                                        </MenubarItem>
                                    </Link>
                                )}
                                
                                </MenubarContent>
                        </MenubarMenu>
                    </>
                )}

                {/* always show */}
                <MenubarMenu>
                    <MenubarTrigger className=' hover:cursor-pointer bg-transparent text-base px-2'>
                    <BsFillQuestionCircleFill />&nbsp;ช่วยเหลือ
                    </MenubarTrigger>
                    <MenubarContent>
                        <Link href='/user_manual'>
                            <MenubarItem className='h-9 text-base'>
                                <FaBook />&nbsp;คู่มือการใช้งาน
                            </MenubarItem>
                        </Link>
                        <Link href='/about'>
                            <MenubarItem className='h-9 text-base'>
                                <FaCircleExclamation />&nbsp;เกี่ยวกับเรา
                            </MenubarItem>
                        </Link>
                    </MenubarContent>
                </MenubarMenu>
                
            </Menubar>

            <ProfileMenu />

            </div>
    </>
  )
}

export default Menu
