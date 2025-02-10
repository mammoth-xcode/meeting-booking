'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import NoImg from '../images/no_image.gif';
import Menu from '../components/Menu';
// import Footer from '../components/Footer';
import EditRoomModal from "../components/EditRoomModal";
import AddRoomModal from "../components/AddRoomModal";
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
    BsBuildingFill
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

// Confirmation Modal Component for Deleting Room
const ConfirmationModal = ({ isOpen, onConfirm, onCancel, roomName }) => {
  if (!isOpen) return null;

  const displayRoomName = roomName || 'ไม่พบชื่อห้องประชุม';

  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-96">
        <div className="container mx-auto px-0 mb-4 flex items-center justify-start">
          <BsBuildingFillCheck />&nbsp;
          <b>ลบห้องประชุมนี้ ?</b>
        </div>
        <p className="mb-4">{displayRoomName}</p>
        {loading && (
          <div className="flex flex-row items-center justify-center container mx-auto z-[9999]">
            <span className="mr-3 text-slate-800 text-base">กำลังลบห้องประชุม</span>
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

function RoomEditPage({ editable }) {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState("room_name");
  const [showGoTop, setShowGoTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [roomToEdit, setRoomToEdit] = useState(null);
  const [roomtypes, setRoomTypes] = useState([]);
  const [equipments, setEquipments] = useState([]);

  const { data: session } = useSession();  // This will give you session data

  const router = useRouter()
  
  useEffect(() => {
    const loadRoomTypeData = async () => {
      setLoading(true);
      try {
        const responseRoomType = await fetch('/api/room_types');
        const dataRoomType = await responseRoomType.json();
        setRoomTypes(dataRoomType);
      } catch (error) {
        console.error("Error fetching RoomTypes data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    const intervalId = setInterval(() => {
      loadRoomTypeData();
    }, 1000 * 10);
  
    loadRoomTypeData();
  
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const loadEquipmentData = async () => {
      setLoading(true);
      try {
        const responseEquipment = await fetch('/api/equipments');
        const dataEquipment = await responseEquipment.json();
        setEquipments(dataEquipment);
      } catch (error) {
        console.error("Error fetching Equipment data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    const intervalId = setInterval(() => {
      loadEquipmentData();
    }, 1000 * 10);
  
    loadEquipmentData();
  
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

  // Load Room data (GET Request)
  useEffect(() => {
    const loadRoomsData = async () => {
      try {
        const response = await fetch('/api/rooms');
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error("Error fetching rooms data:", error);
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
  }, []);

  // console.log(rooms);

  const handleEdit = (room) => {
    setRoomToEdit(room);
    setIsEditModalOpen(true);
  };

  const handleSave = (updatedRoom) => {
    const updatedRooms = rooms.map((room) =>
      room.room_id === updatedRoom.room_id ? updatedRoom : room
    );
    setRooms(updatedRooms);
    setIsEditModalOpen(false);
  };
  
   const handleClose = () => {
    setIsEditModalOpen(false); // Close the modal without saving
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
  
  const handleDelete = (room) => {
    setRoomToDelete(room);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true); // Set loading to true when request starts

      const response = await fetch(`/api/rooms`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: roomToDelete.room_id,
          room_name: roomToDelete.room_name,
        }),
      });
      if (response.ok) {
        setLoading(false); // Set loading to false after successful request
        setRooms(rooms.filter(room => room.room_id !== roomToDelete.room_id));
        setIsModalOpen(false);
        setRoomToDelete(null);
      } else {
        setLoading(false); // Ensure loading is set back to false on failure
        console.error("Failed to delete room");
      }
    } catch (error) {
      setLoading(false); // Ensure loading is set back to false on error
      console.error("Error deleting room:", error);
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setRoomToDelete(null);
  };

  const filteredRooms = rooms.filter((room) => {
    if (searchColumn === "roomType.roomtype_name") {
        return room.roomType?.roomtype_name.toLowerCase().includes(search.toLowerCase());
    }
    if (searchColumn === "equipment.equipment_name") {
    return room.equipment?.equipment_name.toLowerCase().includes(search.toLowerCase());
    }
    return room[searchColumn]?.toString().toLowerCase().includes(search.toLowerCase());
  });


  // Create a mapping between searchColumn keys and user-friendly placeholders
  const placeholderMap = {
    room_id: 'รหัสห้อง',
    room_name: 'ชื่อห้อง',
    roomtype_id: 'ประเภทห้อง',
    capacity: 'ความจุ',
    equipment_id: 'อุปกรณ์',
    location: 'สถานที่',
  };

  // Formatting function for capacity with commas
  const formatCapacity = (capacity) => {
    if (capacity) {
      return new Intl.NumberFormat().format(capacity);
    }
    return capacity;
  };

  // Get the dynamic placeholder based on searchColumn
  const placeholderText = placeholderMap[searchColumn] || 'ค้นหาห้องประชุม';

  return (
    <div className='flex flex-col items-start mt-[300px] h-dvh'>
      <Menu />
      <div className="container mx-auto px-2 mb-4 flex items-center justify-start">
        <BsBuildingFillCheck />&nbsp;
        <b>{`ห้องประชุม :: ${rooms.length} รายการ`}</b>
      </div>

      <div className="container mx-auto mb-4 px-2 space-x-1 flex items-start">
        <Select defaultValue={searchColumn} onValueChange={(value) => setSearchColumn(value)}>
          <SelectTrigger className="w-[150px] text-base">
            <SelectValue placeholder="ชื่อห้องประชุม" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="text-base">ตัวกรองข้อมูล</SelectLabel>
              <SelectItem className="text-base" value="room_id">รหัสห้อง</SelectItem>
              <SelectItem className="text-base" value="room_name">ชื่อห้อง</SelectItem>
              <SelectItem className="text-base" value="roomtype_id">ประเภทห้อง</SelectItem>
              <SelectItem className="text-base" value="capacity">ความจุ</SelectItem>
              {/* <SelectItem className="text-base" value="equipment_id">อุปกรณ์</SelectItem> */}
              <SelectItem className="text-base" value="location">สถานที่</SelectItem>
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
          <Button
            variant="outline"
            onClick={() => router.push('/room_types')} // Open modal or navigate to '/room_types'
            className="flex items-center justify-center text-base"
          >
            <BsBuildingsFill className="mx-0 text-base px-0" />
            <span className="flex items-center justify-center py-0 px-0 pl-1 mt-0.5">ประเภทห้อง</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/equipment')}
            className="flex items-center justify-center text-base"
          >
            <FaCube className="mx-0 text-base px-0" />
            <span className="flex items-center justify-center py-0 px-0 pl-1 mt-0.5">อุปกรณ์</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsAddModalOpen(true)}  // Open modal
            className="flex items-center justify-center text-base"
          >
            <FaCirclePlus className="mx-0 text-base px-0" />
            <span className="flex items-center justify-center py-0 px-0 pl-1 mt-0.5">ห้องประชุม</span>
          </Button>
        </div>

        <Table>
          {/* <TableCaption>{`ห้องประชุม :: ${filteredRooms.length} / ${rooms.length} รายการ`}</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead>ลำดับ</TableHead>
              <TableHead>รหัสห้อง</TableHead>
              <TableHead>ชื่อห้อง</TableHead>
              <TableHead>ประเภทห้อง</TableHead>
              <TableHead>ความจุ</TableHead>
              <TableHead>อุปกรณ์</TableHead>
              <TableHead>สถานที่</TableHead>
              <TableHead>รูปภาพ</TableHead>
              <TableHead>การจัดการข้อมูล</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRooms.map((room, index) => (
              <TableRow key={room.room_id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{room.room_id}</TableCell>
                <TableCell>{room.room_name}</TableCell>
                <TableCell>{room.roomType.roomtype_name}</TableCell>
                <TableCell>{formatCapacity(room.capacity)}</TableCell>
                <TableCell>{room.equipment.equipment_name}</TableCell>
                <TableCell>{room.location}</TableCell>
                <TableCell>
                  {room.image_name ? (
                    <img src={`/images/${room.image_name}`} alt='' style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', borderRadius: '5px', border: 'solid 1px #ddd'  }} />
                  ) : (
                    <img src={`/images/no_image.gif`} alt='' style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', borderRadius: '5px', border: 'solid 1px #ddd' }} />
                  )}
                </TableCell>

                <TableCell>
                    <Button 
                        onClick={() => handleEdit(room)} 
                        variant="slate_blue"
                        className="mr-2 px-3 py-2"
                    >
                        <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger><FaPencil /></TooltipTrigger>
                            <TooltipContent>
                            <p>แก้ไขห้องประชุม</p>
                            </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                    </Button>
                    <Button 
                        onClick={() => handleDelete(room)} 
                        variant="slate_red" 
                        disabled={loading}
                        className="text-slate-800 px-3 py-2"
                    >
                        <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger><FaRegTrashCan /></TooltipTrigger>
                            <TooltipContent>
                            <p>ลบห้องประชุม</p>
                            </TooltipContent>
                        </Tooltip>
                        </TooltipProvider>
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
        roomName={roomToDelete?.room_name}
      />

      <EditRoomModal
        isOpen={isEditModalOpen}
        // room={roomToEdit}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
        roomtypes={roomtypes}
        equipments={equipments}
        roomData={roomToEdit}
      />

      <AddRoomModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
        roomtypes={roomtypes}
        equipments={equipments}
      />

      <div className="w-dvw">
        {/* <Footer /> */}
      </div>
    </div>
  );
}

export default RoomEditPage;
