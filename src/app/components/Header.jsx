'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AppLogo from '/public/images/logo_bctc_sml.png'
import Link from 'next/link'

function Header() {
  const [currentDateTime, setCurrentDateTime] = useState('');

  // Function to format the date and time as dd/MM/yyyy HH:mm:ss
  const formatDateTime = (date) => {
    const day = String(date.getDate()).padStart(2, '0');  // Ensure two digits
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Months are 0-indexed
    const year = date.getFullYear() + 543;
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  // Update the time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const currentDate = new Date();
      const formattedDateTime = formatDateTime(currentDate);  // Format the date and time
      setCurrentDateTime(formattedDateTime);
    }, 500);

    // Cleanup the interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-row w-100% h-[90px] items-center justify-center bg-blue-800 text-white border-none p-0 m-0" >
        <div className='w-full h-full flex justify-start items-center p-1 m-0 bg-gradient-to-r from-blue-800 via-blue-700 to-blue-600'>
        <Link href='/dashboard'>
          <Image
              src={AppLogo}
              quality={100}
              alt=''
              className="p-1 m-0 ml-1 w-[75px] h-[75px] /* object-cover */"
          />
        </Link>
        <div className='flex flex-row items-center justify-center text-xl text-white font-bold ml-2'>
          ระบบจองห้องประชุมออนไลน์
        </div>
        </div>

        <div className="absolute right-4 top-16 text-white font-semibold">
          {currentDateTime}
        </div>

      </div>
    </>
  );
}

export default Header;