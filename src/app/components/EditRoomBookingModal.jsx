'use client';

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { MultiSelect } from "@/components/multi-select";
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
   } from "react-icons/bs";

  import { CalendarIcon } from "lucide-react"
  import { cn } from "@/lib/utils"
  import { Calendar } from "@/components/ui/calendar"
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"

   import { useSession } from 'next-auth/react'

const EditRoomModal = ({ isOpen, onClose, onSave, roomBooingData }) => {

  const { data: session, status } = useSession()

  const [loading, setLoading] = useState(false);
  const [showConflict, setShowConflict] = useState(false);

  const [roomsData, setRoomsData] = useState([]); // Room data
  const [start_time, setStartTime] = useState({ start_hours: '', start_minutes: '' });
    const [stop_time, setStopTime] = useState({ stop_hours: '', stop_minutes: '' });
    const [isStartTimeValid, setIsStartTimeValid] = useState(true); // To track validity
    const [isStopTimeValid, setIsStopTimeValid] = useState(true); // To track validity

  // Setting start_time when component mounts or roomBooingData changes
  useEffect(() => {
    if (roomBooingData && roomBooingData.start_time) {
      const start_hours = roomBooingData.start_time.substring(0, 2);
      const start_minutes = roomBooingData.start_time.substring(2, 4);

      setStartTime({
        start_hours: start_hours,
        start_minutes: start_minutes,
      });
    } else {
      setStartTime({
        start_hours: '00',
        start_minutes: '00',
      });
    }

    // Setting stop_time when component mounts or roomBooingData changes
    if (roomBooingData && roomBooingData.stop_time) {
      const stop_hours = roomBooingData.stop_time.substring(0, 2);
      const stop_minutes = roomBooingData.stop_time.substring(2, 4);

      setStopTime({
        stop_hours: stop_hours,
        stop_minutes: stop_minutes,
      });
    } else {
      setStopTime({
        stop_hours: '00',
        stop_minutes: '00',
      });
    }
  }, [roomBooingData]); // Re-run when roomBooingData changes

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
        setStartTime(prev => {
          const updatedStartTime = { ...prev };
    
          // Update based on unit
          if (unit === "hours") {
            updatedStartTime.start_hours = value;
          } else if (unit === "minutes") {
            updatedStartTime.start_minutes = value;
          }
    
          // Format start_time to HHmm00, ensure both values are strings before applying padStart
          const startHours = (updatedStartTime.start_hours || '').padStart(2, '0');
          const startMinutes = (updatedStartTime.start_minutes || '').padStart(2, '0');
    
          // Update start_time to the formatted string
          const updatedStartTimeFormatted = `${startHours}${startMinutes}00`;
    
          // Update the form data with the formatted start_time
          setFormData(prevData => ({
            ...prevData,
            start_time: updatedStartTimeFormatted
          }));
    
          return updatedStartTime;
        });
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
        setStopTime(prev => {
          const updatedStopTime = { ...prev };
    
          // Update based on unit
          if (unit === "hours") {
            updatedStopTime.stop_hours = value;
          } else if (unit === "minutes") {
            updatedStopTime.stop_minutes = value;
          }
    
          // Ensure both stop_hours and stop_minutes are strings before applying padStart
          const stopHours = (updatedStopTime.stop_hours || '').padStart(2, '0');
          const stopMinutes = (updatedStopTime.stop_minutes || '').padStart(2, '0');
    
          // Format stop_time to HHmm00
          const updatedStopTimeFormatted = `${stopHours}${stopMinutes}00`;
    
          // Update the form data with the formatted stop_time
          setFormData(prevData => ({
            ...prevData,
            stop_time: updatedStopTimeFormatted
          }));
    
          return updatedStopTime;
        });
      }
    };

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
    
  useEffect(() => {
    if (roomBooingData && isOpen) {
      // Populate the form with existing room data if editing
      setFormData({
        room_id: roomBooingData.room_id || "",
        user_id: roomBooingData.user_id || "",
        booking_date: roomBooingData.booking_date || "",
        topic: roomBooingData.topic || "",
        start_date: roomBooingData.start_date || "",
        stop_date: roomBooingData.stop_date || "",
        start_time: roomBooingData.start_time || "",
        stop_time: roomBooingData.stop_time || "",
        approve_status: roomBooingData.approve_status || "",
        remark: roomBooingData.remark || "",
      });
      // console.log(formData);
    }
  }, [isOpen, roomBooingData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    // console.log(`${name} selected value:`, value);  // Log the selected value
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
      // Assuming you have an API to fetch rooms
      fetch("/api/rooms")
        .then((res) => res.json())
        .then((data) => setRoomsData(data))
        .catch((error) => console.error("Error fetching rooms:", error));
    }, []);

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

      const updatedData = { ...formData };

      try {
        setLoading(true);
       
        const response = await fetch(`/api/bookings/${roomBooingData.booking_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });

        if (response.ok) {
          setStartTime(updatedData.start_time.substring(0, 2), updatedData.start_time.substring(2, 4));
          setStopTime(updatedData.stop_time.substring(0, 2), updatedData.stop_time.substring(2, 4));
          setLoading(false);
          onSave(updatedData);
          onClose();
        //   // Refresh the page after successful update
        //   window.location.reload();
        } else {
          if (response.status === 409) {
            setLoading(false);
            setShowConflict(true);

            setTimeout(() => {
              setShowConflict(false);
            }, 3000);
          } else {
            setLoading(false);
            alert("Error updating room booking.");
          }
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
        alert("An error occurred while updating the room booking.");
      }
    } else {
      setLoading(false);
      console.log("Validation failed");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white px-6 py-3 rounded-lg w-96">
        <div className="container mx-auto px-0 mb-1 flex items-center justify-center">
          <BsBookmarkPlusFill />&nbsp;
          <span className="text-lg font-semibold mb-0">แก้ไขข้อมูลการจองห้องประชุม</span>
        </div>
        {loading && (
          <div className="flex flex-row items-center justify-center container mx-auto">
            <span className="mr-3 text-slate-800 text-base">กำลังอัพเดทข้อมูล</span>
            <SyncLoader color="gold" />
          </div>
        )}
        <div className="space-y-4">
          <Label className="text-slate-700">รหัสการจองห้องประชุม</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="รหัสการจองห้องประชุม"
              name="room_id"
              value={roomBooingData.booking_id}
              disabled
            />
          </div>

          <Label className="text-slate-500">เลือกห้องประชุม</Label>
          <div style={{ marginTop: '5px', marginBottom: '5px' }}>
            <Select 
            value={formData.room_id}
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
            {roomsData.length > 0 && formData.room_id && (
              // Find the room based on formData.room_id
              (() => {
                const selectedRoom = roomsData.find((room) => room.room_id === formData.room_id);
                if (selectedRoom) {
                  return (
                    <>
                      <div className="flex flex-row">
                        <img
                          src={selectedRoom.image_name ? `/images/${selectedRoom.image_name}` : `/images/no_image.gif`}
                          alt={selectedRoom.room_name || 'Room Image'}
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
            )}
          </div>

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

          <Label className="text-slate-500">วันที่เริ่มต้น</Label>
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

            <Label className="text-slate-500">ตั้งแต่เวลา</Label>
            <div className="flex flex-row items-center justify-left">
                <Input
                    type="number"
                    name="start_hours"
                    value={start_time.start_hours}
                    // value={start_time.start_hours !== undefined ? start_time.start_hours : (roomBooingData.start_time ? roomBooingData.start_time.substring(0, 2) : '')}
                    onChange={(e) => handleStartTimeChange(e, 'start', 'hours')}
                    max={23}
                    min={0}
                    placeholder={roomBooingData.start_time ? roomBooingData.start_time.substring(0, 2) : ''}
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
                    // value={start_time.start_minutes !== undefined ? start_time.start_minutes : (roomBooingData.start_time ? roomBooingData.start_time.substring(2, 4) : '')}
                    onChange={(e) => handleStartTimeChange(e, 'start', 'minutes')}
                    max={59}
                    min={0}
                    placeholder={roomBooingData.start_time ? roomBooingData.start_time.substring(2, 4) : ''}
                    className="w-16 h-9 text-center"
                    style={{ borderColor: !isStartTimeValid ? 'red' : '#ddd', marginTop: "-12px", marginBottom: "5px" }}
                />
                {!isStartTimeValid && <div className="text-red-500 text-sm mt-1 ml-2">กรุณากรอกเวลาให้ถูกต้อง !</div>}
                {errors.start_time && <p className="text-red-500 text-sm ml-2">{errors.start_time}</p>}
            </div>

            <Label className="text-slate-500">วันที่สิ้นสุด</Label>
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

            <Label className="text-slate-500">ถึงเวลา</Label>
            <div className="flex flex-row items-center justify-left">
                <Input
                    type="number"
                    name="stop_hours"
                    value={stop_time.stop_hours}
                    onChange={(e) => handleStopTimeChange(e, 'stop', 'hours')}
                    max={23}
                    min={0}
                    placeholder={roomBooingData.stop_time ? roomBooingData.stop_time.substring(0, 2) : ''}
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
                    placeholder={roomBooingData.stop_time ? roomBooingData.stop_time.substring(2, 4) : ''}
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
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <FaArrowRotateLeft />
            &nbsp;<span className=" text-base">ยกเลิก</span>
          </Button>
          <Button variant="slate_green" onClick={handleSave} disabled={loading}>
            <FaFloppyDisk />
            &nbsp;<span className=" text-base">บันทึก</span>
          </Button>
        </div>

        {showConflict && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
              <h3 className="text-red-700 text-lg font-semibold text-center">
                มีการจองห้องประชุมนี้แล้ว !
              </h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditRoomModal;
