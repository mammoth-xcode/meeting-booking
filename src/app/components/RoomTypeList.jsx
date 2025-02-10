'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import NoImg from '../images/no_image.gif';
import Menu from '../components/Menu';
// import Footer from '../components/Footer';
import EditRoomTypeModal from "../components/EditRoomTypeModal";
import AddRoomTypeModal from "../components/AddRoomTypeModal";
import { FaBook, FaCircleExclamation, FaAddressBook, FaUserPlus, FaUserMinus, FaArrowRotateLeft, FaPencil, FaRegTrashCan, FaCheck, FaElementor, FaHouseUser, FaIdCardClip, FaCube, FaUser, FaCirclePlus  } from "react-icons/fa6";
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
import { UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { SyncLoader } from "react-spinners";

function RoomTypeListPage({ editable }) {
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState("roomtype_name");
  const [showGoTop, setShowGoTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [roomTypeToEdit, setRoomRypeToEdit] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomtypeToDelete, setroomtypeToDelete] = useState(null);

  const [showConflict, setShowConflict] = useState(false);
  const [showUnKnown, setShowUnKnown] = useState(false);

  const { data: session } = useSession();  // This will give you session data

  const router = useRouter()

  // Lock scroll when modal is open
  useEffect(() => {
    if (isModalOpen || isAddModalOpen || isEditModalOpen) {
      document.body.style.overflow = 'hidden'; // Disable scrolling
    } else {
      document.body.style.overflow = ''; // Re-enable scrolling
    }

    return () => {
      document.body.style.overflow = ''; // Reset overflow on unmount
    };
  }, [isModalOpen, isAddModalOpen, isEditModalOpen]);

  // Load roomtype data (GET Request)
  useEffect(() => {
    const loadroomtypesData = async () => {
      try {
        const response = await fetch('/api/room_types');
        const data = await response.json();

        // console.log(data);  // Log to check the structure of the response

        // Ensure the response is an array, else default to empty array
        if (Array.isArray(data)) {
          setRoomTypes(data);
        } else {
          console.error("Expected an array but got:", data);
          setRoomTypes([]);  // Fallback to empty array if not an array
        }

      } catch (error) {
        console.error("Error fetching roomtypes data:", error);
        setRoomTypes([]);  // Handle the error gracefully by resetting to an empty array
      } finally {
        setLoading(false);
      }
    };

    const intervalId = setInterval(() => {
      loadroomtypesData();
    }, 1000 * 1);

    loadroomtypesData();

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // console.log(roomtypes);

  const handleEdit = (roomtype) => {
    setRoomRypeToEdit(roomtype);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setIsAddModalOpen(true); // Open the Add modal
  };

  const handleSave = (updatedroomtypes) => {
    setRoomTypes(updatedroomtypes);
    setIsEditModalOpen(false); // Close Edit modal after save
    setIsAddModalOpen(false); // Close Add modal after save
  };

  const handleDelete = (roomtype) => {
    setroomtypeToDelete(roomtype);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/room_types/${roomtypeToDelete.roomtype_id}`, {
        method: 'DELETE',
      });
  
      // // Log the response status and data for debugging
      // console.log('Response Status:', response.status); // Log the response status
      // console.log('Response OK:', response.ok); // Log if response is ok

      if (response.ok) {
        // Remove deleted roomtype from the list
        setRoomTypes((prevroomtypes) =>
          prevroomtypes.filter((dept) => dept.roomtype_id !== roomtypeToDelete.roomtype_id)
        );
        setIsDeleteModalOpen(false);  // Close the delete confirmation modal
      } if (response.status === 400) {
        console.log('Conflict'); // Cannot delete roomtype because it has associated users
        setLoading(false);
        setShowConflict(true);

        setTimeout(() => {
          setShowConflict(false);
        }, 3000);
      } else {
        // Log unexpected status codes for debugging
        // console.error('Unexpected response status:', response.status);
        if(!response.status === 200) {
          alert("Error deleting roomtype.");
        }
      }
    } catch (error) {
      console.error("Error deleting roomtype:", error.message);
      alert("Failed to delete roomtype.");
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setroomtypeToDelete(null);
  };

  const handleClose = () => {
    setIsEditModalOpen(false); // Close the modal without saving
    setIsAddModalOpen(false); // Close the Add modal without saving
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

  // Create a mapping between searchColumn keys and user-friendly placeholders
  const placeholderMap = {
    roomtype_id: 'รหัสประเภทห้องประชุม',
    roomtype_name: 'ชื่อประเภทห้องประชุม',
  };

  const filteredroomtypes = Array.isArray(roomTypes) 
  ? roomTypes.filter((roomtype) => {
      const searchValue = search.toLowerCase();
      if (searchColumn === "roomtype_id") {
        return roomtype.roomtype_id.toString().toLowerCase().includes(searchValue);
      } else if (searchColumn === "roomtype_name") {
        return roomtype.roomtype_name.toLowerCase().includes(searchValue);
      }
      return true;
  })
  : []; // fallback to an empty array if roomtypes is not an array

  // Get the dynamic placeholder based on searchColumn
  const placeholderText = placeholderMap[searchColumn] || 'ค้นหาประเภทห้องประชุม';

  return (
    <div className='flex flex-col items-start mt-[300px] h-dvh'>
      <Menu />
      <div className="container mx-auto px-2 mb-4 flex items-center justify-start">
        <BsBuildingsFill />&nbsp;
        <b>{`ประเภทห้องประชุม :: ${roomTypes.length} รายการ`}</b>
      </div>

      <div className="container mx-auto mb-4 px-2 space-x-1 flex items-start">
        <Select defaultValue={searchColumn} onValueChange={(value) => setSearchColumn(value)}>
          <SelectTrigger className="w-[185px] text-base">
            <SelectValue placeholder="ชื่อประเภทห้องประชุม" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="text-base">ตัวกรองข้อมูล</SelectLabel>
              <SelectItem className="text-base" value="roomtype_id">รหัสประเภทห้องประชุม</SelectItem>
              <SelectItem className="text-base" value="roomtype_name">ชื่อประเภทห้องประชุม</SelectItem>
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

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 w-full max-w-screen container mx-auto px-2">

        <div className="container mx-auto mb-0 space-x-2 flex items-center justify-end">
          <Button
            variant="outline"
            onClick={handleAdd} // Corrected to handle Add modal
            className="flex items-center justify-center text-base"
          >
            <FaCirclePlus className="mx-0 text-base px-0" />
            <span className="flex items-center justify-center py-0 px-0 pl-1 mt-0.5">เพิ่ม</span>
          </Button>
          {/* <Button
            variant="outline"
            onClick={() => router.push('/equipment')}
            className="flex items-center justify-center text-base"
          >
            <FaCube className="mx-0 text-base px-0" />
            <span className="flex items-center justify-center py-0 px-0 pl-1 mt-0.5">อุปกรณ์</span>
          </Button> */}
          <Button
            variant="outline"
            onClick={() => router.push('/rooms_edit')}
            className="flex items-center justify-center text-base"
          >
            <BsBuildingFill className="mx-0 text-base px-0" />
            <span className="flex items-center justify-center py-0 px-0 pl-1 mt-0.5">ห้องประชุม</span>
          </Button>
        </div>

        <Table>
          {/* <TableCaption>{`ประเภทห้องประชุม :: ${filteredUsers.length} / ${users.length} รายการ`}</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead>ลำดับ</TableHead>
              <TableHead>รหัสประเภทห้องประชุม</TableHead>
              <TableHead>ชื่อประเภทห้องประชุม</TableHead>
              <TableHead>การจัดการข้อมูล</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {filteredroomtypes.map((roomtype, index) => ( /* {(Array.isArray(roomtypes) ? roomtypes : []).map((roomtype, index) => ( */
              <TableRow key={roomtype.roomtype_id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{roomtype.roomtype_id}</TableCell>
                <TableCell>{roomtype.roomtype_name}</TableCell>
                <TableCell>
                  <Button 
                    onClick={() => handleEdit(roomtype)} 
                    variant="slate_blue"
                    className="mr-2 px-3 py-2"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><FaPencil /></TooltipTrigger>
                        <TooltipContent>
                          <p>แก้ไขประเภทห้องประชุม</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Button>
                  <Button 
                    onClick={() => handleDelete(roomtype)} 
                    variant="slate_red" 
                    disabled={loading}
                    className="text-slate-800 px-3 py-2"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><FaRegTrashCan /></TooltipTrigger>
                        <TooltipContent>
                          <p>ลบประเภทห้องประชุม</p>
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

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-[9999]">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="container mx-auto px-0 mb-4 flex items-center justify-start">
              <BsBuildingsFill />&nbsp;
              <b>ลบประเภทห้องประชุมนี้ ?</b>
            </div>
            <p className="mb-4">{roomtypeToDelete?.roomtype_name || 'ไม่พบชื่อประเภทห้องประชุม'}</p>
            {loading && (
              <div className="flex flex-row items-center justify-center container mx-auto z-[9999]">
                <span className="mr-3 text-slate-800 text-base">กำลังลบประเภทห้องประชุม</span>
                <SyncLoader color="gold" />
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={cancelDelete} disabled={loading}><FaArrowRotateLeft />&nbsp;<span className=" text-base">ยกเลิก</span></Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={loading}  className="text-[white]"><FaRegTrashCan />&nbsp;<span className=" text-base">ลบ</span></Button>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Modal */}
      {showConflict && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[99999]">
          <div className="bg-white p-4 rounded-lg w-80 flex justify-center items-center border-[2px] border-red-800 shadow-2xl">
            <h3 className="text-red-700 text-base font-semibold text-center">
              <p>ไม่สามารถลบประเภทห้องประชุมนี้ได้</p>
              <p>เนื่องจาก ถูกใช้งานโดยข้อมูลห้องประชุม !</p>
            </h3>
          </div>
        </div>
      )}

      {/* UnKnown Error Modal */}
      {showUnKnown && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
            <h3 className="text-red-700 text-lg font-semibold text-center">
              มีปัญหาในการจัดการข้อมูลประเภทห้องประชุม !
            </h3>
          </div>
        </div>
      )}

      <EditRoomTypeModal
        isOpen={isEditModalOpen}
        roomtype={roomTypeToEdit}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
      />

      <AddRoomTypeModal
        isOpen={isAddModalOpen} // Corrected here to use AddModal state
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
      />

      <div className="w-dvw">
        {/* <Footer /> */}
      </div>
    </div>
  );
}

export default RoomTypeListPage;
