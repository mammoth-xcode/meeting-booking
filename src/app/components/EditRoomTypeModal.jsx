'use client'

import { useSession } from "next-auth/react";
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
import { FaBook, FaCircleExclamation, FaAddressBook, FaUserPlus, FaUserPen, FaFloppyDisk, FaArrowRotateLeft, FaIdCardClip, FaHouseUser, FaCube } from "react-icons/fa6";
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
import { UserRole } from "@prisma/client";
import { SyncLoader } from "react-spinners";

  
const EditRoomTypeModal = ({ isOpen, roomtype, onClose, onSave }) => {
  const { data: session } = useSession();  // This will give you session data

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    roomtype_id: "",
    roomtype_name: "",
  });

  const [errors, setErrors] = useState({
    roomtype_id: "",
    roomtype_name: "",
  });

  const [showSuccess, setShowSuccess] = useState(false); // To control success modal visibility
  const [showConflict, setShowConflict] = useState(false);
  const [showUndefined, setShowUndefined] = useState(false);
  const [showUnKnown, setShowUnKnown] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (isOpen && roomtype) {
      setFormData({
        roomtype_id: roomtype.roomtype_id || "",
        roomtype_name: roomtype.roomtype_name || "",
      });
    }
  }, [isOpen, roomtype]);

  // Close modal when Escape key is pressed----------------------------------------------------
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape") {
        onClose(); // Close the modal when "Escape" is pressed
      }
    };

    // Add the event listener when modal is open
    if (isOpen) {
      window.addEventListener("keydown", handleEscapeKey);
    } else {
      window.removeEventListener("keydown", handleEscapeKey);
    }

    // Cleanup event listener on component unmount or modal close
    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);
  //End Escape--------------------------------------------------------------------------------

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

  // Validation function
  const validate = () => {
    let valid = true;
    let newErrors = { ...errors };

    // Validate basic fields
    if (!formData.roomtype_name) {
      newErrors.roomtype_name = "กรุณากรอกชื่อประเภทห้องประชุม";
      valid = false;
    } else {
      newErrors.roomtype_name = "";
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (validate()) {
        // Ensure that roomtype are saved with their IDs
        const updatedData = {
            ...formData,
        };

        // // Log updated data for debugging
        // console.log("Updated Data: ", updatedData);

        try {
          setLoading(true); // Set loading to true when request starts

          // Check if user and roomtype_id are valid
          if (!roomtype || !roomtype.roomtype_id) {
              alert("roomtype ID is missing");
              return;
          }
          
          const response = await fetch(`api/room_types/${roomtype.roomtype_id}`, {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedData),  // Send updated data as JSON
          });

          if (response.ok) {
            // Success: invoke the onSave callback
            setLoading(false);  // Set loading to false when request is successful
            onSave(updatedData);
            console.log("Save successful! Showing success modal.");
            setShowSuccess(true);  // Show success modal
            
            // Hide success modal after 1 second
            setTimeout(() => setShowSuccess(false), 800);
            // setTimeout(() => {setShowSuccess(false); onClose(); }, 800);
          } if (response.status === 409) {
            console.log('Conflict'); // dupplicate
            setLoading(false);
            setShowConflict(true);
  
            setTimeout(() => {
              setShowConflict(false);
            }, 2000);
          } if (response.status === 400) {
            console.log('Conflict'); // dupplicate
            setLoading(false);
            setShowConflict(true);
  
            setTimeout(() => {
              setShowConflict(false);
            }, 2000);
          } else {
            if (response.status === 409) {
              console.log('Conflict'); // dupplicate
              setLoading(false);
              setShowConflict(true);
    
              setTimeout(() => {
                setShowConflict(false);
              }, 2000);
            } if (response.status === 400) {
              console.log('Conflict'); // dupplicate
              setLoading(false);
              setShowConflict(true);
    
              setTimeout(() => {
                setShowConflict(false);
              }, 2000);
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
  
          if (error.status === 409) {
            console.log('Conflict'); // dupplicate
            setLoading(false);
            setShowConflict(true);
  
            setTimeout(() => {
              setShowConflict(false);
            }, 2000);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white  px-6 py-4  rounded-lg w-96">
        <div className="container mx-auto px-0 mb-1 flex items-center justify-center">
          <BsBuildingsFill className="text-2xl font-semibold mb-1 px-0.5 " />
          <span className="text-lg font-semibold mb-0">แก้ไขข้อมูลประเภทห้องประชุม</span>
        </div>
        <div className="space-y-4">
          {/* roomtype ID Input */}
          <Label className="text-slate-700">รหัสประเภทห้องประชุม</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="รหัสประเภทห้องประชุม"
              name="roomtype_id"
              value={formData.roomtype_id}
              onChange={handleChange}
              disabled //={loading}
            />
            {errors.roomtype_id && <p className="text-red-500 text-sm">{errors.roomtype_id}</p>}
          </div>

          {/* roomtype name Input */}
          <Label className="text-slate-700">ชื่อประเภทห้องประชุม</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="ชื่อประเภทห้องประชุม"
              name="roomtype_name"
              value={formData.roomtype_name}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.roomtype_name && <p className="text-red-500 text-sm">{errors.roomtype_name}</p>}
          </div>
          
        </div>
        {loading && (
          <div className="flex flex-row items-center justify-center container mx-auto">
            <span className="mr-3 text-slate-800 text-base">กำลังแก้ไขข้อมูล</span>
            <SyncLoader color="gold" />
          </div>
        )}

        <div className="flex justify-end mt-6 space-x-4">
          <Button variant="outline" onClick={onClose} disabled={loading}><FaArrowRotateLeft />&nbsp;<span className=" text-base">ยกเลิก</span></Button>
          <Button variant="slate_green" onClick={handleSave} disabled={loading}><FaFloppyDisk />&nbsp;<span className=" text-base">บันทึก</span></Button>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[9999]">
            <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
              <h3 className="text-green-700 text-lg font-semibold text-center">
                แก้ไขข้อมูลประเภทห้องประชุมเรียบร้อยแล้ว
              </h3>
            </div>
          </div>
        )}

        {/* Conflict Modal */}
        {showConflict && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
              <h3 className="text-red-700 text-lg font-semibold text-center">
                มีประเภทห้องประชุมนี้แล้ว !
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
              มีประเภทห้องประชุมนี้แล้ว !
              </h3>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EditRoomTypeModal;
