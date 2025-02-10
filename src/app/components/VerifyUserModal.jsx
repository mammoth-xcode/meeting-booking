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
import { FaBook, FaCircleExclamation, FaAddressBook, FaUserPlus, FaUserPen, FaFloppyDisk, FaArrowRotateLeft, FaUserCheck } from "react-icons/fa6";

import { SyncLoader } from "react-spinners";

  // Assuming `verificationOptions` is an array of possible verification statuses
  const verificationOptions = [
    { value: "VERIFIED", label: "ยืนยันแล้ว" },
    { value: "UNVERIFIED", label: "ยังไม่ยืนยัน" },
  ];
  
const VerifyUserModal = ({ isOpen, user, onClose, onSave, positions, departments, roles }) => {
  const { data: session } = useSession();  // This will give you session data

  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    username: "",
    position: "",
    department: "",
    role: "",
    verification: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    lastname: "",
    email: "",
    username: "",
    position: "",
    department: "",
    role: "",
    verification: "",
  });

  const [showSuccess, setShowSuccess] = useState(false); // To control success modal visibility

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || "",
        lastname: user.lastname || "",
        email: user.email || "",
        telephone: user.telephone || "",
        username: user.username || "",
        position: user.position.position_id || "",
        department: user.department.department_id || "",
        role: user.role || "",
        verification: "VERIFIED",  // force verification to "VERIFIED"
        // verification: user.verification || "",
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

    // Perform real-time validation for the username field
    if (name === 'username') {
      validateUsername(value);
    }

  };

  const handleSelectChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateUsername = (username) => {
    let newErrors = { ...errors };
    if (!username) {
      newErrors.username = "กรุณากรอกชื่อผู้ใช้งาน";
    } else if (!/^[a-z][a-z0-9]*$/.test(username)) {  // Allow lowercase letters followed by optional numbers
      newErrors.username = "ชื่อผู้ใช้งานต้องเริ่มต้นด้วยตัวอักษรเล็กและอาจมีตัวเลขหลังจากนั้น";
    } else {
      newErrors.username = "";  // Clear error if valid
    }
    setErrors(newErrors);
  };

  // Validation function
  const validate = () => {
    let valid = true;
    let newErrors = { ...errors };

    // Validate basic fields
    if (!formData.name) {
      newErrors.name = "กรุณากรอกชื่อ";
      valid = false;
    } else {
      newErrors.name = "";
    }

    if (!formData.lastname) {
      newErrors.lastname = "กรุณากรอกนามสกุล";
      valid = false;
    } else {
      newErrors.lastname = "";
    }

    if (!formData.email) {
      newErrors.email = "กรุณากรอกอีเมล์";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "กรุณากรอกอีเมล์ให้ถูกต้อง";
      valid = false;
    } else {
      newErrors.email = "";
    }

    if (!formData.username) {
      newErrors.username = "กรุณากรอกชื่อผู้ใช้งาน";  // Error message for empty input
      valid = false;
    } 
    // Check if the username starts with a lowercase letter and optionally followed by numbers
    else if (!/^[a-z][a-z0-9]*$/.test(formData.username)) {
      newErrors.username = "ชื่อผู้ใช้งานต้องเริ่มต้นด้วยตัวอักษรเล็กและอาจมีตัวเลขหลังจากนั้น";
      valid = false;
    } else {
      newErrors.username = "";  // Clear the error if username is valid
    }

    // Validate select inputs
    if (!formData.position) {
      newErrors.position = "กรุณาเลือกตำแหน่ง";
      valid = false;
    } else {
      newErrors.position = "";
    }

    if (!formData.department) {
      newErrors.department = "กรุณาเลือกฝ่ายงาน";
      valid = false;
    } else {
      newErrors.department = "";
    }

    if (!formData.role) {
      newErrors.role = "กรุณาเลือกสิทธิ์การใช้งาน";
      valid = false;
    } else {
      newErrors.role = "";
    }

    if (!formData.verification) {
      newErrors.verification = "กรุณาเลือกสถานะการใช้งาน";
      valid = false;
    } else {
      newErrors.verification = "";
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (validate()) {
        // Ensure that position and department are saved with their IDs
        const updatedData = {
            ...formData,
            // Convert position and department names to their respective IDs
            position_id: positions.find((pos) => pos.position_id === formData.position)?.position_id || "",
            department_id: departments.find((dept) => dept.department_id === formData.department)?.department_id || "",
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

          const response = await fetch(`api/verify/${user.employee_id}`, {
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
              setTimeout(() => setShowSuccess(false), 500);
              // setTimeout(() => {setShowSuccess(false); onClose(); }, 800);
          } else {
              // Error: handle the response failure
              setLoading(false); // Ensure loading is set back to false on error
              const errorData = await response.json();
              alert(`Error: ${"Save error ! " + errorData.message}`);
          }
        } catch (error) {
          setLoading(false); // Ensure loading is set back to false on error
          alert("An error occurred while updating the user.");
          console.error(error);
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
          <FaUserCheck className="text-2xl font-semibold mb-1 px-0.5 " />
          <span className="text-lg font-semibold mb-0">ยืนยันผู้ใช้งาน</span>
        </div>
        {loading && (
          <div className="flex flex-row items-center justify-center container mx-auto">
            <span className="mr-3 text-slate-800 text-base">กำลังยืนยันข้อมูล</span>
            <SyncLoader color="gold" />
          </div>
        )}
        <div className="space-y-4">
          {/* Name Input */}
          <Label className="text-slate-700">ชื่อ</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="ชื่อ"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Lastname Input */}
          <Label className="text-slate-700">นามสกุล</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="นามสกุล"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.lastname && <p className="text-red-500 text-sm">{errors.lastname}</p>}
          </div>

          {/* Email Input */}
          <Label className="text-slate-700">อีเมล์</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="อีเมล์"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled //={loading}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Telephone Input */}
          <Label className="text-slate-700">เบอร์โทร <span className="text-slate-700 italic">(มีหรือไม่มีก็ได้)</span></Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="เบอร์โทร"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              disabled={loading}
            />
            {/* {errors.telephone && <p className="text-red-500 text-sm">{errors.telephone}</p>} */}
          </div>

          {/* Username Input */}
          <Label className="text-slate-700">ชื่อผู้ใช้งาน</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="ชื่อผู้ใช้งาน"
              name="username"
              value={formData.username}
              onChange={handleChange}
              pattern="^[a-z][a-z0-9]*$"  // Starts with a lowercase letter and accepts numbers
              title="Username should start with a lowercase letter followed by numbers."
              disabled  //={loading}
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
          </div>

          {/* Select for Position */}
          <Label className="text-slate-700">ตำแหน่ง</Label>
          <div>
            <Select
              value={formData.position}
              onValueChange={(value) => handleSelectChange('position', value)}
              disabled={loading}
            >
              <SelectTrigger className="-mt-3 mb-1">
                <SelectValue placeholder="ตำแหน่ง" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>ตำแหน่ง</SelectLabel>
                  {positions.map((position) => (
                    <SelectItem key={position.position_id} value={position.position_id}>
                      {position.position_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
          </div>

          {/* Select for Department */}
          <Label className="text-slate-700">ฝ่ายงาน</Label>
          <div>
            <Select
              value={formData.department}
              onValueChange={(value) => handleSelectChange('department', value)}
              disabled={loading}
            >
              <SelectTrigger className="-mt-3 mb-1">
                <SelectValue placeholder="ฝ่ายงาน" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>ฝ่ายงาน</SelectLabel>
                  {departments.map((department) => (
                    <SelectItem key={department.department_id} value={department.department_id}>
                      {department.department_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
          </div>

          {/* Select for Role */}
          <Label className="text-slate-700">สิทธิ์การใช้งาน</Label>
          <div>
            <Select
              value={formData.role.toString()}
              onValueChange={(value) => handleSelectChange('role', value)}
              disabled={(user.role === session?.user?.role) && (user.username === session?.user?.username)}
            >
              <SelectTrigger className="-mt-3 mb-1">
                <SelectValue placeholder="สิทธิ์การใช้งาน" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>สิทธิ์การใช้งาน</SelectLabel>
                  {roles.map((role) => (
                    <SelectItem key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
          </div>
          
          {/* Select for Role */}
          <Label className="text-slate-700">สถานะผู้ใช้งาน</Label>
          <div>
            <Select
              value={formData.verification}
              onValueChange={(value) => handleSelectChange('verification', value)}
              disabled={loading}
            >
              <SelectTrigger className="-mt-3 mb-1">
                <SelectValue placeholder="สถานะผู้ใช้งาน" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>สถานะผู้ใช้งาน</SelectLabel>
                    {verificationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.verification && <p className="text-red-500 text-sm">{errors.verification}</p>}
          </div>
          
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <Button variant="outline" onClick={onClose} disabled={loading}><FaArrowRotateLeft />&nbsp;<span className=" text-base">ยกเลิก</span></Button>
          <Button variant="slate_green" onClick={handleSave} disabled={loading}><FaFloppyDisk />&nbsp;<span className=" text-base">บันทึก</span></Button>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[9999]">
            <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
              <h3 className="text-green-700 text-lg font-semibold text-center">
                แก้ไขข้อมูลผู้ใช้งานเรียบร้อยแล้ว
              </h3>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyUserModal;
