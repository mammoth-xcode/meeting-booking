'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
// import Image from 'next/image';
// import NoImg from '../images/no_image.gif';
import Menu from '../components/Menu';
// import Footer from '../components/Footer';
import EditUserModal from "../components/EditUserModal";
import VerifyUserModal from "../components/VerifyUserModal";
import ResetUserPasswordModal from "../components/ResetUserPasswordModal";
import AddUserModal from "../components/AddUserModal";
import { FaBook, FaCircleExclamation, FaAddressBook, FaUserPlus, FaUserMinus, FaArrowRotateLeft, FaPencil, FaRegTrashCan, FaCheck, FaElementor, FaHouseUser, FaIdCardClip, FaCircleCheck  } from "react-icons/fa6";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  Button,
} from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { BsArrowUpCircleFill, BsKey } from "react-icons/bs";
import { UserRole } from "@prisma/client";

import { useSession } from "next-auth/react";

import { SyncLoader } from "react-spinners";

// Confirmation Modal Component for Deleting User
const ConfirmationModal = ({ isOpen, onConfirm, onCancel, userName }) => {
  if (!isOpen) return null;

  const displayUserName = userName || 'ไม่พบชื่อผู้ใช้';

  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-96">
        <div className="container mx-auto px-0 mb-4 flex items-center justify-start">
          <FaAddressBook />&nbsp;
          <b>ลบผู้ใช้งานนี้ ?</b>
        </div>
        <p className="mb-4">{displayUserName}</p>
        {loading && (
          <div className="flex flex-row items-center justify-center container mx-auto z-[9999]">
            <span className="mr-3 text-slate-800 text-base">กำลังลบผู้ใช้งาน</span>
            <SyncLoader color="gold" />
          </div>
        )}
        <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}><FaArrowRotateLeft />&nbsp;<span className=" text-base">ยกเลิก</span></Button>
        <Button variant="destructive" onClick={onConfirm} disabled={loading}  className="text-[white]"><FaRegTrashCan />&nbsp;<span className=" text-base">ลบ</span></Button>
        </div>
      </div>
    </div>
  );
};

function UserListPage({ editable }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState("name");
  const [showGoTop, setShowGoTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isUserPassResetModalOpen, setIsUserPassResetModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToVerify, setUserToVerify] = useState(null);
  const [userToPassReset, setUserToPassReset] = useState(null);
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  const { data: session } = useSession();  // This will give you session data

  const router = useRouter()
  
  useEffect(() => {
    const loadPositionData = async () => {
      setLoading(true);
      try {
        const responsePosition = await fetch('/api/positions');
        const dataPosition = await responsePosition.json();
        setPositions(dataPosition);
      } catch (error) {
        console.error("Error fetching positions data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    const intervalId = setInterval(() => {
        loadPositionData();
    }, 1000 * 10);
  
    loadPositionData();
  
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const loadDepartmentData = async () => {
      setLoading(true);
      try {
        const responseDepartment = await fetch('/api/departments');
        const dataDepartment = await responseDepartment.json();
        setDepartments(dataDepartment);
      } catch (error) {
        console.error("Error fetching departments data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    const intervalId = setInterval(() => {
        loadDepartmentData();
    }, 1000 * 10);
  
    loadDepartmentData();
  
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const loadRoleData = async () => {
      setLoading(true);
      try {
        const responseRole = await fetch('/api/roles');
        const dataRole = await responseRole.json();
        setRoles(dataRole);
      } catch (error) {
        console.error("Error fetching roles data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    const intervalId = setInterval(() => {
        loadRoleData();
    }, 1000 * 1);
  
    loadRoleData();
  
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isModalOpen || isEditModalOpen || isVerifyModalOpen || isUserPassResetModalOpen || isAddModalOpen) {
      document.body.style.overflow = 'hidden'; // Disable scrolling
    } else {
      document.body.style.overflow = ''; // Re-enable scrolling
    }

    return () => {
      document.body.style.overflow = ''; // Reset overflow on unmount
    };
  }, [isModalOpen, isEditModalOpen, isVerifyModalOpen, isUserPassResetModalOpen, isAddModalOpen]);

  // Load User data (GET Request)
  useEffect(() => {
    const loadUsersData = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users data:", error);
      } finally {
        setLoading(false);
      }
    };

    const intervalId = setInterval(() => {
      loadUsersData();
    }, 1000 * 1);

    loadUsersData();

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // console.log(users);

  const handleEdit = (user) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleVerify = (user) => {
    setUserToVerify(user);
    setIsVerifyModalOpen(true);
  };

  const handlePassReset = (user) => {
    setUserToPassReset(user);
    setIsUserPassResetModalOpen(true);
  };

  const handleSave = (updatedUser) => {
    const updatedUsers = users.map((user) =>
      user.employee_id === updatedUser.employee_id ? updatedUser : user
    );
    setUsers(updatedUsers);
    setIsEditModalOpen(false);
  };
  
  const handleVerifySave = (updatedUser) => {
    const updatedUsers = users.map((user) =>
      user.employee_id === updatedUser.employee_id ? updatedUser : user
    );
    setUsers(updatedUsers);
    setIsVerifyModalOpen(false);
  };
  
  const handlePassResetSave = (updatedUser) => {
    const updatedUsers = users.map((user) =>
      user.employee_id === updatedUser.employee_id ? updatedUser : user
    );
    setUsers(updatedUsers);
    setIsUserPassResetModalOpen(false);
  };
  
   const handleClose = () => {
    setIsEditModalOpen(false); // Close the modal without saving
   };

   // Close modal when Escape key is pressed----------------------------------------------------
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false); // Close the confirmation modal when Escape is pressed
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.removeEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey); // Clean up event listener
    };
  }, [isModalOpen]);
  // End Escape key is pressed----------------------------------------------------
  
  const handleDelete = (user) => {
    setUserToDelete(user);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true); // Set loading to true when request starts

      const response = await fetch(`/api/users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: userToDelete.employee_id,
          email: userToDelete.email,
          username: userToDelete.username,
          name: userToDelete.name,
          lastname: userToDelete.lastname,
        }),
      });
      if (response.ok) {
        setLoading(false); // Set loading to false after successful request
        setUsers(users.filter(user => user.employee_id !== userToDelete.employee_id));
        setIsModalOpen(false);
        setUserToDelete(null);
      } else {
        setLoading(false); // Ensure loading is set back to false on failure
        console.error("Failed to delete user");
      }
    } catch (error) {
      setLoading(false); // Ensure loading is set back to false on error
      console.error("Error deleting user:", error);
    }
  };

  const cancelDelete = () => {
    setIsModalOpen(false);
    setUserToDelete(null);
  };

  const filteredUsers = users.filter((user) => {
    if (searchColumn === "position.position_name") {
      return user.position?.position_name.toLowerCase().includes(search.toLowerCase());
    }
    if (searchColumn === "department.department_name") {
      return user.department?.department_name.toLowerCase().includes(search.toLowerCase());
    }
    return user[searchColumn]?.toString().toLowerCase().includes(search.toLowerCase());
  });


  // Create a mapping between searchColumn keys and user-friendly placeholders
  const placeholderMap = {
    employee_id: 'รหัสผู้ใช้งาน',
    name: 'ชื่อ',
    lastname: 'นามสกุล',
    email: 'อีเมล์',
    username: 'ชื่อผู้ใช้งาน',
    'position.position_name': 'ตำแหน่ง',
    'department.department_name': 'ฝ่ายงาน',
    role: 'สิทธิ์การใช้งาน',
    verification: 'สถานะการใช้งาน',
  };

  // Assuming `verificationOptions` is an array of possible verification statuses
  const verificationOptions = [
    { value: "VERIFIED", label: "ยืนยันแล้ว" },
    { value: "UNVERIFIED", label: "ยังไม่ยืนยัน" },
  ];

  // Get the dynamic placeholder based on searchColumn
  const placeholderText = placeholderMap[searchColumn] || 'ค้นหาผู้ใช้งาน';

  return (
    <div className='flex flex-col items-start mt-[300px] h-dvh'>
      <Menu />
      <div className="container mx-auto px-2 mb-4 flex items-center justify-start">
        <FaAddressBook />&nbsp;
        <b>{`ผู้ใช้งาน :: ${users.length} รายการ`}</b>
      </div>

      <div className="container mx-auto mb-4 px-2 space-x-1 flex items-start">
        <Select defaultValue={searchColumn} onValueChange={(value) => setSearchColumn(value)}>
          <SelectTrigger className="w-[150px] text-base">
            <SelectValue placeholder="ชื่อผู้ใช้งาน" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="text-base">ตัวกรองข้อมูล</SelectLabel>
              <SelectItem className="text-base" value="employee_id">รหัสผู้ใช้งาน</SelectItem>
              <SelectItem className="text-base" value="name">ชื่อ</SelectItem>
              <SelectItem className="text-base" value="lastname">นามสกุล</SelectItem>
              <SelectItem className="text-base" value="email">อีเมล์</SelectItem>
              <SelectItem className="text-base" value="username">ชื่อผู้ใช้งาน</SelectItem>
              <SelectItem className="text-base" value="position.position_name">ตำแหน่ง</SelectItem>
              <SelectItem className="text-base" value="department.department_name">ฝ่ายงาน</SelectItem>
              <SelectItem className="text-base" value="role">สิทธิ์การใช้งาน</SelectItem>
              <SelectItem className="text-base" value="verification">สถานะการใช้งาน</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder={placeholderText}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 flex-1 text-base"
        />

        <Button
          variant="outline"
          onClick={() => setSearch('')}
          className="text-base ml-2"
        >
          <FaArrowRotateLeft />&nbsp;ล้าง
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 w-full max-w-screen-xl container mx-auto px-2">

        <div className="container mx-auto mb-0 space-x-2 flex items-center justify-end">
          <Button
            variant="outline"
            onClick={() => router.push('/department')} // Open modal or navigate to '/department'
            className="flex items-center justify-center text-base"
          >
            <FaHouseUser className="mx-0 text-base px-0" />
            <span className="flex items-center justify-center py-0 px-0 pl-1 mt-0.5">ฝ่ายงาน</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/position')}
            className="flex items-center justify-center text-base"
          >
            <FaIdCardClip className="mx-0 text-base px-0" />
            <span className="flex items-center justify-center py-0 px-0 pl-1 mt-0.5">ตำแหน่ง</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/role')}
            className="flex items-center justify-center text-base"
          >
            <FaCircleCheck className="mx-0 text-base px-0" />
            <span className="flex items-center justify-center py-0 px-0 pl-1 mt-0.5">สิทธิ์</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsAddModalOpen(true)}  // Open modal
            className="flex items-center justify-center text-base"
          >
            <FaUserPlus className="mx-0 text-base px-0" />
            <span className="flex items-center justify-center py-0 px-0 pl-1 mt-0.5">ผู้ใช้</span>
          </Button>
        </div>

        <Table>
          {/* <TableCaption>{`ผู้ใช้งาน :: ${filteredUsers.length} / ${users.length} รายการ`}</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead>ลำดับ</TableHead>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead>อีเมล์</TableHead>
              <TableHead>เบอร์โทร</TableHead>
              <TableHead>ชื่อผู้ใช้งาน</TableHead>
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>ฝ่ายงาน</TableHead>
              <TableHead>สิทธิ์การใช้งาน</TableHead>
              <TableHead>สถานะการใช้งาน</TableHead>
              <TableHead>การจัดการข้อมูล</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user, index) => (
              <TableRow key={user.employee_id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{user.name + ' ' + user.lastname}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.telephone}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.position.position_name}</TableCell>
                <TableCell>{user.department.department_name}</TableCell>
                <TableCell>
                  {
                    roles
                      .filter((role) => role.role_id === user.role.toString())
                      .map((role) => (
                        <span 
                          key={role.role_id}
                          className={role.role_id === 'ADMIN' ? 'text-blue-800 font-semibold' : 'text-slate-800'}
                        >
                          {role.role_name}
                        </span>
                      ))
                  }
                </TableCell>
                <TableCell>
                {
                    verificationOptions
                    .filter((option) => option.value === user.verification)
                    .map((option) => (
                      <span
                        key={option.value}
                        className={`font-semibold ${option.value === 'UNVERIFIED' ? 'text-red-500' : 'text-green-600'}`}
                      >
                        {option.label}
                      </span>
                    ))
                  }
                </TableCell>
                <TableCell>
                  <Button 
                    onClick={() => handleVerify(user)}
                    variant={user.verification === 'VERIFIED' ? 'outline' : 'slate_green'}
                    className="mr-2 px-3 py-2"
                    disabled={user.verification === 'VERIFIED'} // Disabled if already verified
                    data-tip="ยืนยันผู้ใช้งาน"
                  >
                    <TooltipProvider>
                      <Tooltip>
                          <TooltipTrigger><FaCheck /></TooltipTrigger>
                          <TooltipContent>
                            <p>ยืนยันผู้ใช้งาน</p>
                          </TooltipContent>
                          </Tooltip>
                      </TooltipProvider>
                    </Button>
                  <Button 
                    onClick={() => handlePassReset(user)}
                    variant='slate_sky'
                    className="mr-2 px-3 py-2"
                    disabled={user.username === session?.user?.username}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><BsKey /></TooltipTrigger>
                        <TooltipContent>
                          <p>รีเซ็ตรหัสผ่าน</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Button>
                  <Button 
                    onClick={() => handleEdit(user)} 
                    variant="slate_blue"
                    className="mr-2 px-3 py-2"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><FaPencil /></TooltipTrigger>
                        <TooltipContent>
                          <p>แก้ไขผู้ใช้งาน</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Button>
                  <Button 
                    onClick={() => handleDelete(user)} 
                    variant="slate_red" 
                    disabled={user.role === UserRole.ADMIN} // do not delete every records : ADMIN
                    // disabled={(user.role === session?.user?.role) && (user.username === session?.user?.username)} // can delete another ADMIN if not currently logged in
                    // disabled={(user.role === UserRole.ADMIN) && (user.role === session?.user?.role) && (user.username === session?.user?.username)} // can delete another ADMIN if not currently logged in
                    className="text-slate-800 px-3 py-2"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><FaRegTrashCan /></TooltipTrigger>
                        <TooltipContent>
                          <p>ลบผู้ใช้งาน</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showGoTop && (
        <div className="fixed bottom-12 right-3">
          <BsArrowUpCircleFill onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-none text-blue-500 hover:text-blue-500/90 text-4xl font-bold cursor-pointer" />
        </div>
      )}

      <ConfirmationModal 
        isOpen={isModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        userName={userToDelete?.name + ' ' + userToDelete?.lastname}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        user={userToEdit}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
        positions={positions}
        departments={departments}
        roles={roles}
      />

      <VerifyUserModal
        isOpen={isVerifyModalOpen}
        user={userToVerify}
        onClose={() => setIsVerifyModalOpen(false)}
        onSave={handleVerifySave}
        positions={positions}
        departments={departments}
        roles={roles}
      />

      <ResetUserPasswordModal
        isOpen={isUserPassResetModalOpen}
        user={userToPassReset}
        onClose={() => setIsUserPassResetModalOpen(false)}
        onSave={handlePassResetSave}
        positions={positions}
        departments={departments}
        roles={roles}
        email={userToPassReset?.email}  //Optional chaining to prevent errors
      />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
        positions={positions}
        departments={departments}
        roles={roles}
      />

      <div className="w-dvw">
        {/* <Footer /> */}
      </div>
    </div>
  );
}

export default UserListPage;
