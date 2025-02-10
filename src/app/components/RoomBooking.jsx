'use client';

import React, { useEffect, useState, useRef } from "react";
import { UserRole } from '@prisma/client'
import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import NoImg from '../images/no_image.gif';
import Menu from '../components/Menu';
// import Footer from '../components/Footer';
import EditRoomBookingModal from "../components/EditRoomBookingModal";
import AddRoomBookingModal from "../components/AddRoomBookingModal";
import { FaBook, FaCircleExclamation, FaAddressBook, FaUserPlus, FaUserMinus, FaArrowRotateLeft, FaPencil, FaRegTrashCan, FaCheck, FaElementor, FaHouseUser, FaIdCardClip, FaCircleCheck, FaCube, FaCirclePlus  } from "react-icons/fa6";
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
    BsBuildingFill,
    BsArrowRightSquare,
    BsArrowLeftSquare
   } from "react-icons/bs";
   import { HiMiniCog6Tooth, HiDocumentText } from "react-icons/hi2";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  Button,
} from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { BsArrowUpCircleFill, BsKey } from "react-icons/bs";

import { useSession } from "next-auth/react";

import { SyncLoader } from "react-spinners";

import Pagination from "./Pagination";
import jsPDF from "jspdf";
import html2canvas from 'html2canvas';


// Confirmation Modal Component for Deleting Room Booking
const ConfirmationModal = ({ isOpen, onConfirm, onCancel, roomBookingNo , roomName , topic, startDate, stopDate, startTime, stopTime }) => {
  if (!isOpen) return null;

  const displayRoomBookingName = roomBookingNo || 'ไม่พบรหัสการจอง';

  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-96">
        <div className="container mx-auto px-0 mb-4 flex items-center justify-start">
          <BsBuildingFillCheck />&nbsp;
          <b>ลบรายการจองห้องประชุมนี้ ?</b>
        </div>
        <p className="mb-1">{displayRoomBookingName}&nbsp;:&nbsp;{roomName}</p>
        <p className="mb-1">หัวข้อ&nbsp;:&nbsp;{topic}</p>
        <p className="mb-1">วันที่ใช้งาน&nbsp;:&nbsp;{startDate}&nbsp;ถึง&nbsp;{stopDate}</p>
        <p className="mb-3">เวลาที่ใช้งาน&nbsp;:&nbsp;{startTime}&nbsp;ถึง&nbsp;{stopTime}</p>
        {loading && (
          <div className="flex flex-row items-center justify-center container mx-auto z-[9999]">
            <span className="mr-3 text-slate-800 text-base">กำลังลบรายการจองห้องประชุม</span>
            <SyncLoader color="gold" />
          </div>
        )}
        <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}><FaArrowRotateLeft />&nbsp;<span className=" text-base">ยกเลิก</span></Button>
        <Button variant="destructive" onClick={onConfirm} disabled={loading}  className="text-[white]"><FaRegTrashCan />&nbsp;<span className=" text-base">ลบ</span></Button>
        </div>
      </div>
    </div>
  );
};

function RoomBookingPage({ editable }) {
  const [bookings, setRoomBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState("booking_id");
  const [showGoTop, setShowGoTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roomBookingsToDelete, setRoomBookingsToDelete] = useState(null);
  const [roomBookingsToEdit, setRoomBookingsToEdit] = useState(null);

  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const reportRef = useRef(null); // Create a reference for the report area

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const generatePDF = () => {
    if (!reportRef.current) {
      console.error("Report element not found");
      return; // Exit if the element is not found
    }
    
    html2canvas(reportRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      const imgWidth = 190; 
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("room_bookings_report.pdf");
    });
  };
  
  

  // Calculate the current items to be displayed
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = bookings.slice(indexOfFirstItem, indexOfLastItem);
  const [totalItems, setTotalItems] = useState(0); // Keep track of total items

  const { data: session } = useSession();  // This will give you session data

  const router = useRouter()

  useEffect(() => {
    const loadRoomData = async () => {
      setLoading(true);
      try {
        const responseRoom = await fetch('/api/rooms');
        const dataRoom = await responseRoom.json();
        setRooms(dataRoom);
      } catch (error) {
        console.error("Error fetching Rooms data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    const intervalId = setInterval(() => {
        loadRoomData();
    }, 1000 * 10);
  
    loadRoomData();
  
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        const responseUser = await fetch('/api/users');
        const dataUser = await responseUser.json();
        setUsers(dataUser);
      } catch (error) {
        console.error("Error fetching User data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    const intervalId = setInterval(() => {
        loadUserData();
    }, 1000 * 10);
  
    loadUserData();
  
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isModalOpen || isEditModalOpen || isAddModalOpen) {
      document.body.style.overflow = 'hidden'; // Disable scrolling
    } else {
      document.body.style.overflow = ''; // Re-enable scrolling
    }

    return () => {
      document.body.style.overflow = ''; // Reset overflow on unmount
    };
  }, [isModalOpen, isEditModalOpen, isAddModalOpen]);

  // Load Room Booking data (GET Request)
  useEffect(() => {
    const loadRoomsBookingData = async () => {
      try {
        const response = await fetch('/api/bookings');
        const data = await response.json();
        setRoomBookings(data);
        setTotalItems(data.length); // Set total items from your data length
      } catch (error) {
        console.error("Error fetching rooms bookings data:", error);
      } finally {
        setLoading(false);
      }
    };

    const intervalId = setInterval(() => {
        loadRoomsBookingData();
    }, 1000 * 1);

    loadRoomsBookingData();

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // console.log(bookings);

  const handleEdit = (booking) => {
    setRoomBookingsToEdit(booking);
    setIsEditModalOpen(true);
  };

  const handleSave = (updatedRoomBooking) => {
    const updatedRoomsBooking = bookings.map((booking) =>
        booking.booking_id === updatedRoomBooking.booking_id ? updatedRoomBooking : booking
    );
    setRoomBookings(updatedRoomsBooking);
    setIsEditModalOpen(false);
  };
  
   const handleClose = () => {
    setIsEditModalOpen(false); // Close the modal without saving
   };

    // Define the function to handle row clicks and show details
    const handleRowClick = (booking) => {
        setRoomBookingsToEdit(booking);  // Store the booking data you want to edit
        setIsEditModalOpen(true); // Open the modal with booking details
    };

   // Close modal when Escape key is pressed----------------------------------------------------
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false); // Close the confirmation modal when Escape is pressed
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.removeEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey); // Clean up event listener
    };
  }, [isModalOpen]);
  // End Escape key is pressed----------------------------------------------------
  
  const handleDelete = (booking) => {
    setRoomBookingsToDelete(booking);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true); // Set loading to true when request starts

      const response = await fetch(`/api/bookings`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            booking_id: roomBookingsToDelete.booking_id,
        }),
      });
      if (response.ok) {
        setLoading(false); // Set loading to false after successful request
        setRoomBookings(bookings.filter(booking => booking.booking_id !== roomBookingsToDelete.booking_id));
        setIsModalOpen(false);
        setRoomToDelete(null);
      } else {
        setLoading(false); // Ensure loading is set back to false on failure
        console.error("Failed to delete room booiking");
      }
    } catch (error) {
      setLoading(false); // Ensure loading is set back to false on error
      console.error("Error deleting room booiking:", error);
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setRoomBookingsToDelete(null);
  };


  // // // bookings.filter((booiking)
  const filteredRoomsBooking = currentItems.filter((booiking) => {
    // if (searchColumn === "roomType.roomtype_name") {
    //     return room.roomType?.roomtype_name.toLowerCase().includes(search.toLowerCase());
    // }
    // if (searchColumn === "equipment.equipment_name") {
    // return room.equipment?.equipment_name.toLowerCase().includes(search.toLowerCase());
    // }
    return booiking[searchColumn]?.toString().toLowerCase().includes(search.toLowerCase());
  });

  const isInDateTimeRange = (startDate, stopDate, startTime, stopTime) => {
    // Get current date and time
    const currentDate = new Date();

    // Combine start date and time
    const startDateTime = new Date(`${startDate}T${startTime}`);

    // Combine stop date and time
    const stopDateTime = new Date(`${stopDate}T${stopTime}`);

    // Check if current date and time is between start and stop times
    return currentDate >= startDateTime && currentDate <= stopDateTime;
};

const isDateTimeRangePassed = (startDate, stopDate, startTime, stopTime) => {
  // Get current date and time
  const currentDate = new Date();

  // Combine start date and time
  const startDateTime = new Date(`${startDate}T${startTime}:00`); // Ensure the time is in HH:mm:ss format

  // Combine stop date and time
  const stopDateTime = new Date(`${stopDate}T${stopTime}:00`); // Ensure the time is in HH:mm:ss format

  // Check if current date and time is past stop time
  return currentDate > stopDateTime;
};


  // Create a mapping between searchColumn keys and user-friendly placeholders
  const placeholderMap = {
    booking_id: 'รหัสการจอง',
    room_id: 'รหัสห้องประชุม',
    user_id: 'รหัสผู้จอง',
    booking_date: 'วันที่จอง',
    topic: 'หัวข้อ/วาระการประชุม',
    start_date: 'วันที่เริ่มต้นใช้งาน',
    stop_date: 'วันที่สิ้นสุดการใช้งาน',
    start_time: 'เวลาเริ่มต้นใช้งาน',
    stop_time: 'เวลาสิ้นสุดการใช้งาน',
    approve_status: 'สถานะการอนุมัติ',
    remark: 'หมายเหตุ',
  };

  // Get the dynamic placeholder based on searchColumn
  const placeholderText = placeholderMap[searchColumn] || 'ค้นหาการจองห้องประชุม';

  return (
    <div className='flex flex-col items-start mt-[300px] h-dvh'>
      <Menu />
      <div className="container mx-auto px-2 mb-4 flex items-center justify-start">
        <BsBookmarkPlusFill />&nbsp;
        <b>{`การจองห้องประชุม :: ${bookings.length} รายการ`}</b>
      </div>

      <div className="container mx-auto mb-4 px-2 space-x-1 flex items-start">
        <Select defaultValue={searchColumn} onValueChange={(value) => setSearchColumn(value)}>
          <SelectTrigger className="w-[150px] text-base">
            <SelectValue placeholder="รหัสการจองห้องประชุม" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="text-base">ตัวกรองข้อมูล</SelectLabel>
              <SelectItem className="text-base" value="booking_id">รหัสการจอง</SelectItem>
              <SelectItem className="text-base" value="room_id">รหัสห้องประชุม</SelectItem>
              <SelectItem className="text-base" value="user_id">รหัสผู้จอง</SelectItem>
              <SelectItem className="text-base" value="booking_date">วันที่จอง</SelectItem>
              <SelectItem className="text-base" value="topic">หัวข้อ/วาระการประชุม</SelectItem>
              <SelectItem className="text-base" value="start_date">วันที่เริ่มต้นใช้งาน</SelectItem>
              <SelectItem className="text-base" value="stop_date">วันที่สิ้นสุดการใช้งาน</SelectItem>
              <SelectItem className="text-base" value="start_time">เวลาเริ่มต้นใช้งาน</SelectItem>
              <SelectItem className="text-base" value="stop_time">เวลาสิ้นสุดการใช้งาน</SelectItem>
              <SelectItem className="text-base" value="approve_status">สถานะการอนุมัติ</SelectItem>
              <SelectItem className="text-base" value="remark">หมายเหตุ</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder={placeholderText}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 flex-1 text-base"
        />

        <Button
          variant="outline"
          onClick={() => setSearch('')}
          className="text-base ml-2"
        >
          <FaArrowRotateLeft />&nbsp;ล้าง
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 w-full max-w-screen-xl container mx-auto px-2">

        <div className="container mx-auto mb-0 space-x-2 flex items-center justify-end">
            {(session?.user?.role === UserRole.MANAGER || session?.user?.role === UserRole.ADMIN) && (
            <Button
                variant="outline"
                onClick={() => router.push('/report')}
                // onClick={() => generatePDF()}
                className="flex items-center justify-center text-base"
            >
                <HiDocumentText className="mx-0 text-base px-0" />
                <span className="flex items-center justify-center py-0 px-0 pl-1 mt-0.5">รายงานการจองห้องประชุม</span>
            </Button>
            )}
            
            <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(true)}  // Open modal
                className="flex items-center justify-center text-base"
            >
                <FaCirclePlus className="mx-0 text-base px-0" />
                <span className="flex items-center justify-center py-0 px-0 pl-1 mt-0.5">จองห้องประชุม</span>
            </Button>
        </div>

        {/* Top Pagination Component */}
        {/* <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
        /> */}

        <Table>
          {/* <TableCaption>{`การจองห้องประชุม :: ${filteredRoomsBooking.length} / ${bookings.length} รายการ`}</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead>ลำดับ</TableHead>
              <TableHead>รหัสการจอง</TableHead>
              <TableHead>ห้องประชุม</TableHead>
              <TableHead>รูปภาพ</TableHead>
              {/* <TableHead>ผู้จอง</TableHead> */}
              {/* <TableHead>วันที่จอง</TableHead> */}
              <TableHead>หัวข้อ/วาระการประชุม</TableHead>
              <TableHead>วันที่เริ่มต้น</TableHead>
              <TableHead>วันที่สิ้นสุด</TableHead>
              <TableHead>เวลาเริ่มต้น</TableHead>
              <TableHead>เวลาสิ้นสุด</TableHead>
              <TableHead>สถานะ</TableHead>
              {/* <TableHead>การอนุมัติ</TableHead> */}
              <TableHead>หมายเหตุ</TableHead>
              <TableHead>การจัดการข้อมูล</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoomsBooking.map((booking, index) => (
              <TableRow 
                key={booking.booking_id}
                // onClick={() => handleRowClick(booking)}  // Add row click event
              >       
                {/* //  index + 1 */}
                <TableCell>{index + 1 + (currentPage - 1) * itemsPerPage}</TableCell>

                <TableCell>{booking.booking_id}</TableCell>
                
                <TableCell>
                    {
                        // Find the room by room_id
                        rooms.find(room => room.room_id === booking.room_id)?.room_name || 'ไม่พบห้อง'
                    }
                </TableCell>
                <TableCell>
                    {
                        rooms.find(room => room.room_id === booking.room_id)?.image_name ?
                        <img src={`/images/${rooms.find(room => room.room_id === booking.room_id)?.image_name || ''}`} alt='' style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', borderRadius: '5px', border: 'solid 1px #ddd'  }} />
                        :
                        <img src={`/images/no_image.gif`} alt='' style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', borderRadius: '5px', border: 'solid 1px #ddd'  }} />
                    }
                </TableCell>

                {/* <TableCell>
                    {
                        // Find the user by user_id
                        users.find(user => user.employee_id === booking.user_id)?.name || 'ไม่พบผู้ใช้'
                    }
                    &nbsp;
                    {
                        // Find the user by user_id
                        users.find(user => user.employee_id === booking.user_id)?.lastname || 'ไม่พบผู้ใช้'
                    }
                </TableCell> */}

                {/* <TableCell>
                    {
                        `${booking.booking_date.substring(6, 8)}/${booking.booking_date.substring(4, 6)}/${parseInt(booking.booking_date.substring(0, 4)) + 543 }`
                    }
                </TableCell> */}

                <TableCell>{booking.topic}</TableCell>

                <TableCell>
                    {
                        `${booking.start_date.substring(6, 8)}/${booking.start_date.substring(4, 6)}/${parseInt(booking.start_date.substring(0, 4)) + 543 }`
                    }
                </TableCell>

                <TableCell>
                    {
                        `${booking.stop_date.substring(6, 8)}/${booking.stop_date.substring(4, 6)}/${parseInt(booking.stop_date.substring(0, 4)) + 543 }`
                    }
                </TableCell>

                <TableCell>
                    {
                        `${booking.start_time.substring(0, 2)}:${booking.start_time.substring(2, 4)}`
                    }
                </TableCell>

                <TableCell>
                    {
                        `${booking.stop_time.substring(0, 2)}:${booking.stop_time.substring(2, 4)}`
                    }
                </TableCell>

                <TableCell 
                    className={`font-bold flex justify-center items-center h-12 ${isInDateTimeRange(
                        `${booking.start_date.substring(0, 4)}-${booking.start_date.substring(4, 6)}-${booking.start_date.substring(6, 8)}`,
                        `${booking.stop_date.substring(0, 4)}-${booking.stop_date.substring(4, 6)}-${booking.stop_date.substring(6, 8)}`,
                        `${booking.start_time.substring(0, 2)}:${booking.start_time.substring(2, 4)}`,
                        `${booking.stop_time.substring(0, 2)}:${booking.stop_time.substring(2, 4)}`
                    ) ? 'border-none' : 'border-none'}`}
                >
                    <div 
                        className={`flex justify-center items-center w-6 h-6 rounded-full p-4 mt-9 ${isInDateTimeRange(
                            `${booking.start_date.substring(0, 4)}-${booking.start_date.substring(4, 6)}-${booking.start_date.substring(6, 8)}`,
                            `${booking.stop_date.substring(0, 4)}-${booking.stop_date.substring(4, 6)}-${booking.stop_date.substring(6, 8)}`,
                            `${booking.start_time.substring(0, 2)}:${booking.start_time.substring(2, 4)}`,
                            `${booking.stop_time.substring(0, 2)}:${booking.stop_time.substring(2, 4)}`
                        ) ? 'bg-red-500 text-white font-normal' : 'bg-green-600 text-white font-normal'}`}
                    >
                      {

                        isInDateTimeRange(
                              `${booking.start_date.substring(0, 4)}-${booking.start_date.substring(4, 6)}-${booking.start_date.substring(6, 8)}`,
                              `${booking.stop_date.substring(0, 4)}-${booking.stop_date.substring(4, 6)}-${booking.stop_date.substring(6, 8)}`,
                              `${booking.start_time.substring(0, 2)}:${booking.start_time.substring(2, 4)}`,
                              `${booking.stop_time.substring(0, 2)}:${booking.stop_time.substring(2, 4)}`
                        )
                        ?
                          'ใช้'
                        :
                          'ว่าง'
    
                      }
                    </div>
                </TableCell>


                {/* <TableCell>{booking.approve_status}</TableCell> */}

                <TableCell>{booking.remark}</TableCell>

                <TableCell>
                    <Button 
                        onClick={() => handleEdit(booking)} 
                        variant="slate_blue"
                        className="mr-2 px-3 py-2"
                    >
                        <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger><FaPencil /></TooltipTrigger>
                            <TooltipContent>
                            <p>แก้ไขการจองห้องประชุม</p>
                            </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                    </Button>
                    <Button 
                        onClick={() => handleDelete(booking)} 
                        variant="slate_red" 
                        disabled={loading}
                        className="text-slate-800 px-3 py-2"
                    >
                        <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger><FaRegTrashCan /></TooltipTrigger>
                            <TooltipContent>
                            <p>ลบการจองห้องประชุม</p>
                            </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
          <TableRow>
            <TableCell colSpan={12} className="bg-white">
              {/* Pagination Component */}
              <Pagination
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onPageChange={handlePageChange}
              />
            </TableCell>
          </TableRow>
        </TableFooter>

        </Table>


        {/* <div className="flex flex-row justify-center align-middle w-full border-none -mt-3">
          <Button className="w-1/6" onClick={generatePDF}>Download</Button>
        </div> */}
        

      </div>

      {showGoTop && (
        <div className="fixed bottom-12 right-3">
          <BsArrowUpCircleFill onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-none text-blue-500 hover:text-blue-500/90 text-4xl font-bold cursor-pointer" />
        </div>
      )}

      <ConfirmationModal 
        isOpen={isModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        roomBookingNo={roomBookingsToDelete?.booking_id}
        roomName={rooms.find(room => room.room_id === roomBookingsToDelete?.room_id)?.room_name}
        topic={roomBookingsToDelete?.topic}
        startDate={`${roomBookingsToDelete?.start_date.substring(6, 8)}/${roomBookingsToDelete?.start_date.substring(4, 6)}/${parseInt(roomBookingsToDelete?.start_date.substring(0, 4)) + 543}`}
        stopDate={`${roomBookingsToDelete?.stop_date.substring(6, 8)}/${roomBookingsToDelete?.stop_date.substring(4, 6)}/${parseInt(roomBookingsToDelete?.stop_date.substring(0, 4)) + 543}`}
        startTime={`${roomBookingsToDelete?.start_time.substring(0, 2)}:${roomBookingsToDelete?.start_time.substring(2, 4)}`}
        stopTime={`${roomBookingsToDelete?.stop_time.substring(0, 2)}:${roomBookingsToDelete?.stop_time.substring(2, 4)}`}
      />

      <EditRoomBookingModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
        roomBooingData={roomBookingsToEdit}
      />

      <AddRoomBookingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
      />

      <div className="w-dvw">
        {/* <Footer /> */}
      </div>
    </div>
  );
}

export default RoomBookingPage;
