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
import { FaBook, FaCircleExclamation, FaAddressBook, FaUserPlus, FaFloppyDisk, FaArrowRotateLeft } from "react-icons/fa6";

// Assuming `verificationOptions` is an array of possible verification statuses
const verificationOptions = [
  { value: "VERIFIED", label: "ยืนยันแล้ว" },
  { value: "UNVERIFIED", label: "ยังไม่ยืนยัน" },
];

const RegisterUserModal = ({ isOpen, onClose, onSave, positions, departments, roles }) => {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    position_id: "",
    department_id: "",
    role: "",
    verification: "",
    // employee_id: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    position_id: "",
    department_id: "",
    role: "",
    verification: "",
    // employee_id: "",
  });

  const [showSuccess, setShowSuccess] = useState(false); // To control success modal visibility

  // Regular expression for a strong password
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&,#])[A-Za-z\d@$!%*?&,#]{8,}$/;

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
      newErrors.username = "กรุณากรอกชื่อผู้ใช้งาน";
      valid = false;
    } else {
      newErrors.username = "";
    }

    if (!formData.password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
      valid = false;
    } else if (!passwordPattern.test(formData.password)) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร, รวมทั้งตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข และอักขระพิเศษ";
      valid = false;
    } else {
      newErrors.password = "";
    }
  
    // Validate select inputs
    if (!formData.position_id) {
      newErrors.position_id = "กรุณาเลือกตำแหน่ง";
      valid = false;
    } else {
      newErrors.position_id = "";
    }

    if (!formData.department_id) {
      newErrors.department_id = "กรุณาเลือกฝ่ายงาน";
      valid = false;
    } else {
      newErrors.department_id = "";
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


      
      // // // TODO : check if the user already exists  2024-12-19
      // // First check if the user already exists
      // const userExists = await checkIfExists(formData.email, formData.username);
      
      // if (userExists) {
      //   alert("ผู้ใช้งานนี้มีอยู่แล้วในระบบ (Email or Username already exists).");
      //   return;
      // }


  
      // If user doesn't exist, proceed with saving the data
      const updatedData = { ...formData };
  
      try {
        const response = await fetch('api/users', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });
  
        if (response.ok) {
          onSave(updatedData);
          setShowSuccess(true);
  
          setTimeout(() => {
            setShowSuccess(false);
            onClose();
          }, 500);
        } else {
          const errorData = await response.json();
          alert(`Error: ${"Save error! " + errorData.message}`);
        }
      } catch (error) {
        alert("An error occurred while adding the user.");
        console.error(error);
      }
    } else {
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
      <div className="bg-white p-6 rounded-lg w-96">
        <div className="container mx-auto px-0 mb-4 flex items-center justify-start">
          <FaUserPlus />&nbsp;
          <span className="text-lg font-semibold mb-0">เพิ่มผู้ใช้งานใหม่</span>
        </div>
        <div className="space-y-4">
          {/* Name Input */}
          <Label className="text-slate-500">ชื่อ</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="ชื่อ"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* Lastname Input */}
          <Label className="text-slate-500">นามสกุล</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="นามสกุล"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
            />
            {errors.lastname && <p className="text-red-500 text-sm">{errors.lastname}</p>}
          </div>

          {/* Email Input */}
          <Label className="text-slate-500">อีเมล์</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="อีเมล์"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Telephone Input */}
          <Label className="text-slate-500">เบอร์โทร <span className="text-slate-700 italic">(ไม่จำเป็น)</span></Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="เบอร์โทร"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
            />
            {/* {errors.telephone && <p className="text-red-500 text-sm">{errors.telephone}</p>} */}
          </div>

          {/* Username Input */}
          <Label className="text-slate-500">ชื่อผู้ใช้งาน</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="ชื่อผู้ใช้งาน"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
          </div>
            
          {/* Password Input */}
          <Label className="text-slate-500">รหัสผ่าน</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="รหัสผ่าน"
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          {/* Select for Position */}
          <Label className="text-slate-500">ตำแหน่ง</Label>
          <div>
            <Select
              value={formData.position_id}
              onValueChange={(value) => handleSelectChange('position_id', value)}
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
            {errors.position_id && <p className="text-red-500 text-sm">{errors.position_id}</p>}
          </div>

          {/* Select for Department */}
          <Label className="text-slate-500">ฝ่ายงาน</Label>
          <div>
            <Select
              value={formData.department_id}
              onValueChange={(value) => handleSelectChange('department_id', value)}
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
            {errors.department_id && <p className="text-red-500 text-sm">{errors.department_id}</p>}
          </div>

          {/* Select for Role */}
          <Label className="text-slate-500">สิทธิ์การใช้งาน</Label>
          <div>
            <Select
              value={formData.role}
              onValueChange={(value) => handleSelectChange('role', value)}
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
          
          {/* Select for Verification */}
          <Label className="text-slate-500">สถานะผู้ใช้งาน</Label>
          <div>
            <Select
              value={formData.verification}
              onValueChange={(value) => handleSelectChange('verification', value)}
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
          <Button variant="outline" onClick={onClose}><FaArrowRotateLeft />&nbsp;ยกเลิก</Button>
          <Button variant="slate_green" onClick={handleSave}><FaFloppyDisk />&nbsp;บันทึก</Button>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
              <h3 className="text-green-600 text-lg font-semibold text-center">
                เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว
              </h3>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default RegisterUserModal;
