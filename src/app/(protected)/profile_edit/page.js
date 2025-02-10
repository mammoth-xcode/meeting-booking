'use client';  // Add this line at the very top of the file

import { AccountVerification, UserRole } from '@prisma/client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FaUserPlus, FaUserPen, FaFloppyDisk, FaArrowRotateLeft, FaPencil, FaUserCheck, FaUser } from 'react-icons/fa6'
import { SyncLoader } from 'react-spinners'
import Menu from '../../components/Menu'
import Footer from '../../components/Footer'

const verificationOptions = [
  { value: 'VERIFIED', label: 'ยืนยันแล้ว' },
  { value: 'UNVERIFIED', label: 'ยังไม่ยืนยัน' }
]

export default function ProfileEditPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    username: '',
    password: '',
    position_id: '',
    department_id: '',
  })
  const [errors, setErrors] = useState({
    name: '',
    lastname: '',
    email: '',
    username: '',
    password: '',
    position_id: '',
    department_id: '',
  })

  const [showSuccess, setShowSuccess] = useState(false)

  // Regular expression for a strong password
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&,#])[A-Za-z\d@$!%*?&,#]{8,}$/;

  useEffect(() => {
    const loadPositionData = async () => {
    setLoading(true);
    try {
        const responsePosition = await fetch('/api/positions');
        const dataPosition = await responsePosition.json();
        setPositions(dataPosition);
        // console.log("Loaded positions:", dataPosition); // Add this for debugging
    } catch (error) {
        console.error("Error fetching positions data:", error);
    } finally {
        setLoading(false);
    }
    };

    loadPositionData();

}, []);

useEffect(() => {
    const loadDepartmentData = async () => {
    setLoading(true);
    try {
        const responseDepartment = await fetch('/api/departments');
        const dataDepartment = await responseDepartment.json();
        setDepartments(dataDepartment);
        // console.log("Loaded departments:", dataDepartment); // Add this for debugging
    } catch (error) {
        console.error("Error fetching departments data:", error);
    } finally {
        setLoading(false);
    }
    };

    loadDepartmentData();

}, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Handle the scenario when account is unverified
  if (session?.user?.verification === AccountVerification.UNVERIFIED || !session) {
    signOut({
      callbackUrl:
        '/?' +
        'username=' +
        session?.user?.username.toLowerCase() +
        '&' +
        'account_verified=' +
        AccountVerification.UNVERIFIED.toLowerCase()
    })
  }

  // Set initial form data when modal opens
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session?.user?.name || '',
        lastname: session?.user?.lastname || '',
        email: session?.user?.email || '',
        username: session?.user?.username || '',
        password: session?.user?.password || '',
        position_id: session?.user?.position_id || '',
        department_id: session?.user?.department_id || ''
      })
    }
  }, [session])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }))
  }

  const validate = () => {
    let valid = true
    let newErrors = { ...errors }

    if (!formData.name) {
      newErrors.name = 'กรุณากรอกชื่อ'
      valid = false
    } else {
      newErrors.name = ''
    }

    if (!formData.lastname) {
      newErrors.lastname = 'กรุณากรอกนามสกุล'
      valid = false
    } else {
      newErrors.lastname = ''
    }

    if (!formData.email) {
      newErrors.email = 'กรุณากรอกอีเมล์'
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'กรุณากรอกอีเมล์ให้ถูกต้อง'
      valid = false
    } else {
      newErrors.email = ''
    }

    if (!formData.username) {
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้งาน'
      valid = false
    } else if (!/^[a-z][a-z0-9]*$/.test(formData.username)) {
      newErrors.username = 'ชื่อผู้ใช้งานต้องเริ่มต้นด้วยตัวอักษรเล็กและอาจมีตัวเลขหลังจากนั้น'
      valid = false
    } else {
      newErrors.username = ''
    }

    // if (!formData.password) {
    //   newErrors.password = "กรุณากรอกรหัสผ่าน";
    //   valid = false;
    // } else if (!passwordPattern.test(formData.password)) {
    //   newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร, รวมทั้งตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข และอักขระพิเศษ";
    //   valid = false;
    // } else {
    //   newErrors.password = "";
    // }

    if (!formData.position_id) {
      newErrors.position_id = 'กรุณาเลือกตำแหน่ง'
      valid = false
    } else {
      newErrors.position_id = ''
    }

    if (!formData.department_id) {
      newErrors.department_id = 'กรุณาเลือกฝ่ายงาน'
      valid = false
    } else {
      newErrors.department_id = ''
    }

    setErrors(newErrors)
    return valid
  }

  const handleSave = async () => {
    if (validate()) {
      // Ensure that position and department are saved with their IDs
      const updatedData = {
          ...formData,
      };

      // // Log updated data for debugging
      // console.log("Updated Data: ", "Updated.");

      try {
        setLoading(true); // Set loading to true when request starts

        // Check if user and employee_id are valid
        if (!session || !session.user?.employee_id) {
            alert("User ID is missing");
            return;
        }
        
        const response = await fetch(`/api/users-edit/${session?.user?.employee_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),  // Send updated data as JSON
        });

        if (response.ok) {
          // Success: invoke the onSave callback
          setLoading(false);  // Set loading to false when request is successful
          setShowSuccess(true);  // Show success modal
          
          // Hide success modal after 1 second
          setTimeout(() => setShowSuccess(false), 3000);

          // // check password change or not
          // if(formData.password){
          //   // password changed , Logout
          //   router.push('/logout');
          // }

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
  }

  return (
    <div className="flex w-screen h-[100dvh] items-center justify-center bg-slate-50 border-slate-300 border-none">
      {status === 'authenticated' && session?.user?.verification === AccountVerification.VERIFIED && (
        <>
          <Menu />
          <div className="max-w-[400px] w-full h-auto bg-white backdrop-blur-md p-6 rounded-md shadow-xl border-slate-300 border-[1px] mt-[125px]">
            <div className="container mx-auto px-0 mb-1 flex items-center justify-center">
              <FaUserCheck className="text-2xl font-semibold mb-1 px-0.5 " />
              <span className="text-lg font-semibold mb-0 pl-1">แก้ไขข้อมูลผู้ใช้งาน</span>
            </div>
            {/* Name Input */}
            <Label className="text-slate-700">ชื่อ</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className="mb-2"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

            {/* Lastname Input */}
            <Label className="text-slate-700">นามสกุล</Label>
            <Input
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              disabled={loading}
              className="mb-2"
            />
            {errors.lastname && <p className="text-red-500 text-sm">{errors.lastname}</p>}

            {/* Email Input */}
            <Label className="text-slate-700">อีเมล์</Label>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              className="mb-2"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            {/* Username Input */}
            <Label className="text-slate-700">ชื่อผู้ใช้งาน</Label>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled
              className="mb-2"
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}

            {/* Select for Position */}
            <Label className="text-slate-700">ตำแหน่ง</Label>
            <Select
              value={formData.position_id}
              onValueChange={(value) => handleSelectChange('position_id', value)}
              disabled={loading}
              className="mb-2"
            >
              <SelectTrigger className="mb-1">
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

            {/* Select for Department */}
            <Label className="text-slate-700">ฝ่ายงาน</Label>
            <Select
              value={formData.department_id}
              onValueChange={(value) => handleSelectChange('department_id', value)}
              disabled={loading}
              className="mb-2"
            >
              <SelectTrigger className="mb-1">
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

            {/* Password Input :: <span className='text-red-500'> (จำเป็น)</span> */}
            <Label className="text-slate-700">รหัสผ่าน</Label>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="mb-3"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

            {/* Save Button */}
            <div className="flex justify-end space-x-3 mt-4">
              <Button
                variant="outline"
                onClick={() => router.push('/profile')}
                disabled={loading}
              >
                <FaArrowRotateLeft /> ยกเลิก
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-500"
              >
                <FaFloppyDisk /> บันทึก
              </Button>
            </div>

            {/* Success Modal */}
            {showSuccess && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-md z-50">
                <div className="bg-white p-4 rounded-lg shadow-2xl w-11/12 flex justify-center items-center">
                  <h3 className="text-green-700 text-lg font-semibold text-center">
                    <p>แก้ไขข้อมูลผู้ใช้งานเรียบร้อยแล้ว</p>
                    <p className='text-red-500 text-base'>การเปลี่ยนแปลงจะมีผล เมื่อเข้าสู่ระบบอีกครั้ง</p>
                  </h3>
                </div>
              </div>
            )}
            
          </div>
        </>
      )}
      {status === 'authenticated' && session?.user?.verification !== AccountVerification.VERIFIED && (
        <div className="flex flex-row bg-inherit p-6">
          <span className="mr-3 text-slate-800 text-base font-bold">ตรวจสอบข้อมูล</span>
          <SyncLoader color="gold" size="11px" />
        </div>
      )}
    </div>
  )
}
