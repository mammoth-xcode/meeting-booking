'use client'

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Menu from '../../components/Menu';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaBook, FaCircleExclamation, FaAddressBook, FaUserPlus, FaUserPen, FaFloppyDisk, FaArrowRotateLeft, FaPassport } from "react-icons/fa6";
import { BsArrowUpCircleFill, BsKey } from "react-icons/bs";
import React, { useState } from "react";
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing

import { UserRole } from '@prisma/client';
import { db } from "@/lib/db";

import { SyncLoader } from "react-spinners";

export default function ResetPassPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEmailNotFound, setshowEmailNotFound] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const validate = () => {
    let valid = true;
    let newErrors = {};

    if (!email) {
      newErrors.email = "กรุณากรอกอีเมล์";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "กรุณากรอกอีเมล์ให้ถูกต้อง";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleResetPassword = async () => {
    if (validate()) {
      try {
        setLoading(true); // Set loading to true when request starts

        const response = await fetch(`api/user-reset`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const result = await response.json();

        if (response.ok) {
          setLoading(false);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            router.push('/'); // Redirect to home or another page
          }, 2000);
        } else {
          // alert('Error: ' + result.error);
          setLoading(false);
          setshowEmailNotFound(true);
          setTimeout(() => {
            setshowEmailNotFound(false);
          }, 2000);
        }
      } catch (error) {
        console.error(error);
        alert('An error occurred while sending the email.');
      }
    }
  };

  return (
    <>
      <Menu />
      <div className="flex w-screen h-[100dvh] items-center justify-center bg-white">
        <div className="max-w-screen w-full h-screen bg-transparent backdrop-blur-md p-6 rounded-md shadow-md border-slate-300 border-[0px]">
          <div className="fixed inset-0 bg-slate-50 bg-opacity-100 flex items-center justify-center z-50">
            <div className="bg-white w-96 border-[1px] border-slate-200 backdrop-blur-md p-6 rounded-md shadow-md">
              <div className="container mx-auto px-0 mb-4 flex items-center justify-start">
                <BsKey className="text-2xl font-semibold mb-1 px-0.5" />
                <span className="text-lg font-semibold mb-0">รีเซ็ตรหัสผ่าน</span>
              </div>
              {loading && (
                <div className="flex flex-row items-center justify-center container mx-auto">
                  <span className="mr-3 text-slate-800 text-base">กำลังรีเซ็ตรหัสผ่าน</span>
                  <SyncLoader color="gold" />
                </div>
              )}
              <div className="space-y-4">
                <Label className="text-slate-700">อีเมล์</Label>
                <div>
                  <Input
                    className="-mt-3 mb-1"
                    label="อีเมล์"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="johnwick@gmail.com"
                    disabled={loading}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-4">
                <Button variant="outline" disabled={loading} onClick={() => router.push('/')}>
                  <FaArrowRotateLeft /> ยกเลิก
                </Button>
                <Button variant="slate_sky" disabled={loading} onClick={handleResetPassword}>
                  <FaFloppyDisk /> รีเซ็ตรหัสผ่าน
                </Button>
              </div>

              {/* Success Modal */}
              {showSuccess && (
                <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-[9999]">
                  <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
                    <h3 className="text-green-700 text-lg font-semibold text-center">
                      รีเซ็ตรหัสผ่านเรียบร้อยแล้ว
                    </h3>
                  </div>
                </div>
              )}

              {/* Not found Modal */}
              {showEmailNotFound && (
                <div className="fixed inset-0 bg-black bg-opacity-10 flex flex-row items-center justify-center z-[9999]">
                  <div className="bg-white p-4 rounded-md w-[95%] flex justify-center items-center">
                    <h3 className="text-red-700 text-lg font-semibold text-center">
                      <p>อีเมล์นี้ยังไม่ได้ลงทะเบียนใช้งาน !</p>
                      <p className='text-slate-700'>กรุณาลงทะเบียนใช้งาน เพื่อเข้าสู่ระบบ.</p>
                    </h3>
                    <br />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // const [formData, setFormData] = useState({
  //   name: "",
  //   lastname: "",
  //   email: "",
  //   telephone: "",
  //   username: "",
  //   password: "",
  //   position_id: "PS00", // You might need to adjust based on actual data
  //   department_id: "DP00", // Same as above
  //   role: "USER",
  //   verification: "UNVERIFIED",
  // });

  // const [errors, setErrors] = useState({});
  // const [showSuccess, setShowSuccess] = useState(false);

  // const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&,#])[A-Za-z\d@$!%*?&,#]{8,}$/;

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: value,
  //   }));

  //   // Perform real-time validation for the username field
  //   if (name === 'username') {
  //     validateUsername(value);
  //   }

  // };

  // const validateUsername = (username) => {
  //   let newErrors = { ...errors };
  //   if (!username) {
  //     newErrors.username = "กรุณากรอกชื่อผู้ใช้งาน";
  //   } else if (!/^[a-z][a-z0-9]*$/.test(username)) {  // Allow lowercase letters followed by optional numbers
  //     newErrors.username = "ชื่อผู้ใช้งานต้องเริ่มต้นด้วยตัวอักษรเล็กและอาจมีตัวเลขหลังจากนั้น";
  //   } else {
  //     newErrors.username = "";  // Clear error if valid
  //   }
  //   setErrors(newErrors);
  // };

  // const validate = () => {
  //   let valid = true;
  //   let newErrors = {};

  //   if (!formData.name) {
  //     newErrors.name = "กรุณากรอกชื่อ";
  //     valid = false;
  //   }

  //   if (!formData.lastname) {
  //     newErrors.lastname = "กรุณากรอกนามสกุล";
  //     valid = false;
  //   }

  //   if (!formData.email) {
  //     newErrors.email = "กรุณากรอกอีเมล์";
  //     valid = false;
  //   } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
  //     newErrors.email = "กรุณากรอกอีเมล์ให้ถูกต้อง";
  //     valid = false;
  //   }

  //   // if (!formData.telephone) {
  //   //   newErrors.telephone = "กรุณากรอกเบอร์โทร";
  //   //   valid = false;
  //   // } else if (!/^(0\d{9})$/.test(formData.telephone)) {
  //   //   newErrors.telephone = "กรุณากรอกเบอร์โทรให้ถูกต้อง";
  //   //   valid = false;
  //   // } else {
  //   //   newErrors.telephone = "";
  //   // }
    
  //   if (!formData.username) {
  //     newErrors.username = "กรุณากรอกชื่อผู้ใช้งาน";  // Error message for empty input
  //     valid = false;
  //   } 
  //   // Check if the username starts with a lowercase letter and optionally followed by numbers
  //   else if (!/^[a-z][a-z0-9]*$/.test(formData.username)) {
  //     newErrors.username = "ชื่อผู้ใช้งานต้องเริ่มต้นด้วยตัวอักษรเล็กและอาจมีตัวเลขหลังจากนั้น";
  //     valid = false;
  //   } else {
  //     newErrors.username = "";  // Clear the error if username is valid
  //   }

  //   if (!formData.password) {
  //     newErrors.password = "กรุณากรอกรหัสผ่าน";
  //     valid = false;
  //   } else if (!passwordPattern.test(formData.password)) {
  //     newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร, รวมทั้งตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข และอักขระพิเศษ";
  //     valid = false;
  //   }

  //   setErrors(newErrors);
  //   return valid;
  // };

  // const handleSave = async () => {
  //   if (validate()) {
  //     try {
  //       const response = await fetch('/api/register', {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           username: formData.username,
  //           password: formData.password,
  //           name: formData.name,
  //           lastname: formData.lastname,
  //           email: formData.email,
  //           telephone: formData.telephone,
  //           position_id: formData.position_id,
  //           department_id: formData.department_id,
  //           role: formData.role,
  //           verification: formData.verification,
  //         }),
  //       });

  //       const result = await response.json();

  //       if (response.ok) {
  //         setShowSuccess(true);
  //         setFormData({
  //           name: "",
  //           lastname: "",
  //           email: "",
  //           elephone: "",
  //           username: "",
  //           password: "",
  //           position_id: "PS00",
  //           department_id: "DP00",
  //           role: "USER",
  //           verification: "VERIFIED",
  //         });

  //         setTimeout(() => {
  //           setShowSuccess(false);
  //           router.push('/'); // Redirect to home or another page
  //         }, 1000);
  //       } else {
  //         alert('Error: ' + result.error);
  //       }
  //     } catch (error) {
  //       console.error(error);
  //       alert('An error occurred while adding the user.');
  //     }
  //   } else {
  //     console.log('Validation failed');
  //   }
  // };
  

  // return (
  //   <div className="flex w-screen h-[100dvh] items-center justify-center bg-white">
  //     <Menu />

  //     <div className="max-w-screen w-full h-screen bg-transparent backdrop-blur-md p-6 rounded-md shadow-md border-slate-300 border-[0px] ">
  //       <div className="fixed inset-0 bg-slate-50 bg-opacity-100 flex items-center justify-center z-50">
  //           <div className="bg-white w-96 border-[1px] border-slate-200 backdrop-blur-md p-6 rounded-md shadow-md">
  //               <div className="container mx-auto px-0 mb-4 flex items-center justify-start">
  //                   <BsKey className="text-2xl font-semibold mb-1 px-0.5 " />
  //                   <span className="text-lg font-semibold mb-0">รีเซ็ตรหัสผ่าน</span>
  //               </div>
  //           <div className="space-y-4">
  //               <Label className="text-slate-700">อีเมล์</Label>
  //               <div>
  //               <Input
  //                   className="-mt-3 mb-1"
  //                   label="อีเมล์"
  //                   name="email"
  //                   value={formData.email}
  //                   onChange={handleChange}
  //                   placeholder='johnwick@gmail.com'
  //               />
  //               {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
  //               </div>
  //           </div>
    
  //           <div className="flex justify-end mt-6 space-x-4">
  //               <Button variant="outline" onClick={() => router.push('/')}><FaArrowRotateLeft />&nbsp;ยกเลิก</Button>
  //               <Button variant="slate_sky" ><FaFloppyDisk />&nbsp;รีเซ็ต</Button>
  //           </div>
    
  //           {/* Success Modal */}
  //           {showSuccess && (
  //               <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[9999]">
  //               <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
  //                   <h3 className="text-green-700 text-lg font-semibold text-center">
  //                     รีเซ็ตรหัสผ่านเรียบร้อยแล้ว
  //                   </h3>
  //               </div>
  //               </div>
  //           )}
    
  //           </div>
  //       </div>
  //     </div>

  //   </div>
  // );
}
