'use client';

import React, { useEffect, useState } from 'react';
import { BsFillXSquareFill, BsCalendar2CheckFill, BsClockFill, BsCheckCircleFill  } from 'react-icons/bs';
import { Button } from '@/components/ui/button';

const RoomDetailsModal = ({ room, onClose }) => {
  const [isRoomInUse, setIsRoomInUse] = useState(false);
  const [roomsBooking, setRoomsBooking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState({ minutes: 0, seconds: 0 });
  const [startTime, setStartTime] = useState('');  // State for start time
  const [stopTime, setStopTime] = useState('');    // State for stop time
  const [startDate, setStartDate] = useState('');  // To store start_date
  const [stopDate, setStopDate] = useState('');  // To store stop_date

  // Formatting function for capacity with commas
  const formatCapacity = (capacity) => {
    if (capacity) {
      return new Intl.NumberFormat().format(capacity);
    }
    return capacity;
  };

  const FREE_ROOM = 'ว่าง'
  const INUSED_ROOM = 'ใช้งาน'

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

// // Load Room Booking data ------------------------------------------------------------------------------------------------------------------------------------
//   useEffect(() => {
//     const loadRoomsBookingData = async () => {
//       setLoading(true);
//       try {
//         // Fetch room's bookings data from API
//         const response = await fetch('/api/rooms-booking'); // Replace with your API endpoint
//         const data = await response.json();
//         setRoomsBooking(data);

//       } catch (error) {
//         console.error("Error fetching room's bookings data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadRoomsBookingData();
//   }, []); // This only runs once
//   // End Load Room Booking data ------------------------------------------------------------------------------------------------------------------------------------

//   // Check Room Booking data ------------------------------------------------------------------------------------------------------------------------------------
//   // Function to check if the room is in use by calling the API
//   const checkIfRoomInUse = async () => {
//     if (!room) return;

//     try {
//       // Ensure to fetch the first booking's start_date for start_date parameter
//       const firstRoomBooking = roomsBooking[0]; // Adjust this if you need a different booking

//       //console.log("First Room Booking Data:", firstRoomBooking); // Log to check the data

//       const startDate = firstRoomBooking ? firstRoomBooking.start_date : currentDateTime.useDate; // Fallback to today's date if no bookings
//       const stopDate = firstRoomBooking ? firstRoomBooking.stop_date : currentDateTime.useDate;

//       const newStartTime = firstRoomBooking ? firstRoomBooking.start_time : '080000';  // Example start time (8:00:00 AM)
//       const newStopTime = firstRoomBooking ? firstRoomBooking?.stop_time : '120000';   // Example stop time (12:00:00 PM)

//       // Ensure state gets updated correctly
//       setStartTime(newStartTime);
//       setStopTime(newStopTime);
//       setStartDate(startDate);  // Update startDate
//       setStopDate(stopDate);  // Update stopDate

//       //console.log('Start Time:', newStartTime, 'Stop Time:', newStopTime); // Debug the values
      
//       // Make an API call to check room availability (send correct start_time, end_time, and booking_date)
//       const response = await fetch(
//         `/api/check-room-availability?room_id=${room.room_id}&start_time=${newStartTime}&end_time=${newStopTime}&start_date=${startDate}&stop_date=${stopDate}`
//       );

//       const data = await response.json();

//       // If the room is in use based on the response, update the state
//       if (data.status === 'in use') {
//         setIsRoomInUse(true);
//       } else {
//         setIsRoomInUse(false);
//       }
//     } catch (error) {
//       console.error('Error fetching booking data:', error);
//       setIsRoomInUse(false); // Default to available in case of error
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (roomsBooking.length > 0 && room) {
//       checkIfRoomInUse();
//     }
//   }, [roomsBooking, room]);

//   // Fetch booking status when the modal is open
//   useEffect(() => {
//     if (room) {
//       checkIfRoomInUse();
//     }

//     // Update remaining time every second if room is in use
//     const interval = setInterval(() => {
//       if (room && isRoomInUse) {
//         if (stopDate === currentDateTime.useDate) { // Check if stop date is today
//           setRemainingTime(calculateRemainingTime(stopTime)); // Calculate remaining time
//         }
//       }
//     }, 100);

//     return () => clearInterval(interval); // Cleanup interval on component unmount
//   }, [room, isRoomInUse]);
//   // End Check Room Booking data ------------------------------------------------------------------------------------------------------------------------------------

  // Handle Escape Key to Close Modal
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose(); // Close the modal
      }
    };

    // Add the event listener on component mount
    window.addEventListener('keydown', handleEscapeKey);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  if (!room) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-11/12">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">{room.room_name}</h3>
          {/* <BsFillXSquareFill
            onClick={onClose}
            className="cursor-pointer text-3xl text-red-600"
          /> */}
        </div>

        <div className="mt-4">
          <p><strong>รหัสห้อง :</strong> {room.room_id}</p>
          <p><strong>ประเภทห้อง :</strong> {room.roomType.roomtype_name}</p>
          <p><strong>ความจุ (คน) :</strong> {formatCapacity(room.capacity)}</p>
          <p><strong>อุปกรณ์ที่มีให้ :</strong> {room.equipment.equipment_name}</p>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={onClose} variant="outline">Close</Button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsModal;
