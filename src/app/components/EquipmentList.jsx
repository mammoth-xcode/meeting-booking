'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import NoImg from '../images/no_image.gif';
import Menu from '../components/Menu';
// import Footer from '../components/Footer';
import EditEquipmentModal from "../components/EditEquipmentModal";
import AddEquipmentModal from "../components/AddEquipmentModal";
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

function EquipmentListPage({ editable }) {
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState("equipment_name");
  const [showGoTop, setShowGoTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [equipmentToEdit, setequipmentToEdit] = useState(null);
  const [equipments, setequipments] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [equipmentToDelete, setequipmentToDelete] = useState(null);

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

  // Load equipment data (GET Request)
  useEffect(() => {
    const loadequipmentsData = async () => {
      try {
        const response = await fetch('/api/equipments');
        const data = await response.json();

        // console.log(data);  // Log to check the structure of the response

        // Ensure the response is an array, else default to empty array
        if (Array.isArray(data)) {
          setequipments(data);
        } else {
          console.error("Expected an array but got:", data);
          setequipments([]);  // Fallback to empty array if not an array
        }

      } catch (error) {
        console.error("Error fetching equipments data:", error);
        setequipments([]);  // Handle the error gracefully by resetting to an empty array
      } finally {
        setLoading(false);
      }
    };

    const intervalId = setInterval(() => {
      loadequipmentsData();
    }, 1000 * 1);

    loadequipmentsData();

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // console.log(equipments);

  const handleEdit = (equipment) => {
    setequipmentToEdit(equipment);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setIsAddModalOpen(true); // Open the Add modal
  };

  const handleSave = (updatedequipments) => {
    setequipments(updatedequipments);
    setIsEditModalOpen(false); // Close Edit modal after save
    setIsAddModalOpen(false); // Close Add modal after save
  };

  const handleDelete = (equipment) => {
    setequipmentToDelete(equipment);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/equipments/${equipmentToDelete.equipment_id}`, {
        method: 'DELETE',
      });
  
      // // Log the response status and data for debugging
      // console.log('Response Status:', response.status); // Log the response status
      // console.log('Response OK:', response.ok); // Log if response is ok

      if (response.ok) {
        // Remove deleted equipment from the list
        setequipments((prevequipments) =>
          prevequipments.filter((dept) => dept.equipment_id !== equipmentToDelete.equipment_id)
        );
        setIsDeleteModalOpen(false);  // Close the delete confirmation modal
      } if (response.status === 400) {
        console.log('Conflict'); // Cannot delete equipment because it has associated users
        setLoading(false);
        setShowConflict(true);

        setTimeout(() => {
          setShowConflict(false);
        }, 3000);
      } else {
        // Log unexpected status codes for debugging
        // console.error('Unexpected response status:', response.status);
        if(!response.status === 200) {
          alert("Error deleting equipment.");
        }
      }
    } catch (error) {
      console.error("Error deleting equipment:", error.message);
      alert("Failed to delete equipment.");
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setequipmentToDelete(null);
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
    equipment_id: 'รหัสอุปกรณ์',
    equipment_name: 'ชื่ออุปกรณ์',
  };

  const filteredequipments = Array.isArray(equipments) 
  ? equipments.filter((equipment) => {
      const searchValue = search.toLowerCase();
      if (searchColumn === "equipment_id") {
        return equipment.equipment_id.toString().toLowerCase().includes(searchValue);
      } else if (searchColumn === "equipment_name") {
        return equipment.equipment_name.toLowerCase().includes(searchValue);
      }
      return true;
  })
  : []; // fallback to an empty array if equipments is not an array

  // Get the dynamic placeholder based on searchColumn
  const placeholderText = placeholderMap[searchColumn] || 'ค้นหาอุปกรณ์';

  return (
    <div className='flex flex-col items-start mt-[300px] h-dvh'>
      <Menu />
      <div className="container mx-auto px-2 mb-4 flex items-center justify-start">
        <FaCube />&nbsp;
        <b>{`อุปกรณ์ :: ${equipments.length} รายการ`}</b>
      </div>

      <div className="container mx-auto mb-4 px-2 space-x-1 flex items-start">
        <Select defaultValue={searchColumn} onValueChange={(value) => setSearchColumn(value)}>
          <SelectTrigger className="w-[130px] text-base">
            <SelectValue placeholder="ชื่ออุปกรณ์" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="text-base">ตัวกรองข้อมูล</SelectLabel>
              <SelectItem className="text-base" value="equipment_id">รหัสอุปกรณ์</SelectItem>
              <SelectItem className="text-base" value="equipment_name">ชื่ออุปกรณ์</SelectItem>
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
            onClick={() => router.push('/room_types')} // Open modal or navigate to '/room_types'
            className="flex items-center justify-center text-base"
          >
            <BsBuildingsFill className="mx-0 text-base px-0" />
            <span className="flex items-center justify-center py-0 px-0 pl-1 mt-0.5">ประเภทห้อง</span>
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
          {/* <TableCaption>{`อุปกรณ์ :: ${filteredUsers.length} / ${users.length} รายการ`}</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead>ลำดับ</TableHead>
              <TableHead>รหัสอุปกรณ์</TableHead>
              <TableHead>ชื่ออุปกรณ์</TableHead>
              <TableHead>การจัดการข้อมูล</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {filteredequipments.map((equipment, index) => ( /* {(Array.isArray(equipments) ? equipments : []).map((equipment, index) => ( */
              <TableRow key={equipment.equipment_id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{equipment.equipment_id}</TableCell>
                <TableCell>{equipment.equipment_name}</TableCell>
                <TableCell>
                  <Button 
                    onClick={() => handleEdit(equipment)} 
                    variant="slate_blue"
                    className="mr-2 px-3 py-2"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><FaPencil /></TooltipTrigger>
                        <TooltipContent>
                          <p>แก้ไขอุปกรณ์</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Button>
                  <Button 
                    onClick={() => handleDelete(equipment)} 
                    variant="slate_red" 
                    disabled={loading}
                    className="text-slate-800 px-3 py-2"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><FaRegTrashCan /></TooltipTrigger>
                        <TooltipContent>
                          <p>ลบอุปกรณ์</p>
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
              <FaCube />&nbsp;
              <b>ลบอุปกรณ์นี้ ?</b>
            </div>
            <p className="mb-4">{equipmentToDelete?.equipment_name || 'ไม่พบชื่ออุปกรณ์'}</p>
            {loading && (
              <div className="flex flex-row items-center justify-center container mx-auto z-[9999]">
                <span className="mr-3 text-slate-800 text-base">กำลังลบอุปกรณ์</span>
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
              <p>ไม่สามารถลบอุปกรณ์นี้ได้</p>
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
              มีปัญหาในการจัดการข้อมูลอุปกรณ์ !
            </h3>
          </div>
        </div>
      )}

      <EditEquipmentModal
        isOpen={isEditModalOpen}
        equipment={equipmentToEdit}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
      />

      <AddEquipmentModal
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

export default EquipmentListPage;
