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
import { SyncLoader } from "react-spinners";

// Assuming `verificationOptions` is an array of possible verification statuses
const verificationOptions = [
  { value: "VERIFIED", label: "ยืนยันแล้ว" },
  { value: "UNVERIFIED", label: "ยังไม่ยืนยัน" },
];

const AddUserModal = ({ isOpen, onClose, onSave, positions, departments, roles }) => {

  const [loading, setLoading] = useState(false);
  const [showConflict, setShowConflict] = useState(false);
  const [showUndefined, setShowUndefined] = useState(false);
  const [showUnKnown, setShowUnKnown] = useState(false);
  const [showSentEmailError, setSentEmailError] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    telephone: "",
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
    telephone: "",
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

  // const checkIfExists = async (email, username) => {
  //   try {
  //     const response = await fetch(`api/users/check`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ email, username }),
  //     });
  
  //     const data = await response.json();
  
  //     if (response.ok) {
  //       return data.exists;  // Return whether the user already exists
  //     } else {
  //       alert("Error checking user existence.");
  //       return false;
  //     }
  //   } catch (error) {
  //     alert("Error: Could not check user existence.");
  //     console.error(error);
  //     return false;
  //   }
  // };

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

    // if (!formData.telephone) {
    //   newErrors.telephone = "กรุณากรอกเบอร์โทร";
    //   valid = false;
    // } else if (!/^(0\d{9})$/.test(formData.telephone)) {
    //   newErrors.telephone = "กรุณากรอกเบอร์โทรให้ถูกต้อง";
    //   valid = false;
    // } else {
    //   newErrors.telephone = "";
    // }
    
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
      const updatedData = { ...formData};
  
      try {
        setLoading(true); // Set loading to true when request starts

        const response = await fetch('api/users', {
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
    //     } else {
    //       const errorData = await response.json();
    //       alert(`Error: ${"Save error! " + errorData.message}`);
    //     }
    //   } catch (error) {
    //     alert("An error occurred while adding the user.");
    //     console.error(error);
    //   }
    // } else {
    //   console.log('Validation failed');
    // }
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
          <FaUserPlus />&nbsp;
          <span className="text-lg font-semibold mb-0">เพิ่มผู้ใช้งานใหม่</span>
        </div>
        {loading && (
          <div className="flex flex-row items-center justify-center container mx-auto">
            <span className="mr-3 text-slate-800 text-base">กำลังเพิ่มข้อมูล</span>
            <SyncLoader color="gold" />
          </div>
        )}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Telephone Input */}
          <Label className="text-slate-500">เบอร์โทร <span className="text-slate-700 italic">(มีหรือไม่มีก็ได้)</span></Label>
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
          <Label className="text-slate-500">ชื่อผู้ใช้งาน</Label>
          <div>
            <Input
              className="-mt-3 mb-1"
              label="ชื่อผู้ใช้งาน"
              name="username"
              value={formData.username}
              onChange={handleChange}
              pattern="^[a-z][a-z0-9]*$"  // Starts with a lowercase letter and accepts numbers
              title="Username should start with a lowercase letter followed by numbers."
              disabled={loading}
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
              disabled={loading}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          {/* Select for Position */}
          <Label className="text-slate-500">ตำแหน่ง</Label>
          <div>
            <Select
              value={formData.position_id}
              onValueChange={(value) => handleSelectChange('position_id', value)}
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
            {errors.position_id && <p className="text-red-500 text-sm">{errors.position_id}</p>}
          </div>

          {/* Select for Department */}
          <Label className="text-slate-500">ฝ่ายงาน</Label>
          <div>
            <Select
              value={formData.department_id}
              onValueChange={(value) => handleSelectChange('department_id', value)}
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
            {errors.department_id && <p className="text-red-500 text-sm">{errors.department_id}</p>}
          </div>

          {/* Select for Role */}
          <Label className="text-slate-500">สิทธิ์การใช้งาน</Label>
          <div>
            <Select
              value={formData.role}
              onValueChange={(value) => handleSelectChange('role', value)}
              disabled={loading}
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
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
              <h3 className="text-green-700 text-lg font-semibold text-center">
                เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว
              </h3>
            </div>
          </div>
        )}
        
        {/* Conflict Modal */}
        {showConflict && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
              <h3 className="text-red-700 text-lg font-semibold text-center">
                มีบัญชีนี้แล้ว !
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
                มีปัญหาในการเพิ่มข้อมูลผู้ใช้ !
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

export default AddUserModal;
