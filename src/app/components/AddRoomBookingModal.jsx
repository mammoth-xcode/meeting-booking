'use client';

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";
import { FaBook, FaCircleExclamation, FaAddressBook, FaUserPlus, FaFloppyDisk, FaArrowRotateLeft, FaCirclePlus } from "react-icons/fa6";
import { SyncLoader } from "react-spinners";
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

import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useSession } from 'next-auth/react'

const AddRoomBookingModal = ({ isOpen, onClose, onSave, selectedRooms }) => {
  // console.log(selectedRooms); // This will log the room object passed from the parent

  if (!isOpen) return null; // If the modal is not open, return nothing

  const { data: session, status } = useSession()

  const [loading, setLoading] = useState(false);
  const [showConflict, setShowConflict] = useState(false);
  const [showUndefined, setShowUndefined] = useState(false);
  const [showUnKnown, setShowUnKnown] = useState(false);
  const [showSentEmailError, setSentEmailError] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Initialize the state with a default date range
//   const [date, setDate] = useState({
//     from: new Date(2022, 0, 20), // January 20, 2022
//     to: addDays(new Date(2022, 0, 20), 20), // 20 days later
//   });

// Formatting function for capacity with commas
const formatCapacity = (capacity) => {
  if (capacity) {
    return new Intl.NumberFormat().format(capacity);
  }
  return capacity;
};

  const [startDate, setStartDate] = useState({
    from: new Date(), // Default to current date for 'from'
    to: undefined,    // No 'to' date initially
  });

  const [stopDate, setStopDate] = useState({
    from: new Date(), // Default to current date for 'from'
    to: undefined,    // No 'to' date initially
  });

  const [start_time, setStartTime] = useState({ start_hours: '', start_minutes: '' });
  const [stop_time, setStopTime] = useState({ stop_hours: '', stop_minutes: '' });
  const [isStartTimeValid, setIsStartTimeValid] = useState(true); // To track validity
  const [isStopTimeValid, setIsStopTimeValid] = useState(true); // To track validity

  useEffect(() => {
    const start_hours = parseInt(start_time.start_hours, 10);
    const start_minutes = parseInt(start_time.start_minutes, 10);
    const stop_hours = parseInt(stop_time.stop_hours, 10);
    const stop_minutes = parseInt(stop_time.stop_minutes, 10);

    // Check if hours and minutes are valid
    if (
      (start_time.start_hours && (start_hours < 0 || start_hours > 23)) ||
      (start_time.start_minutes && (start_minutes < 0 || start_minutes > 59))
    ) {
        setIsStartTimeValid(false);
    } else {
        setIsStartTimeValid(true);
    }

    if (
        (stop_time.stop_hours && (stop_hours < 0 || stop_hours > 23)) ||
        (stop_time.stop_minutes && (stop_minutes < 0 || stop_minutes > 59))
      ) {
          setIsStopTimeValid(false);
      } else {
        setIsStopTimeValid(true);
      }

  }, [start_time, stop_time]);

//   const handleHoursChange = (e) => {
//     const value = e.target.value;
//     // Only allow numeric input
//     if (/^\d*$/.test(value)) {
//       setTime((prev) => ({ ...prev, hours: value }));
//     }
//   };

//   const handleMinutesChange = (e) => {
//     const value = e.target.value;
//     // Only allow numeric input
//     if (/^\d*$/.test(value)) {
//       setTime((prev) => ({ ...prev, minutes: value }));
//     }
//   };


const handleStartTimeChange = (e, type, unit) => {
  const value = e.target.value;

  // Only allow numeric input
  if (/^\d*$/.test(value)) {
    // Ensure that the value doesn't exceed the allowed range (hours: 0-23, minutes: 0-59)
    if (unit === "hours" && (value > 23 || value < 0)) {
      return; // Don't allow invalid hour values
    }
    if (unit === "minutes" && (value > 59 || value < 0)) {
      return; // Don't allow invalid minute values
    }

    // Update the start_time state based on the unit (hours or minutes)
    if (unit === "hours") {
      setStartTime(prev => {
        const updatedStartTime = {
          ...prev,
          start_hours: value,
        };

        // Update start_time in the format HHmm00
        const updatedStartTimeFormatted = `${value.padStart(2, '0')}${prev.start_minutes.padStart(2, '0')}00`;

        setFormData(prevData => ({
          ...prevData,
          start_time: updatedStartTimeFormatted
        }));

        // console.log("Updated start_time (hours):", updatedStartTime);
        return updatedStartTime;
      });
    } else if (unit === "minutes") {
      setStartTime(prev => {
        const updatedStartTime = {
          ...prev,
          start_minutes: value,
        };

        // Update start_time in the format HHmm00
        const updatedStartTimeFormatted = `${prev.start_hours.padStart(2, '0')}${value.padStart(2, '0')}00`;

        setFormData(prevData => ({
          ...prevData,
          start_time: updatedStartTimeFormatted
        }));

        // console.log("Updated start_time (minutes):", updatedStartTime);
        return updatedStartTime;
      });
    }
  }
};

const handleStopTimeChange = (e, type, unit) => {
  const value = e.target.value;

  // Only allow numeric input
  if (/^\d*$/.test(value)) {
    // Ensure that the value doesn't exceed the allowed range (hours: 0-23, minutes: 0-59)
    if (unit === "hours" && (value > 23 || value < 0)) {
      return; // Don't allow invalid hour values
    }
    if (unit === "minutes" && (value > 59 || value < 0)) {
      return; // Don't allow invalid minute values
    }

    // Update the stop_time state based on the unit (hours or minutes)
    if (unit === "hours") {
      setStopTime(prev => {
        const updatedStopTime = {
          ...prev,
          stop_hours: value,
        };

        // Update stop_time in the format HHmm00
        const updatedStopTimeFormatted = `${value.padStart(2, '0')}${prev.stop_minutes.padStart(2, '0')}00`;

        setFormData(prevData => ({
          ...prevData,
          stop_time: updatedStopTimeFormatted
        }));

        // console.log("Updated stop_time (hours):", updatedStopTime);
        return updatedStopTime;
      });
    } else if (unit === "minutes") {
      setStopTime(prev => {
        const updatedStopTime = {
          ...prev,
          stop_minutes: value,
        };

        // Update stop_time in the format HHmm00
        const updatedStopTimeFormatted = `${prev.stop_hours.padStart(2, '0')}${value.padStart(2, '0')}00`;

        setFormData(prevData => ({
          ...prevData,
          stop_time: updatedStopTimeFormatted
        }));

        // console.log("Updated stop_time (minutes):", updatedStopTime);
        return updatedStopTime;
      });
    }
  }
};



  const [roomsData, setRoomsData] = useState([]); // Room data

  const [formData, setFormData] = useState({
    room_id: "",
    user_id: session?.user?.employee_id || "",
    booking_date: "",
    topic: "",
    start_date: "",
    stop_date: "",
    start_time: "",
    stop_time: "",
    approve_status: "",
    remark: "",
  });

  const [errors, setErrors] = useState({
    room_id: "",
    user_id: session?.user?.employee_id || "",
    booking_date: "",
    topic: "",
    start_date: "",
    stop_date: "",
    start_time: "",
    stop_time: "",
    approve_status: "",
    remark: "",
  });

  // Set booking_date to current date in yyyyMMdd format when component mounts
  useEffect(() => {
    const currentDate = new Date();
    const formattedDate = currentDate
      .toLocaleDateString('en-GB') // Format as dd/MM/yyyy
      .split('/') // Split into [dd, MM, yyyy]
      .reverse() // Reverse to [yyyy, MM, dd]
      .join(''); // Join into yyyyMMdd

    setFormData(prev => ({
      ...prev,
      booking_date: formattedDate, // Set booking_date to current date in yyyyMMdd format
    }));
  }, []); // Empty dependency array means this will run only once when the component mounts


  const handleStartDateSelect = (selectedStartDate) => {

    if (!selectedStartDate) {
      // Handle case when no date is selected
      return; // Exit early if no date is selected
    }

    // Get the year in US format (yyyy)
    const year = selectedStartDate.toLocaleDateString('en-US', { year: 'numeric' });

    // Get the month and day in Thailand locale (th-TH) with zero-padding
    const [day, month] = selectedStartDate
      .toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' }) // 'dd/MM' format in Thailand
      .split('/'); // Split into [dd, MM]

    // Ensure the month and day are always 2 digits (they should be already from Thailand format)
    const formattedStartDate = `${year}${month}${day}`; // Combine them as 'yyyyMMdd'

    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        start_date: formattedStartDate, // Set the start_date in yyyyMMdd format
      };
      // console.log("Updated formData:", updatedFormData); // Log the updated formData
      return updatedFormData;
    });
  };

  // Convert yyyyMMdd string to Start Date object
  const formattedStartDate = formData?.start_date;
  const start_year = formattedStartDate?.slice(0, 4);
  const start_month = formattedStartDate?.slice(4, 6) - 1; // Months are 0-indexed
  const start_day = formattedStartDate?.slice(6, 8);

  // Create a new Date object
  const startDateObject = new Date(start_year, start_month, start_day);

  const handleStopDateSelect = (selectedStopDate) => {

    if (!selectedStopDate) {
      // Handle case when no date is selected
      return; // Exit early if no date is selected
    }

    // Get the year in US format (yyyy)
    const year = selectedStopDate.toLocaleDateString('en-US', { year: 'numeric' });

    // Get the month and day in Thailand locale (th-TH) with zero-padding
    const [day, month] = selectedStopDate
      .toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' }) // 'dd/MM' format in Thailand
      .split('/'); // Split into [dd, MM]

    // Ensure the month and day are always 2 digits (they should be already from Thailand format)
    const formattedStopDate = `${year}${month}${day}`; // Combine them as 'yyyyMMdd'

    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        stop_date: formattedStopDate, // Set the start_date in yyyyMMdd format
      };
      // console.log("Updated formData:", updatedFormData); // Log the updated formData
      return updatedFormData;
    });
  };

  // Convert yyyyMMdd string to Stop Date object
  const formattedStopDate = formData?.stop_date;
  const stop_year = formattedStopDate?.slice(0, 4);
  const stop_month = formattedStopDate?.slice(4, 6) - 1; // Months are 0-indexed
  const stop_day = formattedStopDate?.slice(6, 8);

  // Create a new Date object
  const stopDateObject = new Date(stop_year, stop_month, stop_day);

  const [showSuccess, setShowSuccess] = useState(false); // To control success modal visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
  
      // When the file is read, update the state with the preview URL and file name
      reader.onloadend = () => {
        setFormData((prevData) => ({
          ...prevData,
          image_preview: reader.result, // Store the file name
          image_name: file.name, // Store the base64 string as the preview image
        }));
      };
  
      // Read the file as a Data URL (base64 string)
      reader.readAsDataURL(file);
    
      // Save the file for submission
      setSelectedImage(file);

  }
};

useEffect(() => {
    // Assuming you have an API to fetch rooms
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => setRoomsData(data))
      .catch((error) => console.error("Error fetching rooms:", error));
  }, []);
  

  // Validation function
  const validate = () => {
    let valid = true;
    let newErrors = { ...errors };

    // Validate basic fields
    if (!formData.room_id) {
      newErrors.room_id = "กรุณาเลือกห้องประชุม";
      valid = false;
    } else {
      newErrors.room_id = "";
    }

    // Validate basic fields
    if (!formData.topic) {
      newErrors.topic = "กรุณาระบุหัวข้อการประชุม";
      valid = false;
    } else {
      newErrors.topic = "";
    }

    // Validate basic fields
    if (!formData.start_date) {
      newErrors.start_date = "กรุณาเลือกวันเริ่มต้น";
      valid = false;
    } else {
      newErrors.start_date = "";
    }

    // Validate basic fields
    if (!formData.start_time) {
      newErrors.start_time = "กรุณาเลือกเวลาเริ่มต้น";
      valid = false;
    } else {
      newErrors.start_time = "";
    }

    // Validate basic fields
    if (!formData.stop_date) {
      newErrors.stop_date = "กรุณาเลือกวันสิ้นสุด";
      valid = false;
    } else {
      newErrors.stop_date = "";
    }

    // Validate basic fields
    if (!formData.stop_time) {
      newErrors.stop_time = "กรุณาเลือกเวลาสิ้นสุด";
      valid = false;
    } else {
      newErrors.stop_time = "";
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (validate()) {

      // If user doesn't exist, proceed with saving the data
      const updatedData = { ...formData};

      console.log(updatedData);

      try {
        setLoading(true); // Set loading to true when request starts

        const response = await fetch('api/bookings', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });
  
        if (response.ok) {
          setLoading(false);  // Set loading to false when request is successful
          onSave(updatedData);
          setShowSuccess(true);
  
          setTimeout(() => {
            setShowSuccess(false);
            onClose();
          }, 500);
        } if (response.status ===409) {
          console.log('Conflict'); // dupplicate
          setLoading(false);
          setShowConflict(true);

          setTimeout(() => {
            setShowConflict(false);
          }, 4000);
        } else {
          if (response.status ===409) {
            console.log('Conflict'); // dupplicate
            setLoading(false);
            setShowConflict(true);
  
            setTimeout(() => {
              setShowConflict(false);
            }, 4000);
          } else {
            //console.log('Error: ');

            //Undefined
            setLoading(false);
            // setShowUndefined(true);

            // setTimeout(() => {
            //   setShowUndefined(false);
            // }, 2000);
          }
        }
      } catch (error) {
        console.error(error);

        if (error.status ===409) {
          console.log('Conflict'); // dupplicate
          setLoading(false);
          setShowConflict(true);

          setTimeout(() => {
            setShowConflict(false);
          }, 3000);
        } else {
          //UnKnown
          setLoading(false);
          // setShowUnKnown(true);
  
          // setTimeout(() => {
          //   setShowUnKnown(false);
          // }, 2000);
        }
      }
    } else {
      setLoading(false); // Ensure loading is set back to false on error
      console.log('Validation failed');
    }

  };
  

  // Close modal when Escape key is pressed----------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    // Cleanup the event listener on component unmount or when modal is closed
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);
  //End Escape--------------------------------------------------------------------------------


  // if select room from rooms list to booking, set selected room_id
  if(selectedRooms && formData?.room_id === ''){ handleSelectChange('room_id', selectedRooms.room_id) }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white px-6 py-3 rounded-lg w-96">
        <div className="container mx-auto px-0 mb-1 flex items-center justify-center">
          <BsBookmarkPlusFill />&nbsp;
          <span className="text-lg font-semibold mb-0">จองห้องประชุมใหม่</span>
        </div>
        {loading && (
          <div className="flex flex-row items-center justify-center container mx-auto">
            <span className="mr-3 text-slate-800 text-base">กำลังเพิ่มข้อมูล</span>
            <SyncLoader color="gold" />
          </div>
        )}
        <div className="space-y-4">

          {/* Booking ID Input */}
          {/* <Label className="text-slate-500">รหัสการจอง</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="รหัสการจอง"
              name="booking_id"
              value='AUTO'
              onChange={handleChange}
              disabled={true}
            />
          </div> */}

            <Label className="text-slate-500">เลือกห้องประชุม</Label>
            <div style={{ marginTop: '5px', marginBottom: '5px' }}>
              <Select 
              value={formData?.room_id || selectedRooms?.room_id || ""}
              onValueChange={(value) => handleSelectChange('room_id', value)}
              disabled={loading}
              >
              <SelectTrigger 
              className="w-full"
              style={{ marginTop: '5px', marginBottom: '5px' }}
              >
                  <SelectValue placeholder="เลือกห้องประชุม" />
              </SelectTrigger>
              <SelectContent>
                  {roomsData.map((room) => (
                  <SelectItem key={room.room_id} value={room.room_id}>
                      {room.room_name}
                  </SelectItem>
                  ))}
              </SelectContent>
              </Select>
              {errors.room_id && <p className="text-red-500 text-sm">{errors.room_id}</p>}

              {/* Find the selected room */}
              {roomsData.length > 0 && (formData.room_id || selectedRooms) ? (
              // Find the room based on formData.room_id
              (() => {
                const selectedRoom = roomsData.find((room) => room.room_id === formData.room_id);
                const roomToDisplay = selectedRoom || selectedRooms;

                // // If selectedRooms is used, call handleSelectChange with selectedRooms
                // if (roomToDisplay && selectedRooms && selectedRooms.room_id !== formData.room_id) {
                //   handleSelectChange('room_id', selectedRooms.room_id);
                // }

                if (roomToDisplay) {
                  return (
                    <>
                      <div className="flex flex-row">
                        <img
                          src={roomToDisplay.image_name ? `/images/${roomToDisplay.image_name}` : `/images/no_image.gif`}
                          alt=''
                          className="mt-2"
                          style={{
                            maxWidth: "120px",
                            maxHeight: "120px",
                            objectFit: "cover",
                            borderRadius: "5px",
                            border: "solid 1px #999",
                            boxShadow: "3px 3px 15px gray"
                          }}
                        />
                          <div className="pt-3 pl-4">
                            <p className="text-blue-700 font-normal">รองรับ {formatCapacity(roomToDisplay.capacity)} คน</p>
                          </div>
                      </div>
                    </>
                  );
                } else {
                  return (
                    <div>
                      <img
                        src={`/images/no_image.gif`}
                        alt="No image available"
                        className="mt-2"
                        style={{
                          maxWidth: "120px",
                          maxHeight: "120px",
                          objectFit: "cover",
                          borderRadius: "5px",
                          border: "solid 1px #999",
                          boxShadow: "3px 3px 15px gray"
                        }}
                      />
                      <div className="pt-3 pl-4">
                        <p className="text-blue-700 font-normal">รองรับ {formatCapacity(selectedRoom.capacity)} คน</p>
                      </div>
                    </div>
                  );
                }
              })()
            ) : (
              <img
                src={`/images/no_image.gif`}
                alt="No image available"
                className="mt-2"
                style={{
                  maxWidth: "120px",
                  maxHeight: "120px",
                  objectFit: "cover",
                  borderRadius: "5px",
                  border: "solid 1px #999",
                  boxShadow: "3px 3px 15px gray"
                }}
              />
            )}

            </div>

          {/* Topic Input */}
          <Label className="text-slate-500">หัวข้อ/วาระการประชุม</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="หัวข้อ/วาระการประชุม"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.topic && <p className="text-red-500 text-sm">{errors.topic}</p>}
          </div>

          {/* Booking use date Input */}
            <Label className="text-slate-500">วันที่เริ่มต้น</Label>
            <div  style={{ marginTop: "0px", marginBottom: "5px" }}>
              <Popover>
                  <PopoverTrigger asChild>
                  <Button
                    id="start_date"
                    name="start_date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.start_date && "text-muted-foreground" // Apply this class if start_date is null or undefined
                    )}
                    style={{ marginTop: "5px", marginBottom: "5px" }} // Directly apply margin-top here
                  >
                    <CalendarIcon className="mr-2" />
                    {formData.start_date ? (
                      // If start_date exists, format it in dd/MM/yyyy with Thai Buddhist Era year
                      `${formData.start_date.slice(6, 8)}/${formData.start_date.slice(4, 6)}/${parseInt(formData.start_date.slice(0, 4), 10) + 0}`
                    ) : (
                      // If start_date is null or undefined, show fallback text
                      <span>เลือกวันที่เริ่มต้น</span>
                    )}
                  </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                      initialFocus
                      mode="single"  // Change mode from "range" to "single"
                      selected={startDateObject}  // Set the selected date using the Date object
                      onSelect={handleStartDateSelect}  // Trigger handleDateSelect on date selection
                      />
                  </PopoverContent>
              </Popover>
              {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date}</p>}
            </div>

            <Label className="text-slate-500">ตั้งแต่เวลา</Label>
            <div className="flex flex-row items-center justify-left" style={{ marginTop: "15px", marginBottom: "5px" }}>
                <Input
                    type="number"
                    name="start_hours"
                    value={start_time.start_hours}
                    onChange={(e) => handleStartTimeChange(e, 'start', 'hours')}
                    max={23}
                    min={0}
                    placeholder="HH"
                    className="w-16 h-9 text-center"
                    style={{ borderColor: !isStartTimeValid ? 'red' : '#ddd', marginTop: "-12px", marginBottom: "5px" }}
                />
                <span 
                className="text-xl"
                style={{ borderColor: !isStartTimeValid ? 'red' : '#ddd', marginTop: "-12px", marginBottom: "5px" }}
                >&nbsp;:&nbsp;</span>
                <Input
                    type="number"
                    name="start_minutes"
                    value={start_time.start_minutes}
                    onChange={(e) => handleStartTimeChange(e, 'start', 'minutes')}
                    max={59}
                    min={0}
                    placeholder="MM"
                    className="w-16 h-9 text-center"
                    style={{ borderColor: !isStartTimeValid ? 'red' : '#ddd', marginTop: "-12px", marginBottom: "5px" }}
                />
                {!isStartTimeValid && <div className="text-red-500 text-sm mt-1 ml-2">กรุณากรอกเวลาให้ถูกต้อง !</div>}
                {errors.start_time && <p className="text-red-500 text-sm ml-2">{errors.start_time}</p>}
            </div>

            {/* Booking use date Input */}
            <Label className="text-slate-500" >วันที่สิ้นสุด</Label>
            <div  style={{ marginTop: "0px", marginBottom: "5px" }}>
              <Popover>
                  <PopoverTrigger asChild>
                      <Button
                      id="stop_date"
                      name="stop_date"
                      variant={"outline"}
                      className={cn(
                          "w-full justify-start text-left font-normal",
                          !stopDate && "text-muted-foreground",
                      )}
                      style={{ marginTop: "5px", marginBottom: "5px" }} // Directly apply margin-top here
                      >
                      <CalendarIcon className="mr-2" />
                      {formData.stop_date ? (
                      // If stop_date exists, format it in dd/MM/yyyy with Thai Buddhist Era year
                      `${formData.stop_date.slice(6, 8)}/${formData.stop_date.slice(4, 6)}/${parseInt(formData.stop_date.slice(0, 4), 10) + 0}`
                    ) : (
                      // If start_date is null or undefined, show fallback text
                      <span>เลือกวันที่สิ้นสุด</span>
                    )}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                      initialFocus
                      mode="single"  // Change mode from "range" to "single"
                      selected={stopDateObject}  // Set the selected date using the Date object
                      onSelect={handleStopDateSelect}  // Trigger handleDateSelect on date selection
                      />
                  </PopoverContent>
              </Popover>
              {errors.stop_date && <p className="text-red-500 text-sm">{errors.stop_date}</p>}
            </div>

            <Label className="text-slate-500">ถึงเวลา</Label>
            <div className="flex flex-row items-center justify-left" style={{ marginTop: "15px", marginBottom: "5px" }}>
                <Input
                    type="number"
                    name="stop_hours"
                    value={stop_time.stop_hours}
                    onChange={(e) => handleStopTimeChange(e, 'stop', 'hours')}
                    max={23}
                    min={0}
                    placeholder="HH"
                    className="w-16 h-9 text-center"
                    style={{ borderColor: !isStopTimeValid ? 'red' : '#ddd', marginTop: "-12px", marginBottom: "5px" }}
                />
                <span 
                className="text-xl"
                style={{ borderColor: !isStopTimeValid ? 'red' : '#ddd', marginTop: "-12px", marginBottom: "5px" }}
                >&nbsp;:&nbsp;</span>
                <Input
                    type="number"
                    name="stop_minutes"
                    value={stop_time.stop_minutes}
                    onChange={(e) => handleStopTimeChange(e, 'stop', 'minutes')}
                    max={59}
                    min={0}
                    placeholder="MM"
                    className="w-16 h-9 text-center"
                    style={{ borderColor: !isStopTimeValid ? 'red' : '#ddd', marginTop: "-12px", marginBottom: "5px" }}
                />
                {!isStopTimeValid && <div className="text-red-500 text-sm mt-1 ml-2">กรุณากรอกเวลาให้ถูกต้อง !</div>}
                {errors.stop_time && <p className="text-red-500 text-sm ml-2">{errors.stop_time}</p>}
            </div>

          {/* Remark Input */}
          <Label className="text-slate-500">หมายเหตุ</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="หมายเหตุ"
              name="remark"
              value={formData.remark}  
              onChange={handleChange}
              disabled={loading}
            />
            {errors.remark && <p className="text-red-500 text-sm">{errors.remark}</p>}
          </div>

        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <Button variant="outline" onClick={onClose} disabled={loading}><FaArrowRotateLeft />&nbsp;<span className=" text-base">ยกเลิก</span></Button>
          <Button variant="slate_green" onClick={handleSave} disabled={loading}><FaFloppyDisk />&nbsp;<span className=" text-base">บันทึก</span></Button>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
              <h3 className="text-green-700 text-lg font-semibold text-center">
                จองห้องประชุมเรียบร้อยแล้ว
              </h3>
            </div>
          </div>
        )}
        
        {/* Conflict Modal */}
        {showConflict && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-85 flex justify-center items-center">
            <h3 className="text-orange-500 text-lg font-semibold text-center">
              <p className='text-base'>มีการจองห้องประชุมนี้เอาไว้แล้ว</p>
              <p className='text-base'>ไม่สามารถจองห้องประชุมตามช่วงวันที่</p>
              <p className='text-base'>และเวลาที่คุณเลือกได้.. กรุณาเลือกใหม่อีกครั้ง !</p>
            </h3>
          </div>
        </div>
        )}

        {/* Undefine Error Modal */}
        {showUndefined && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
              <h3 className="text-red-700 text-lg font-semibold text-center">
                มีปัญหาที่ระบุได้ยาก !
              </h3>
            </div>
          </div>
        )}

        {/* UnKnown Error Modal */}
        {showUnKnown && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
              <h3 className="text-red-700 text-lg font-semibold text-center">
                มีปัญหาในการเพิ่มข้อมูลการจองห้องประชุม !
              </h3>
            </div>
          </div>
        )}

        {/* Sent Email Error Modal */}
        {showSentEmailError && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
              <h3 className="text-orange-500 text-lg font-semibold text-center">
                <p className='text-base'>มีปัญหาในการส่งอีเมล์ !</p>
                <p className='text-base'>สามารถใช้งานระบบได้ แต่ใช้อีเมล์นี้ไม่ได้ !</p>
              </h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddRoomBookingModal;
