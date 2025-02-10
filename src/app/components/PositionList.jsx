'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import NoImg from '../images/no_image.gif';
import Menu from '../components/Menu';
// import Footer from '../components/Footer';
import EditPositionModal from "../components/EditPositionModal";
import AddPositionModal from "../components/AddPositionModal";
import { FaBook, FaCircleExclamation, FaAddressBook, FaUserPlus, FaUserMinus, FaArrowRotateLeft, FaPencil, FaRegTrashCan, FaCheck, FaElementor, FaHouseUser, FaIdCardClip, FaCube, FaUser, FaPlus, FaCirclePlus  } from "react-icons/fa6";
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

function PositionListPage({ editable }) {
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState("position_name");
  const [showGoTop, setShowGoTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [positionToEdit, setPositionToEdit] = useState(null);
  const [positions, setPositions] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState(null);

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

  // Load Position data (GET Request)
  useEffect(() => {
    const loadPositionsData = async () => {
      try {
        const response = await fetch('/api/positions');
        const data = await response.json();

        // console.log(data);  // Log to check the structure of the response

        // Ensure the response is an array, else default to empty array
        if (Array.isArray(data)) {
          setPositions(data);
        } else {
          console.error("Expected an array but got:", data);
          setPositions([]);  // Fallback to empty array if not an array
        }

      } catch (error) {
        console.error("Error fetching positions data:", error);
        setPositions([]);  // Handle the error gracefully by resetting to an empty array
      } finally {
        setLoading(false);
      }
    };

    const intervalId = setInterval(() => {
      loadPositionsData();
    }, 1000 * 1);

    loadPositionsData();

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // console.log(positions);

  const handleEdit = (position) => {
    setPositionToEdit(position);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    setIsAddModalOpen(true); // Open the Add modal
  };

  const handleSave = (updatedPositions) => {
    setPositions(updatedPositions);
    setIsEditModalOpen(false); // Close Edit modal after save
    setIsAddModalOpen(false); // Close Add modal after save
  };

  const handleDelete = (position) => {
    setPositionToDelete(position);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/positions/${positionToDelete.position_id}`, {
        method: 'DELETE',
      });
  
      // // Log the response status and data for debugging
      // console.log('Response Status:', response.status); // Log the response status
      // console.log('Response OK:', response.ok); // Log if response is ok

      if (response.ok) {
        // Remove deleted Position from the list
        setPositions((prevPositions) =>
          prevPositions.filter((dept) => dept.position_id !== positionToDelete.position_id)
        );
        setIsDeleteModalOpen(false);  // Close the delete confirmation modal
      } if (response.status === 400) {
        console.log('Conflict'); // Cannot delete Position because it has associated users
        setLoading(false);
        setShowConflict(true);

        setTimeout(() => {
          setShowConflict(false);
        }, 3000);
      } else {
        // Log unexpected status codes for debugging
        // console.error('Unexpected response status:', response.status);
        if(!response.status === 200) {
          alert("Error deleting Position.");
        }
      }
    } catch (error) {
      console.error("Error deleting Position:", error.message);
      alert("Failed to delete Position.");
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setPositionToDelete(null);
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
    position_id: 'รหัสตำแหน่ง',
    position_name: 'ชื่อตำแหน่ง',
  };

  const filteredPositions = Array.isArray(positions) 
  ? positions.filter((position) => {
      const searchValue = search.toLowerCase();
      if (searchColumn === "position_id") {
        return position.position_id.toString().toLowerCase().includes(searchValue);
      } else if (searchColumn === "position_name") {
        return position.position_name.toLowerCase().includes(searchValue);
      }
      return true;
  })
  : []; // fallback to an empty array if Position is not an array

  // Get the dynamic placeholder based on searchColumn
  const placeholderText = placeholderMap[searchColumn] || 'ค้นหาตำแหน่ง';

  return (
    <div className='flex flex-col items-start mt-[300px] h-dvh'>
      <Menu />
      <div className="container mx-auto px-2 mb-4 flex items-center justify-start">
        <FaIdCardClip />&nbsp;
        <b>{`ตำแหน่ง :: ${positions.length} รายการ`}</b>
      </div>

      <div className="container mx-auto mb-4 px-2 space-x-1 flex items-start">
        <Select defaultValue={searchColumn} onValueChange={(value) => setSearchColumn(value)}>
          <SelectTrigger className="w-[130px] text-base">
            <SelectValue placeholder="ชื่อตำแหน่ง" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="text-base">ตัวกรองข้อมูล</SelectLabel>
              <SelectItem className="text-base" value="position_id">รหัสตำแหน่ง</SelectItem>
              <SelectItem className="text-base" value="position_name">ชื่อตำแหน่ง</SelectItem>
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
          <Button
            variant="outline"
            onClick={() => router.push('/users')}
            className="flex items-center justify-center text-base"
          >
            <FaUser className="mx-0 text-base px-0" />
            <span className="flex items-center justify-center py-0 px-0 pl-1 mt-0.5">ผู้ใช้งาน</span>
          </Button>
        </div>

        <Table>
          {/* <TableCaption>{`ผู้ใช้งาน :: ${filteredUsers.length} / ${users.length} รายการ`}</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead>ลำดับ</TableHead>
              <TableHead>รหัสตำแหน่ง</TableHead>
              <TableHead>ชื่อตำแหน่ง</TableHead>
              <TableHead>การจัดการข้อมูล</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {filteredPositions.map((position, index) => ( /* {(Array.isArray(positions) ? positions : []).map((position, index) => ( */
              <TableRow key={position.position_id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{position.position_id}</TableCell>
                <TableCell>{position.position_name}</TableCell>
                <TableCell>
                  <Button 
                    onClick={() => handleEdit(position)} 
                    variant="slate_blue"
                    className="mr-2 px-3 py-2"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><FaPencil /></TooltipTrigger>
                        <TooltipContent>
                          <p>แก้ไขตำแหน่ง</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Button>
                  <Button 
                    onClick={() => handleDelete(position)} 
                    variant="slate_red" 
                    disabled={loading}
                    className="text-slate-800 px-3 py-2"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><FaRegTrashCan /></TooltipTrigger>
                        <TooltipContent>
                          <p>ลบตำแหน่ง</p>
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
              <FaAddressBook />&nbsp;
              <b>ลบตำแหน่งนี้ ?</b>
            </div>
            <p className="mb-4">{positionToDelete?.position_name || 'ไม่พบชื่อตำแหน่ง'}</p>
            {loading && (
              <div className="flex flex-row items-center justify-center container mx-auto z-[9999]">
                <span className="mr-3 text-slate-800 text-base">กำลังลบตำแหน่ง</span>
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
              <p>ไม่สามารถลบตำแหน่งนี้ได้</p>
              <p>เนื่องจาก ถูกใช้งานโดยข้อมูลผู้ใช้งาน !</p>
            </h3>
          </div>
        </div>
      )}

      {/* UnKnown Error Modal */}
      {showUnKnown && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
            <h3 className="text-red-700 text-lg font-semibold text-center">
              มีปัญหาในการจัดการข้อมูลตำแหน่ง !
            </h3>
          </div>
        </div>
      )}

      <EditPositionModal
        isOpen={isEditModalOpen}
        position={positionToEdit}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
      />

      <AddPositionModal
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

export default PositionListPage;
