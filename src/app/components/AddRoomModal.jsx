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

import { MultiSelect } from "@/components/multi-select";
import { useRouter } from 'next/navigation'

// const frameworksList = [
//   {
//     value: "next.js",
//     label: "Next.js",
//   },
//   {
//     value: "sveltekit",
//     label: "SvelteKit",
//   },
//   {
//     value: "nuxt.js",
//     label: "Nuxt.js",
//   },
//   {
//     value: "remix",
//     label: "Remix",
//   },
//   {
//     value: "astro",
//     label: "Astro",
//   },
// ];

const AddRoomModal = ({ isOpen, onClose, onSave, roomtypes, equipments }) => {

  const router = useRouter()

  const [loading, setLoading] = useState(false);
  const [showConflict, setShowConflict] = useState(false);
  const [showUndefined, setShowUndefined] = useState(false);
  const [showUnKnown, setShowUnKnown] = useState(false);
  const [showSentEmailError, setSentEmailError] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
  

  // Validation function
  const validate = () => {
    let valid = true;
    let newErrors = { ...errors };

    // Validate basic fields
    if (!formData.room_name) {
      newErrors.room_name = "กรุณากรอกชื่อห้องประชุม";
      valid = false;
    } else {
      newErrors.room_name = "";
    }

    // Validate select inputs
    if (!formData.roomtype_id) {
        newErrors.roomtype_id = "กรุณาเลือกประเภทห้อง";
        valid = false;
    } else {
        newErrors.roomtype_id = "";
    }

    // if (formData.equipment_ids.length === 0) {
    //   newErrors.equipment_ids = "กรุณาเลือกอุปกรณ์";
    //   valid = false;
    // } else {
    //   newErrors.equipment_ids = "";
    // }

    if (formData.equipment_id.length === 0) {
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

      // if (!selectedImage) {
      //   alert("Please select an image.");
      //   return;
      // }

      // If user doesn't exist, proceed with saving the data
      const updatedData = { ...formData};
  
      try {
        setLoading(true); // Set loading to true when request starts

        const formData2 = new FormData();
        formData2.append('image', selectedImage);

        // local
        // "/api/upload_local"
        const response2 = await fetch('/api/upload_local', {
          method: 'POST',
          body: formData2,
        });

        if (response2.ok) {
          console.log('Image uploaded successfully');
          // router.push('/authenticated')
          // Force refresh the page
          // router.reload();
        } else {
          console.log('Failed to upload image');
        }

        const response = await fetch('api/rooms', {
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
          }, 3000);
        } else {
          if (response.status ===409) {
            console.log('Conflict'); // dupplicate
            setLoading(false);
            setShowConflict(true);
  
            setTimeout(() => {
              setShowConflict(false);
            }, 3000);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white px-6 py-3 rounded-lg w-96">
        <div className="container mx-auto px-0 mb-1 flex items-center justify-center">
          <BsBuildingFillCheck />&nbsp;
          <span className="text-lg font-semibold mb-0">เพิ่มห้องประชุมใหม่</span>
        </div>
        {loading && (
          <div className="flex flex-row items-center justify-center container mx-auto">
            <span className="mr-3 text-slate-800 text-base">กำลังเพิ่มข้อมูล</span>
            <SyncLoader color="gold" />
          </div>
        )}
        <div className="space-y-4">
          {/* Room Name Input */}
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
            {errors.room_name && <p className="text-red-500 text-sm">{errors.room_name}</p>}
          </div>

        {/* Room Capacity Input */}
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
            {errors.capacity && <p className="text-red-500 text-sm">{errors.capacity}</p>}
          </div>

        {/* Room Location Input */}
        <Label className="text-slate-500">สถานที่</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="ชื่อห้องประชุม"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
          </div>

          {/* Select for roomtype */}
          <Label className="text-slate-500">ประเภทห้อง</Label>
          <div>
            <Select
              value={formData.roomtype_id}
              onValueChange={(value) => handleSelectChange('roomtype_id', value)}
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
            {errors.roomtype_id && <p className="text-red-500 text-sm">{errors.roomtype_id}</p>}
          </div>

          {/* Select for multiple equipment */}
          <Label className="text-slate-500">อุปกรณ์</Label>
          <div>
            <Select
              value={formData.equipment_id}
              onValueChange={(value) => handleSelectChange('equipment_id', value)}
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
            {errors.equipment_id && <p className="text-red-500 text-sm">{errors.equipment_id}</p>}
          </div>

          {/* Image Upload Input */}
          <Label className="text-slate-500">รูปภาพ</Label>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              id="file-input"
              className="hidden /*bg-[#ddd] p-2 rounded-md w-full border-[1px] border-slate-200*/"
            />
            <label
              htmlFor="file-input"
              className="bg-[#dddddd55] -mt-3 p-2 rounded-lg w-full text-center cursor-pointer block border-[1px] border-slate-200"
            >เลือกรูปภาพ</label>
            {formData.image_name && (
              <img src={formData.image_preview} alt="" className="mt-2" style={{ maxWidth: "120px", maxHeight: "120px", objectFit: "cover", borderRadius: "5px", border: "solid 1px #999", boxShadow: "3px 3px 15px gray" }} />
            )}
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
                เพิ่มห้องประชุมใหม่เรียบร้อยแล้ว
              </h3>
            </div>
          </div>
        )}
        
        {/* Conflict Modal */}
        {showConflict && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
              <h3 className="text-red-700 text-lg font-semibold text-center">
                มีห้องประชุมนี้แล้ว !
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
                มีปัญหาในการเพิ่มข้อมูลห้องประชุม !
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

export default AddRoomModal;
