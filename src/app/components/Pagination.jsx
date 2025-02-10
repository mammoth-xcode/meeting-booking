// components/Pagination.js
import { useState } from "react";
import { Button } from "@/components/ui/button"
import { 
  BsBookmarkCheckFill,  
  BsFillQuestionCircleFill, 
  BsBookmarkPlusFill, 
  BsBuildingFillCheck,
  BsFillHouseFill,
  BsFillXSquareFill,
  BsMicrosoft,
  BsShieldShaded,
  BsUiChecksGrid,
  BsPersonFill,
  BsShieldFillCheck,
  BsBuildingsFill,
  BsBuildingFill,
  BsArrowRightSquare,
  BsArrowLeftSquare,
  BsArrowRightCircleFill,
  BsArrowLeftCircleFill
 } from "react-icons/bs";

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    onPageChange(newPage);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="link"
        className="text-3xl text-[#666]"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <BsArrowLeftCircleFill />
      </Button>

      {/* Page Number Buttons */}
      {Array.from({ length: totalPages }, (_, index) => (
        <Button
          key={index}
          variant={currentPage === index + 1 ? "primary" : "outline"}
          onClick={() => handlePageChange(index + 1)}
        >
          {index + 1}
        </Button>
      ))}

      <Button
        variant="link"
        className="text-3xl text-[#666]"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <BsArrowRightCircleFill />
      </Button>
    </div>
  );
};

export default Pagination;
