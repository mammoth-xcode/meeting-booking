'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import NoImg from '/public/images/no_image.gif'
import Menu from '../components/Menu'
import RoomDetailsModal from './RoomDetailsModal'; // Import the modal component
import AddRoomBookingModal from "../components/AddRoomBookingModal";
import Footer from '../components/Footer'
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
  BsBuildingsFill
 } from "react-icons/bs";

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
  Button,
} from "@/components/ui/button";

import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { BsArrowUpCircleFill } from "react-icons/bs";
import { FaBook, FaCircleExclamation, FaAddressBook, FaUserPlus, FaUserMinus, FaArrowRotateLeft, FaPencil, FaRegTrashCan, FaUser } from "react-icons/fa6";

import { SyncLoader } from "react-spinners";

// Function to dynamically import images
const importImage = async (imageName) => {
  try {
    // Adjust the path according to your directory structure
    const image = await import(`/public/images/${imageName}`);
    return image.default; // Return the default export
  } catch (error) {
    console.error(`Error loading image ${imageName}:`, error);
    return null; // Return null if the image fails to load
  }
};

function RoomListPage({ editable }) {
  const [roomsWithImages, setRoomsWithImages] = useState([]);
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState("room_name");
  const [showGoTop, setShowGoTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);  // To track selected room for modal
  const [isModalOpen, setIsModalOpen] = useState(false);  // To control modal visibility
  const [isRoomInUse, setIsRoomInUse] = useState(false);
  const [roomsUsageStatus, setRoomsUsageStatus] = useState({});
  const [roomsBooking, setRoomsBooking] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const openModal = (room) => {
    setSelectedRoom(room); // Set selected room data
    setIsModalOpen(true);  // Open modal
  };

  const closeModal = () => {
    setIsModalOpen(false);  // Close modal
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    // Redirect to '/booking' when the add modal is closed
    router.push("/booking");
  };

  const handleSave = (updatedRoomBooking) => {
    // const updatedRoomsBooking = bookings.map((booking) =>
    //     booking.booking_id === updatedRoomBooking.booking_id ? updatedRoomBooking : booking
    // );
    // setRoomBookings(updatedRoomsBooking);
    // setIsEditModalOpen(false);


    setIsAddModalOpen(false);
    // Redirect to '/booking' when the add modal is closed
    router.push("/booking");

  };

  const router = useRouter();

  const FREE_ROOM = 'ว่าง'
  const INUSED_ROOM = 'กำลังใช้งาน'
  const BOOKED_ROOM = 'มีการจองไว้'

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const useDate = `${year}${month}${day}`;
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const useTime = `${hours}${minutes}`;
    return { useDate, useTime, fullDate: now };
  };

  const currentDateTime = getCurrentDateTime();

  // Function to convert HHMMSS time string to a comparable number of seconds
  const convertTimeToSeconds = (timeString) => {
    const hours = parseInt(timeString.slice(0, 2), 10);
    const minutes = parseInt(timeString.slice(2, 4), 10);
    const seconds = parseInt(timeString.slice(4, 6), 10);
    return hours * 3600 + minutes * 60 + seconds; // Convert to total seconds
  };

  // Function to get the current time in HHMMSS format
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');  // Format hours to 2 digits
    const minutes = String(now.getMinutes()).padStart(2, '0'); // Format minutes to 2 digits
    const seconds = String(now.getSeconds()).padStart(2, '0'); // Format seconds to 2 digits
    return `${hours}${minutes}${seconds}`; // Return the time in HHMMSS format
  };

  // Function to calculate the remaining time in real-time
  const calculateRemainingTime = (stopTime) => {
    const currentTime = getCurrentTime(); // Get current time in HHMMSS format
    const stop = convertTimeToSeconds(stopTime);  // Convert stop_time to total seconds
    const current = convertTimeToSeconds(currentTime);  // Convert current_time to total seconds

    const remainingTimeInSeconds = stop - current; // Calculate remaining time in seconds

    if (remainingTimeInSeconds > 0) {
      const remainingMinutes = Math.floor(remainingTimeInSeconds / 60); // Calculate minutes
      const remainingSeconds = remainingTimeInSeconds % 60; // Calculate seconds
      return { minutes: remainingMinutes, seconds: remainingSeconds };
    }

    // If the remaining time is 0 or negative, return 0 minutes and seconds
    return { minutes: 0, seconds: 0 };
  };

  // Function to check if the current time is within the room's booking time range
  const isTimeInRange = (startTime, stopTime) => {
    const currentTime = getCurrentTime(); // Get the current time in HHMMSS format
    const start = convertTimeToSeconds(startTime);  // Convert start_time to total seconds
    const stop = convertTimeToSeconds(stopTime);    // Convert stop_time to total seconds

    console.log(startTime, stopTime);

    const current = convertTimeToSeconds(currentTime); // Convert current_time to total seconds
    return current >= start && current < stop; // Check if current time is within range
  };

  // Function to format time (e.g., '080000' -> '08:00:00')
const formatTime = (timeString) => {
  if (timeString && timeString.length === 6) {
    const hours = timeString.slice(0, 2); // First two characters are hours
    const minutes = timeString.slice(2, 4); // Next two characters are minutes
    const seconds = timeString.slice(4, 6); // Last two characters are seconds
    return `${hours}:${minutes}`; // Return in HH:MM:SS format
  }
  return 'Invalid Time'; // Fallback if time format is incorrect
};

const formatDate = (dateString) => {
  // Ensure the input is in the format yyyyMMdd (e.g., 20250103)
  const year = dateString.slice(0, 4);
  const month = dateString.slice(4, 6);
  const day = dateString.slice(6, 8);

  // Convert the year to Buddhist Era (B.E.) by adding 543
  const buddhistEraYear = parseInt(year) + 543;

  // Create a new Date object in yyyy-MM-dd format
  const formattedDateString = `${buddhistEraYear}-${month}-${day}`;
  const date = new Date(formattedDateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Invalid Date"; // Return a fallback value if the date is invalid
  }

  // Format the date as dd/MM/yyyy
  const dayFormatted = String(date.getDate()).padStart(2, '0'); // Add leading zero if necessary
  const monthFormatted = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const yearFormatted = buddhistEraYear;

  return `${dayFormatted}/${monthFormatted}/${yearFormatted}`;
};
  
  // Load Room Booking data ------------------------------------------------------------------------------------------------------------------------------------
  useEffect(() => {
    const loadRoomsBookingData = async () => {
      setLoading(true);
      try {
        // Fetch room's bookings data from API
        const response = await fetch('/api/rooms-booking'); // Replace with your API endpoint
        const data = await response.json();
        setRoomsBooking(data);

        //console.log(data);

      } catch (error) {
        console.error("Error fetching room's bookings data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRoomsBookingData();
  }, []); // This only runs once
  // End Load Room Booking data ------------------------------------------------------------------------------------------------------------------------------------

  // Load Room data ------------------------------------------------------------------------------------------------------------------------------------
  useEffect(() => {
    const loadRoomsData = async () => {
      setLoading(true);
      try {
        // Get the current date
        const today = new Date();

        // Get the first day of the current month (e.g., 2025-01-01)
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayFormatted = `${firstDayOfMonth.getFullYear()}${(firstDayOfMonth.getMonth() + 1).toString().padStart(2, '0')}${firstDayOfMonth.getDate().toString().padStart(2, '0')}`;

        // Get the last day of the current month
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const lastDayFormatted = `${lastDayOfMonth.getFullYear()}${(lastDayOfMonth.getMonth() + 1).toString().padStart(2, '0')}${lastDayOfMonth.getDate().toString().padStart(2, '0')}`;

        // console.log("First day of the month:", firstDayFormatted);
        // console.log("Last day of the month:", lastDayFormatted);

        // Fetch rooms data from API
        const roomsResponse = await fetch('/api/rooms');
        const roomsData = await roomsResponse.json();

        // // Fetch booking data for each room using a more optimized approach
        // const availabilityPromises = roomsData.map(async (room) => {
        //   const response = await fetch(`/api/check-room-booking?room_id=${room.room_id}&start_date=${firstDayFormatted}&stop_date=${lastDayFormatted}`);
        //   const bookingData = await response.json();
        //   return { ...room, booking: bookingData }; // Merging booking status into room data , using status: 'in range' or 'free'
        // });

        // // Wait for all room and booking data to be fetched
        // const roomsWithBookingData = await Promise.all(availabilityPromises);

        const roomsWithBookingData = await Promise.all(roomsData);

        // Load images for each room
        const roomsWithLoadedImages = await Promise.all(
          roomsWithBookingData.map(async (room) => {
            const imageUrl = await importImage(room.image_name);
            return { ...room, image_url: imageUrl };
          })
        );

        setRoomsWithImages(roomsWithLoadedImages);
      } catch (error) {
        console.error("Error fetching room data:", error);
      } finally {
        setLoading(false);
      }
    };

    const intervalId = setInterval(() => {
      loadRoomsData();
    }, 1000 * 1);

    loadRoomsData();

    return () => {
      clearInterval(intervalId);
    };

    //loadRoomsData(); // Only run once on mount
  }, []); // [] : Only run once on mount
  // End Load Room data ------------------------------------------------------------------------------------------------------------------------------------

  // Scroll to Top of page ------------------------------------------------------------------------------------------------------------------------------------
  useEffect(() => {
    const handleScroll = () => {
      setShowGoTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // End Scroll to Top of page ------------------------------------------------------------------------------------------------------------------------------------

  // Filter Room data ------------------------------------------------------------------------------------------------------------------------------------
  const filteredRooms = roomsWithImages.filter((room) =>
    room[searchColumn].toString().toLowerCase().includes(search.toLowerCase())
  );
  // End Filter Room data ------------------------------------------------------------------------------------------------------------------------------------

  return (
    <>
      <div className='flex flex-col items-start mt-[300px] h-dvh'>
        <Menu />
        <div className="container mx-auto px-2 mb-4 flex items-center justify-start">
          <BsBuildingFillCheck />&nbsp;
          <b>{`รายการห้องประชุม : ${roomsWithImages.length} ห้อง`}</b>
        </div>

        {/* {loading && (
          <div className="flex flex-row items-center justify-center container mx-auto">
            <span className="mr-3 text-slate-800 text-base">กำลังรับข้อมูล</span>
            <SyncLoader color="gold" />
          </div>
        )} */}

        <div className="container mx-auto mb-4 px-2 space-x-1 flex items-start">
          <Select defaultValue={searchColumn} onValueChange={(value) => setSearchColumn(value)}>
            <SelectTrigger className="w-[130px] text-base">
              <SelectValue placeholder="ชื่อห้องประชุม" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-base">ตัวกรองข้อมูล</SelectLabel>
                <SelectItem className="text-base" value="room_id">รหัสห้อง</SelectItem>
                <SelectItem className="text-base" value="room_name">ชื่อห้องประชุม</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder={`${searchColumn === "room_id" ? "รหัสห้อง" : "ชื่อห้องประชุม"}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-2 py-1 flex-1 text-base"
          />

          {/* Button to clear the search */}
          <Button
            variant="outline"
            onClick={() => setSearch('')}
            className="text-base ml-2"
          >
            ล้าง
          </Button>

        </div>

        {/* Room Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-screen-xl container mx-auto px-2">

        {filteredRooms.map((room) => (
          <div key={room.room_id} className="border rounded p-4 shadow-md flex flex-col mb-14 mx-0 pl-6">
            <div className="mb-0 aspect-video">
              <div className="relative flex flex-col items-center mx-auto">
                <Image
                  src={room.image_url || NoImg}
                  width={220}
                  height={50}
                  alt={room.room_name}
                  className="mr-2 /*rounded-t-sm*/ rounded-sm border-slate-600 border-[1px]"
                />

                
              </div>

              <div className="mt-2 mr-2 flex flex-col justify-center items-center font-bold ">
                <div>{room.room_name}</div>
              </div>
            </div>

            <div className="flex flex-row gap-0.5 mb-0">
              <div className="grid gap-0.5 items-center w-full mt-2 mr-2">
                <Button variant="outline" className="w-full" onClick={() => openModal(room)}>
                  ดูรายละเอียด
                </Button>
              </div>
              <div className="grid gap-0.5 items-center w-full mt-2 mr-2">
                <Button variant="slate_green" className="w-full" onClick={() => {
                  setSelectedRoom(room);
                  setIsAddModalOpen(true)
                }}>
                  จอง
                </Button>
              </div>
            </div>
          </div>
        ))}

        </div>
        

        {showGoTop && (
          <div className="fixed bottom-12 right-3">
            <BsArrowUpCircleFill onClick={scrollToTop} className="bg-none text-blue-500 hover:text-blue-500/90 text-4xl font-bold cursor-pointer" />
          </div>
        )}

        {isModalOpen && <RoomDetailsModal room={selectedRoom} onClose={closeModal} />}

        {isAddModalOpen && (
          <AddRoomBookingModal
            isOpen={isAddModalOpen}
            onClose={closeAddModal}
            onSave={handleSave}
            selectedRooms={selectedRoom}
          />
        )}
        
        <div className="w-dvw">
          {/* {status === 'authenticated' &&
            (<Footer />)
          } */}
        </div>
      </div>
    </>
  );
}

export default RoomListPage;