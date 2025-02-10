'use client'

import { AccountVerification } from '@prisma/client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSearchParams } from "next/navigation";
import Menu from '../components/Menu'
import Footer from '../components/Footer'
import { SyncLoader } from "react-spinners";
import { 
  BsFill1CircleFill,
  BsFillHouseFill,
  BsFillXSquareFill,
  BsKey,
} from "react-icons/bs";
import { FaArrowRotateLeft, FaFloppyDisk, FaPencil } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

export default function Profile() {
    const { data: session, status } = useSession()
    const [isModalOpen, setIsModalOpen] = useState(false); // State for controlling modal visibility
    const [newPassword, setNewPassword] = useState(""); // State for new password
    const [confirmPassword, setConfirmPassword] = useState(""); // State for confirming new password
    const [showSuccess, setShowSuccess] = useState(false);
    const [passwordChanged, setPasswordChanged] = useState(false);

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
      password: "",
      confirmPassword: "",
      email: "",
    });
  
    const [errors, setErrors] = useState({
      password: "",
      confirmPassword: "",
      email: "",
    });
  
    // Regular expression for a strong password
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&,#])[A-Za-z\d@$!%*?&,#]{8,}$/;
  
    // Validation function
    const validate = () => {
      let valid = true;
      let newErrors = { ...errors };
  
      if (!formData.password) {
        newErrors.password = "กรุณากรอกรหัสผ่าน";
        valid = false;
      } else if (!passwordPattern.test(formData.password)) {
        newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร, รวมทั้งตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข และอักขระพิเศษ";
        valid = false;
      } else {
        newErrors.password = "";
      }
  
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "กรุณากรอกรหัสผ่าน";
        valid = false;
      } else if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = "รหัสผ่านยืนยันไม่ตรงกับรหัสผ่านใหม่";
        valid = false;
      } else {
        newErrors.confirmPassword = "";
      }
  
      setErrors(newErrors);
      return valid;
    }
    
    const router = useRouter()
  
    const searchParams = useSearchParams();
    // callback url.
    const callbackUrl = searchParams.get("callbackUrl") || '/?callbackUrl=/profile'
  
    useEffect(() => {
      if (status === 'unauthenticated') {
        router.push(callbackUrl)
      }
    }, [status, router])
  
    // if account not verified goto login with message.
    if (session?.user?.verification === AccountVerification.UNVERIFIED || !session) {
      signOut({ callbackUrl:
        '/?' +
        'username=' + session?.user?.username.toLowerCase() +
        '&' +
        'account_verified=' + AccountVerification.UNVERIFIED.toLowerCase()
      })
    }

    useEffect(() => {
      // Create an interval that runs every 1 second
      const interval = setInterval(() => {
        if (passwordChanged) {
          // If password has been changed, redirect to the logout page
          router.push('/logout');
        } else {
          if(isModalOpen === true){ setShowSuccess(true) };
        }
      }, 2000); // 1000ms = 1 second
  
      // Cleanup the interval when the component unmounts or the condition changes
      return () => clearInterval(interval);
    }, [passwordChanged, router]);

    const handlePasswordChange = async () => {
      if (validate()) {
        if (newPassword === confirmPassword) {
          try {
            setLoading(true); // Set loading to true when request starts

            console.log(formData.email);
    
            const response = await fetch(`api/user-resets/${session?.user?.employee_id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ password: formData.password }),
            });
    
            const result = await response.json();
    
            if (response.ok) {
              setLoading(false);
              setShowSuccess(true);
              setTimeout(() => {
                setShowSuccess(false);
                router.push('/profile'); // Redirect to home or another page
                setIsModalOpen(false)
                router.push('/logout'); // Logout
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
      } else {
        alert('Passwords do not match!');
      }
      } else {
        console.log('Validation failed');
      }
    };
  
    // Clear input fields when the modal opens
    const openModal = () => {
      // setNewPassword("");  // Clear new password field
      // setConfirmPassword("");  // Clear confirm password field
      // setIsModalOpen(true);  // Open modal

      setFormData({ ...formData, password: "", confirmPassword: "" });
      setIsModalOpen(true);

    };

  // When after loading success and have session, show profile
  return (
    <>
      <div className="flex w-screen h-[100dvh] items-center justify-center bg-slate-50 border-slate-300 border-none">
        {status === 'authenticated' &&
        (
          (session?.user?.verification === AccountVerification.VERIFIED) ?
            <>
              <Menu />
              <div className="max-w-[400px] max-h-[350px] w-full h-[280px] mx-3 p-7 bg-[white] backdrop-blur-md rounded-md shadow-md border-slate-300 border-[1px]">
                <p className='mb-3'>
                  ผู้ใช้งาน, <b>{session?.user?.name} {session?.user?.lastname}</b>
                </p>
                <p className='mb-3'>
                  อีเมล์: <b>{session?.user?.email}</b>
                </p>
                <p className='mb-3'>
                  สิทธิ์การใช้งาน: <b>{session?.user?.role}</b>
                </p>
                <p className='mt-7 mb-4 flex items-center justify-center'>
                  <button
                    onClick={openModal}
                    className="w-full bg-slate-600 text-white py-2.5 rounded my-0 opacity-100 hover:opacity-95"
                  >
                    เปลี่ยนรหัสผ่าน
                  </button>
                </p>
                <div className='flex flex-row space-x-5'>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-blue-600 text-white py-1.5 rounded my-1 opacity-95 hover:opacity-100"
                  >
                    <div className="mx-auto max-w-[100px] w-full px-2 py-1 mb-0 mt-0 flex items-center justify-center">
                      <BsFillHouseFill />&nbsp;หน้าหลัก
                    </div>
                  </button>
                  <button
                    onClick={() => router.push('/logout')}
                    className="w-full bg-red-500 text-white py-1.5 rounded my-1 opacity-95 hover:opacity-100"
                  >
                    <div className="mx-auto px-2 py-0.5 mb-0 mt-0 flex items-center justify-center">
                      <BsFillXSquareFill />&nbsp;ออกจากระบบ
                    </div>
                  </button>
                  {/* Edit profile */}
                  <button
                    onClick={() => router.push('/profile_edit')}
                    className="absolute top-3 right-3 bg-green-600 text-white p-2 rounded-full shadow-lg hover:bg-green-500"
                  >
                    <FaPencil className="text-base font-semibold " />
                  </button>
                </div>

                {/* Success Modal */}
                {showSuccess && (
                  <div className="fixed inset-0 bg-transparent bg-opacity-0 flex items-center justify-center z-[9999]">
                    <div className="bg-green-50 p-4 rounded-lg w-72 flex justify-center items-center shadow-2xl border-slate-200 border-[1px]">
                      <h3 className="text-green-700 text-lg font-semibold text-center">
                        เปลี่ยนรหัสผ่านเรียบร้อยแล้ว
                      </h3>
                    </div>
                  </div>
                )}

                {/* <EditProfileModal
                  isOpen={isEditProfileModalOpen}  // Pass the isOpen state to the modal
                  user={session?.user}  // Pass the user data to the modal
                  onClose={handleCloseModal}  // Pass the close function
                  //onSave={handleSave}  // Pass the save function
                  positions={[session?.user?.position]}  // Example positions
                  departments={session?.user?.department}  // Example departments
                  roles={session?.user?.role}  // Example roles
                /> */}

                {/* Modal for Changing Password */}
                {isModalOpen && (
                  <div className="fixed inset-0 bg-transparent bg-opacity-0 flex items-center justify-center z-50 ">
                    <div className="bg-white px-8 py-6 rounded-md w-full sm:w-[400px] md:w-full shadow-xl max-w-[410px] max-h-screen h-auto border-[1px] border-slate-200 ">
                      <h3 className="flex items-center justify-center text-xl font-bold mb-4"><BsKey className="text-2xl font-semibold mr-1.5" />เปลี่ยนรหัสผ่าน</h3>
                      <p className='mb-3'>
                        ผู้ใช้งาน : <b>{session?.user?.name} {session?.user?.lastname}</b>
                      </p>
                      <div className="mb-4 text-base">
                        <label htmlFor="email" className="block text-base font-medium text-gray-700">อีเมล์</label>
                        <input
                          type="text"
                          id="email"
                          name="email"
                          className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                          value={session?.user?.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="johnwick@gmail.com"
                          disabled
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                      </div>
                      <div className="mb-4 text-base">
                        <label htmlFor="password" className="block text-base font-medium text-gray-700">รหัสผ่านใหม่</label>
                        <input
                          type="password"
                          id="password"
                          name="password"
                          className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="New password"
                          disabled={loading}
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                      </div>
                      <div className="mb-4 text-base">
                        <label htmlFor="confirm-password" className="block text-base font-medium text-gray-700">ยืนยันรหัสผ่านใหม่</label>
                        <input
                          type="password"
                          id="confirm-password"
                          name="confirm-password"
                          className="w-full p-2 mt-1 border border-gray-300 rounded-md"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          placeholder="Confirm new password"
                          disabled={loading}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                      </div>
                      {loading && (
                        <div className="flex flex-row items-center justify-center container mx-auto mb-4">
                          <span className="mr-3 text-slate-800 text-base">กำลังเปลี่ยนรหัสผ่าน</span>
                          <SyncLoader color="gold" />
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" className='h-10' disabled={loading} onClick={() => setIsModalOpen(false)}><FaArrowRotateLeft />&nbsp;<span className=" text-base">ยกเลิก</span></Button>
                        <Button variant="slate_green" className='h-10' disabled={loading} onClick={handlePasswordChange}><FaFloppyDisk />&nbsp;<span className=" text-base">เปลี่ยนรหัสผ่าน</span></Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          : 
            <div className="flex flex-row bg-inherit p-6">
              <span className="mr-3 text-slate-800 text-base font-bold">ตรวจสอบข้อมูล</span><SyncLoader color="gold" size="11px" />
            </div>
        )}
      </div>
    </>
  );
}
