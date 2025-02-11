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
    BsBuildingFill
   } from "react-icons/bs";
import { useRouter } from 'next/navigation'

const EditRoomModal = ({ isOpen, onClose, onSave, roomtypes, equipments, roomData }) => {

  const router = useRouter()

  const [loading, setLoading] = useState(false);
  const [showConflict, setShowConflict] = useState(false);
  const [formData, setFormData] = useState({
    room_name: "",
    capacity: "",
    roomtype_id: "",
    equipment_id: "",
    location: "",
    image_name: "",
    image_preview: "",
  });

  const [errors, setErrors] = useState({
    room_name: "",
    capacity: "",
    roomtype_id: "",
    equipment_id: "",
    location: "",
    image_name: "",
    image_preview: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (roomData && isOpen) {
    // // Log the initial formData when the modal opens
    // console.log("Initial equipment_id:", roomData.equipment.equipment_id);
    // console.log("Initial roomType:", roomData.roomtype.roomtype_id);

      // Populate the form with existing room data if editing
      setFormData({
        room_name: roomData.room_name || "",
        capacity: roomData.capacity || "",
        roomtype_id: roomData.roomtype_id || "",
        equipment_id: roomData.equipment.equipment_id || "",
        location: roomData.location || "",
        image_name: roomData.image_name || "",
        image_preview: roomData.image_preview || "",
      });
    }
  }, [isOpen, roomData]);

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

  // image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
  
      reader.onloadend = () => {
        setFormData((prevData) => ({
          ...prevData,
          image_preview: reader.result,
          image_name: file.name,
        }));
      };
  
      reader.readAsDataURL(file);
      setSelectedImage(file);
    }
  };

  const validate = () => {
    let valid = true;
    let newErrors = { ...errors };

    if (!formData.room_name) {
      newErrors.room_name = "กรุณากรอกชื่อห้องประชุม";
      valid = false;
    } else {
      newErrors.room_name = "";
    }

    if (!formData.roomtype_id) {
      newErrors.roomtype_id = "กรุณาเลือกประเภทห้อง";
      valid = false;
    } else {
      newErrors.roomtype_id = "";
    }

    if (!formData.equipment_id) {
      newErrors.equipment_id = "กรุณาเลือกอุปกรณ์";
      valid = false;
    } else {
      newErrors.equipment_id = "";
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (validate()) {

      const updatedData = { ...formData };

      try {
        setLoading(true);

        if (selectedImage){
            const formData2 = new FormData();
            formData2.append("image", selectedImage);
    
            // local
            // "/api/upload_local"
            const response2 = await fetch("/api/upload", {
              method: "POST",
              body: formData2,
            });
    
            if (response2.ok) {
              console.log("Image uploaded successfully");
              // router.push('/authenticated')
              // Force refresh the page
              // router.reload();
            } else {
              console.log("Failed to upload image");
            }
        }
        
        const response = await fetch(`/api/rooms/${roomData.room_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });

        if (response.ok) {
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
            alert("Error updating room.");
          }
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
        alert("An error occurred while updating the room.");
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
          <BsBuildingFillCheck />&nbsp;
          <span className="text-lg font-semibold mb-0">แก้ไขข้อมูลห้องประชุม</span>
        </div>
        {loading && (
          <div className="flex flex-row items-center justify-center container mx-auto">
            <span className="mr-3 text-slate-800 text-base">กำลังอัพเดทข้อมูล</span>
            <SyncLoader color="gold" />
          </div>
        )}
        <div className="space-y-4">
          <Label className="text-slate-700">รหัสห้องประชุม</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="รหัสห้องประชุม"
              name="room_id"
              value={roomData.room_id}
              disabled
            />
          </div>

          <Label className="text-slate-500">ชื่อห้องประชุม</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="ชื่อห้องประชุม"
              name="room_name"
              value={formData.room_name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          {errors.room_name && <p className="text-red-500 text-sm">{errors.room_name}</p>}

          <Label className="text-slate-500">ความจุ</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="ความจุ"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          {errors.capacity && <p className="text-red-500 text-sm">{errors.capacity}</p>}

          <Label className="text-slate-500">สถานที่</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="สถานที่"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}

          <Label className="text-slate-500">ประเภทห้อง</Label>
          <div>
            <Select
              className="-mt-3 mb-1"
              value={formData.roomtype_id}
              onValueChange={(value) => handleSelectChange("roomtype_id", value)}
              disabled={loading}
            >
              <SelectTrigger className="-mt-3 mb-1">
                <SelectValue placeholder="ประเภทห้อง" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>เลือกประเภทห้อง</SelectLabel>
                  {roomtypes.map((roomtype) => (
                    <SelectItem key={roomtype.roomtype_id} value={roomtype.roomtype_id}>
                      {roomtype.roomtype_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {errors.roomtype_id && <p className="text-red-500 text-sm">{errors.roomtype_id}</p>}

          <Label className="text-slate-500">อุปกรณ์</Label>
          <div>
            <Select
              className="-mt-3 mb-1"
              value={formData.equipment_id}
              onValueChange={(value) => handleSelectChange("equipment_id", value)}
              disabled={loading}
            >
              <SelectTrigger className="-mt-3 mb-1">
                <SelectValue placeholder="อุปกรณ์" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>อุปกรณ์</SelectLabel>
                  {equipments.map((equipment) => (
                    <SelectItem key={equipment.equipment_id} value={equipment.equipment_id}>
                      {equipment.equipment_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {errors.equipment_id && <p className="text-red-500 text-sm">{errors.equipment_id}</p>}

          <Label className="text-slate-500">รูปภาพ</Label>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="bg-[#dddddd55] -mt-3 p-2 rounded-lg w-full text-center cursor-pointer block border-[1px] border-slate-200"
            >
              เลือกรูปภาพ
            </label>
            {(formData.image_preview || formData.image_name) && (
              <img
                src={formData.image_preview || `/images/${formData.image_name}`}
                alt=""
                className="mt-2"
                style={{ maxWidth: "120px", maxHeight: "120px", objectFit: "cover", borderRadius: "5px", border: "solid 1px #999", boxShadow: "3px 3px 15px gray" }}
              />
            )}
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
                มีห้องประชุมนี้แล้ว !
              </h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditRoomModal;
