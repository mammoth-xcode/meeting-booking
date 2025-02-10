'use client'

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Menu from '../../components/Menu';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaUserPlus, FaFloppyDisk } from "react-icons/fa6";
import React, { useState } from "react";
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing

import { UserRole } from '@prisma/client';
import { db } from "@/lib/db";

import { SyncLoader } from "react-spinners";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    telephone: "",
    username: "",
    password: "",
    position_id: "PS01", // You might need to adjust based on actual data
    department_id: "DP01", // Same as above
    role: "USER",
    verification: "UNVERIFIED",
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConflict, setShowConflict] = useState(false);
  const [showUndefined, setShowUndefined] = useState(false);
  const [showUnKnown, setShowUnKnown] = useState(false);
  const [showSentEmailError, setSentEmailError] = useState(false);

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&,#])[A-Za-z\d@$!%*?&,#]{8,}$/;

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

  const validate = () => {
    let valid = true;
    let newErrors = {};

    if (!formData.name) {
      newErrors.name = "กรุณากรอกชื่อ";
      valid = false;
    }

    if (!formData.lastname) {
      newErrors.lastname = "กรุณากรอกนามสกุล";
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = "กรุณากรอกอีเมล์";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "กรุณากรอกอีเมล์ให้ถูกต้อง";
      valid = false;
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
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (validate()) {
      try {
        setLoading(true); // Set loading to true when request starts

        const response = await fetch('/api/register', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            name: formData.name,
            lastname: formData.lastname,
            email: formData.email,
            telephone: formData.telephone,
            position_id: formData.position_id,
            department_id: formData.department_id,
            role: formData.role,
            verification: formData.verification,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          setLoading(false);
          setShowSuccess(true);
          setFormData({
            name: "",
            lastname: "",
            email: "",
            elephone: "",
            username: "",
            password: "",
            position_id: "PS01",
            department_id: "DP01",
            role: "USER",
            verification: "UNVERIFIED",
          });

          setTimeout(() => {
            setShowSuccess(false);
            router.push('/'); // Redirect to home or another page
          }, 1000);
        } if (response.status === 409) {
          console.log('Conflict'); // dupplicate
          setLoading(false);
          setShowConflict(true);

          setTimeout(() => {
            setShowConflict(false);
          }, 3000);
        } else {
          if (response.status === 409) {
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

        if (error.status === 409) {
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
      console.log('Validation failed');
    }
  };
  

  return (
    <div className="flex w-screen h-[100dvh] items-center justify-center bg-slate-50">
      <Menu />

      <div className="max-w-[380px] w-full bg-[white] mt-[110px] border-[1px] rounded-md backdrop-blur-md shadow-md border-slate-300">
        <div className="bg-white px-3 py-3 rounded-lg w-auto">
          <div className="container mx-auto px-0 py-0 mb-2 mt-1 flex items-center justify-center">
            <FaUserPlus className="text-2xl font-semibold mb-0.5 px-0.5" />
            <span className="text-lg font-semibold mb-0 px-0.5">ลงทะเบียนผู้ใช้งานระบบ</span>
          </div>
          {loading && (
            <div className="flex flex-row items-center justify-center container mx-auto">
              <span className="mr-3 text-slate-800 text-base">กำลังลงทะเบียนผู้ใช้งานระบบ</span>
              <SyncLoader color="gold" />
            </div>
          )}
          <div className="space-y-0 px-2 py-1">
            <div className="mb-4">
              <div className="mb-2.5">
                <Label className="text-slate-700 text-base">ชื่อ</Label>
              </div>
              <Input
                className="-mt-3 mb-2 px-3 py-5 text-base"
                label="ชื่อ"
                name="name"
                placeholder="John"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="mb-4">
                <div className="mb-2.5">
                  <Label className="text-slate-700 text-base">นามสกุล</Label>
                </div>
                <Input
                  className="-mt-3 mb-2 px-3 py-5 text-base"
                  label="นามสกุล"
                  name="lastname"
                  placeholder="Wick"
                  value={formData.lastname}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.lastname && <p className="text-red-500 text-sm">{errors.lastname}</p>}
              </div>
              <div className="mb-4">
                <div className="mb-2.5">
                    <Label className="text-slate-700 text-base">อีเมล์</Label>
                </div>
                <Input
                  className="-mt-3 mb-2 px-3 py-5 text-base"
                  label="อีเมล์"
                  name="email"
                  placeholder="johnwick@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
              <div className="mb-4">
                <div className="mb-2.5">
                    <Label className="text-slate-700 text-base">เบอร์โทร (มีหรือไม่มีก็ได้)</Label>
                </div>
                <Input
                  className="-mt-3 mb-2 px-3 py-5 text-base"
                  label="เบอร์โทร"
                  name="telephone"
                  placeholder="0801234567"
                  value={formData.telephone}
                  onChange={handleChange}
                  disabled={loading}
                />
                {/* {errors.telephone && <p className="text-red-500 text-sm">{errors.telephone}</p>} */}
              </div>
              <div className="mb-4">
                <div className="mb-2.5">
                  <Label className="text-slate-700 text-base">ชื่อผู้ใช้งาน</Label>
                </div>
                <Input
                  className="-mt-3 mb-2 px-3 py-5 text-base"
                  label="ชื่อผู้ใช้งาน"
                  name="username"
                  placeholder="johnwick"
                  value={formData.username}
                  onChange={handleChange}
                  pattern="^[a-z][a-z0-9]*$"  // Starts with a lowercase letter and accepts numbers
                  title="Username should start with a lowercase letter followed by numbers."
                  disabled={loading}
                />
                {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
              </div>
              <div className="mb-4">
                <div className="mb-2.5">
                  <Label className="text-slate-700 text-base">รหัสผ่าน</Label>
                </div>
                <Input
                  className="-mt-3 mb-1 px-3 py-5 text-base"
                  label="รหัสผ่าน"
                  name="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleChange}
                  type="password"
                  disabled={loading}
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>
          </div>

          <div className="flex justify-center mx-4 mt-3 mb-1 space-x-8">
            <div className="flex flex-row items-center justify-start gap-1 text-slate-800 text-base">
              มีบัญชีแล้ว <a href="/" className="font-bold text-slate-600 hover:text-blue-600">เข้าสู่ระบบ</a>
            </div>
            <Button variant="slate_green" disabled={loading} onClick={handleSave} className="text-base px-3 py-5">
              <FaFloppyDisk />&nbsp;ลงทะเบียน
            </Button>
          </div>

          {/* Success Modal */}
          {showSuccess && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 rounded-md">
              <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
                <h3 className="text-green-700 text-lg font-semibold text-center">
                  ลงทะเบียนเรียบร้อยแล้ว
                </h3>
              </div>
            </div>
          )}

          {/* Conflict Modal */}
          {showConflict && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 rounded-md">
              <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
                <h3 className="text-red-700 text-lg font-semibold text-center">
                  มีบัญชีนี้แล้ว !
                </h3>
              </div>
            </div>
          )}

          {/* Undefine Error Modal */}
          {showUndefined && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 rounded-md">
              <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
                <h3 className="text-red-700 text-lg font-semibold text-center">
                  มีปัญหาที่ระบุได้ยาก !
                </h3>
              </div>
            </div>
          )}

          {/* UnKnown Error Modal */}
          {showUnKnown && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 rounded-md">
              <div className="bg-white p-4 rounded-lg w-72 flex justify-center items-center">
                <h3 className="text-red-700 text-lg font-semibold text-center">
                  มีปัญหาในการเพิ่มข้อมูลผู้ใช้ !
                </h3>
              </div>
            </div>
          )}

          {/* Sent Email Error Modal */}
          {showSentEmailError && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 rounded-md">
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
    </div>
  );
}
