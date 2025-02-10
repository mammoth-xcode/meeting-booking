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
import { FaBook, FaCircleExclamation, FaAddressBook, FaUserPlus, FaUserPen, FaFloppyDisk, FaArrowRotateLeft, FaPassport } from "react-icons/fa6";
import { BsArrowUpCircleFill, BsKey } from "react-icons/bs";
import { UserRole } from "@prisma/client";
import { SyncLoader } from "react-spinners";
import { DEFAULT_USERS } from "@/app/constants";

  // Assuming `verificationOptions` is an array of possible verification statuses
  const verificationOptions = [
    { value: "VERIFIED", label: "ยืนยันแล้ว" },
    { value: "UNVERIFIED", label: "ยังไม่ยืนยัน" },
  ];
  
const ResetUserPasswordModal = ({ isOpen, user, onClose, onSave, positions, departments, roles, email }) => {
  const { data: session } = useSession();  // This will give you session data

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    email: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    email: "",
  });

  const [showSuccess, setShowSuccess] = useState(false); // To control success modal visibility

  const defaultUserPassword = DEFAULT_USERS.PASSWORD;  // Assuming DEFAULT_USERS.PASSWORD exists

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        password: user.password || defaultUserPassword,
        email: email,
      });
    }
  }, [isOpen, user]);

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

    // // Validate basic fields
    // if (!formData.name) {
    //   newErrors.name = "กรุณากรอกชื่อ";
    //   valid = false;
    // } else {
    //   newErrors.name = "";
    // }

    // if (!formData.lastname) {
    //   newErrors.lastname = "กรุณากรอกนามสกุล";
    //   valid = false;
    // } else {
    //   newErrors.lastname = "";
    // }

    // if (!formData.email) {
    //   newErrors.email = "กรุณากรอกอีเมล์";
    //   valid = false;
    // } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    //   newErrors.email = "กรุณากรอกอีเมล์ให้ถูกต้อง";
    //   valid = false;
    // } else {
    //   newErrors.email = "";
    // }

    // if (!formData.telephone) {
    //   newErrors.telephone = "กรุณากรอกเบอร์โทร";
    //   valid = false;
    // } else if (!/^(0\d{9})$/.test(formData.telephone)) {
    //   newErrors.telephone = "กรุณากรอกเบอร์โทรให้ถูกต้อง";
    //   valid = false;
    // } else {
    //   newErrors.telephone = "";
    // }
    
    // if (!formData.username) {
    //   newErrors.username = "กรุณากรอกชื่อผู้ใช้งาน";
    //   valid = false;
    // } else {
    //   newErrors.username = "";
    // }

    // // Validate select inputs
    // if (!formData.position) {
    //   newErrors.position = "กรุณาเลือกตำแหน่ง";
    //   valid = false;
    // } else {
    //   newErrors.position = "";
    // }

    // if (!formData.department) {
    //   newErrors.department = "กรุณาเลือกฝ่ายงาน";
    //   valid = false;
    // } else {
    //   newErrors.department = "";
    // }

    // if (!formData.role) {
    //   newErrors.role = "กรุณาเลือกสิทธิ์การใช้งาน";
    //   valid = false;
    // } else {
    //   newErrors.role = "";
    // }

    // if (!formData.verification) {
    //   newErrors.verification = "กรุณาเลือกสถานะการใช้งาน";
    //   valid = false;
    // } else {
    //   newErrors.verification = "";
    // }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (validate()) {
        // Ensure that position and department are saved with their IDs
        const updatedData = {
            ...formData,
            email, // Send email as part of the payload

            // // Convert position and department names to their respective IDs
            // position_id: positions.find((pos) => pos.position_id === formData.position)?.position_id || "",
            // department_id: departments.find((dept) => dept.department_id === formData.department)?.department_id || "",
        };

        // // Log updated data for debugging
        // console.log("Updated Data: ", updatedData);

        try {
          setLoading(true); // Set loading to true when request starts

          // Check if user and employee_id are valid
          if (!user || !user.employee_id) {
              alert("User ID is missing");
              return;
          }

          const response = await fetch(`api/reset/${user.employee_id}`, {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedData),  // Send updated data as JSON
          });

          if (response.ok) {
              // Success: invoke the onSave callback
              setLoading(false);
              onSave(updatedData);
              console.log("Save successful! Showing success modal.");
              setShowSuccess(true);  // Show success modal
              
              // Hide success modal after 1 second
              setTimeout(() => setShowSuccess(false), 500);
              // setTimeout(() => {setShowSuccess(false); onClose(); }, 800);
          } else {
              // Error: handle the response failure
              const errorData = await response.json();
              alert(`Error: ${"Save error ! " + errorData.message}`);
          }
        } catch (error) {
          alert("An error occurred while updating the user.");
          console.error(error);
        }
    } else {
        console.log('Validation failed');
    }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <div className="container mx-auto px-0 mb-4 flex items-center justify-start">
          <BsKey className="text-2xl font-semibold mb-1 px-0.5 " />
          <span className="text-lg font-semibold mb-0">รีเซ็ตรหัสผ่าน</span>
        </div>
        <div className="space-y-4">
          <Label className="text-slate-800 text-base">{`ผู้ใช้งาน : ${user.name} ${user.lastname}`}</Label>
        </div>
        {loading && (
          <div className="flex flex-row items-start justify-start container mx-auto">
            <span className="mr-3 text-slate-800 text-base">กำลังรีเซ็ตรหัสผ่าน</span>
            <SyncLoader color="gold" />
          </div>
        )}

        <div className="flex justify-end mt-6 space-x-4">
          <Button variant="outline" onClick={onClose} disabled={loading}><FaArrowRotateLeft />&nbsp;<span className=" text-base">ยกเลิก</span></Button>
          <Button variant="slate_sky" onClick={handleSave} disabled={loading}><FaFloppyDisk />&nbsp;<span className=" text-base">รีเซ็ต</span></Button>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[9999]">
            <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
              <h3 className="text-green-700 text-lg font-semibold text-center">
                รีเซ็ตรหัสผ่านเรียบร้อยแล้ว
              </h3>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResetUserPasswordModal;
